import { Hono } from 'hono';
import type { Context } from 'hono';
import type { EndpointMockConfig, NormalizedEndpoint, ResponseDefinition } from '@ghostapi/types';
import { generateMockValue } from '@ghostapi/mock-engine';

import { toHonoPath } from './path.js';
import { errorBody, pickErrorStatus } from './error-pool.js';

export interface MountInput {
  endpoint: NormalizedEndpoint;
  config: EndpointMockConfig;
  /** Optional pre-saved response body to return verbatim. */
  savedBody?: unknown;
  /** Saved response bodies keyed by status and media type. */
  savedResponses?: Array<{ status: number; contentType: string; body: unknown }>;
  /** Stable seed for deterministic generation. Defaults to endpoint id. */
  seed?: string;
}

export interface RequestLogEntry {
  id: string;
  endpointId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  requestHeaders: Record<string, string>;
  requestBody: unknown;
  responseHeaders: Record<string, string>;
  responseContentType: string;
  responseBody: unknown;
  receivedAt: Date;
}

export interface BuildOptions {
  /** Receives a log entry per served request. The host (apps/server) persists. */
  onLog?: (entry: RequestLogEntry) => void | Promise<void>;
  /** Override the auth check. Default: presence of `Authorization: Bearer …`. */
  isAuthorized?: (c: Context) => boolean;
  /** Override the random source for error injection. */
  random?: () => number;
}

/**
 * Build a Hono router that serves all the supplied mock endpoints.
 *
 * The returned router can be mounted under any base path (e.g.
 * `/mock/:projectId`) by the host server.
 */
export function buildMockRouter(inputs: MountInput[], opts: BuildOptions = {}): Hono {
  const router = new Hono();
  const headRouter = new Hono();
  const headInputs: MountInput[] = [];
  const isAuthorized = opts.isAuthorized ?? defaultAuthCheck;
  const random = opts.random ?? Math.random;

  for (const input of inputs) {
    const honoPath = toHonoPath(input.endpoint.path);
    const handler = async (c: Context) =>
      handle(c, input, { isAuthorized, random, onLog: opts.onLog });

    if (input.endpoint.method === 'HEAD') {
      headInputs.push(input);
      headRouter.get(honoPath, handler);
    } else {
      router.on(input.endpoint.method, honoPath, handler);
    }
  }

  const fetch = router.fetch.bind(router);
  router.fetch = async (request, ...rest) => {
    if (request.method !== 'HEAD' || !matchesHeadInput(headInputs, request)) {
      return fetch(request, ...rest);
    }

    const headRequest = new Request(request, { method: 'GET' });
    const response = await headRouter.fetch(headRequest, ...rest);
    return new Response(null, response);
  };

  return router;
}

async function handle(
  c: Context,
  input: MountInput,
  opts: Required<Pick<BuildOptions, 'isAuthorized' | 'random'>> & Pick<BuildOptions, 'onLog'>,
): Promise<Response> {
  const start = Date.now();
  const { endpoint, config, savedBody, seed } = input;

  if (config.authRequired && !opts.isAuthorized(c)) {
    return finish(
      c,
      401,
      responseBody(endpoint, { error: 'Unauthorized' }),
      'application/json',
      opts.onLog,
      input,
      start,
    );
  }

  if (config.errorChance > 0 && opts.random() < config.errorChance) {
    const status = pickErrorStatus(opts.random);
    return finish(
      c,
      status,
      responseBody(endpoint, errorBody(status)),
      'application/json',
      opts.onLog,
      input,
      start,
    );
  }

  if (config.latencyMs > 0) {
    await sleep(config.latencyMs);
  }

  const response = pickResponse(endpoint, config.statusCode);
  const mediaType = pickMediaType(response, c.req.header('accept'));
  const status = response?.status ?? config.statusCode ?? 200;
  const savedResponse = pickSavedResponse(
    input.savedResponses,
    status,
    mediaType,
    c.req.header('accept'),
  );
  const hasKeyedSavedResponses = Boolean(input.savedResponses?.length);
  const contentType = savedResponse?.contentType ?? mediaType?.contentType;
  const body = responseBody(
    endpoint,
    savedResponse
      ? savedResponse.body
      : savedBody !== undefined && !hasKeyedSavedResponses
        ? savedBody
        : mediaType?.schema
          ? generateMockValue(mediaType.schema, { seed: seed ?? endpoint.id })
          : null,
  );

  return finish(c, status, body, contentType, opts.onLog, input, start);
}

function responseBody(endpoint: NormalizedEndpoint, body: unknown): unknown {
  return endpoint.method === 'HEAD' ? null : body;
}

function matchesHeadInput(inputs: MountInput[], request: Request): boolean {
  const pathname = new URL(request.url).pathname;
  return inputs.some((input) => matchesOpenApiPath(input.endpoint.path, pathname));
}

function matchesOpenApiPath(openapiPath: string, pathname: string): boolean {
  const routeSegments = pathSegments(openapiPath);
  const requestSegments = pathSegments(pathname);
  if (routeSegments.length !== requestSegments.length) return false;

  return routeSegments.every((segment, index) => {
    if (segment.startsWith('{') && segment.endsWith('}')) return true;
    return segment === requestSegments[index];
  });
}

function pathSegments(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function pickResponse(
  endpoint: NormalizedEndpoint,
  override: number | null,
): ResponseDefinition | undefined {
  if (override !== null) {
    return endpoint.responses.find((r) => r.status === override);
  }
  return endpoint.responses.find((r) => r.status >= 200 && r.status < 300) ?? endpoint.responses[0];
}

function pickSavedResponse(
  savedResponses: MountInput['savedResponses'] = [],
  status: number,
  mediaType: { contentType: string } | undefined,
  acceptHeader: string | undefined,
) {
  const statusMatches = savedResponses.filter((response) => response.status === status);
  if (!statusMatches.length) return undefined;

  if (mediaType) {
    const exact = statusMatches.find(
      (response) => response.contentType.toLowerCase() === mediaType.contentType.toLowerCase(),
    );
    if (exact) return exact;
  }

  if (acceptHeader) {
    const accepted = acceptHeader
      .split(',')
      .map((item) => item.split(';')[0]?.trim().toLowerCase())
      .filter((item): item is string => Boolean(item));
    const acceptedMatch = statusMatches.find((response) =>
      accepted.some((acceptedType) => mediaTypeMatches(acceptedType, response.contentType)),
    );
    if (acceptedMatch) return acceptedMatch;
  }

  return (
    statusMatches.find((response) => isJsonMediaType(response.contentType)) ?? statusMatches[0]
  );
}

async function finish(
  c: Context,
  status: number,
  body: unknown,
  contentType: string | undefined,
  onLog: BuildOptions['onLog'],
  input: MountInput,
  start: number,
): Promise<Response> {
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((v, k) => {
    headers[k] = v;
  });
  const requestBody = await readRequestBody(c.req.raw);
  const durationMs = Date.now() - start;
  const requestLogId = onLog ? crypto.randomUUID() : null;
  const response = createResponse(c, body, status, contentType);
  if (requestLogId) response.headers.set('x-ghostapi-request-log-id', requestLogId);
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((v, k) => {
    responseHeaders[k] = v;
  });
  if (onLog) {
    await onLog({
      id: requestLogId ?? crypto.randomUUID(),
      endpointId: input.endpoint.id,
      method: input.endpoint.method,
      path: input.endpoint.path,
      status,
      durationMs,
      requestHeaders: headers,
      requestBody,
      responseHeaders,
      responseContentType: response.headers.get('content-type') ?? contentType ?? '',
      responseBody: body,
      receivedAt: new Date(),
    });
  }
  return response;
}

function pickMediaType(response: ResponseDefinition | undefined, acceptHeader: string | undefined) {
  if (!response) return undefined;
  const mediaTypes = response.mediaTypes?.length
    ? response.mediaTypes
    : [{ contentType: response.contentType, schema: response.schema }];
  if (!acceptHeader) return preferredRuntimeMediaType(mediaTypes);

  const accepted = acceptHeader
    .split(',')
    .map((item) => item.split(';')[0]?.trim().toLowerCase())
    .filter((item): item is string => Boolean(item));
  return (
    mediaTypes.find((media) =>
      accepted.some((acceptedType) => mediaTypeMatches(acceptedType, media.contentType)),
    ) ?? preferredRuntimeMediaType(mediaTypes)
  );
}

function preferredRuntimeMediaType<T extends { contentType: string; schema?: unknown }>(
  mediaTypes: T[],
): T | undefined {
  return (
    mediaTypes.find((media) => isJsonMediaType(media.contentType)) ??
    mediaTypes.find((media) => media.schema) ??
    mediaTypes[0]
  );
}

function mediaTypeMatches(accepted: string, offered: string): boolean {
  const normalizedOffered = offered.toLowerCase();
  if (accepted === '*/*') return true;
  if (accepted.endsWith('/*')) return normalizedOffered.startsWith(`${accepted.slice(0, -1)}`);
  return accepted === normalizedOffered;
}

async function readRequestBody(request: Request): Promise<unknown> {
  if (!request.body) return null;

  const contentType = request.headers.get('content-type') ?? '';
  try {
    if (isJsonMediaType(contentType)) return await request.json();
    return await request.text();
  } catch {
    return null;
  }
}

function createResponse(
  c: Context,
  body: unknown,
  status: number,
  contentType = 'application/json',
): Response {
  if (body === null) return c.body(null, status as 200);
  if (isJsonMediaType(contentType)) return c.json(body, status as 200);
  return c.body(serializeBody(body, contentType), status as 200, { 'Content-Type': contentType });
}

function serializeBody(body: unknown, contentType: string): string {
  if (typeof body === 'string') return body;
  if (isFormUrlEncodedMediaType(contentType) && isRecord(body)) {
    const params = Object.entries(body).map(
      ([key, value]) => [key, String(value ?? '')] as [string, string],
    );
    return new URLSearchParams(params).toString();
  }
  return JSON.stringify(body);
}

function isJsonMediaType(contentType: string): boolean {
  return /\bjson\b|\+json\b/i.test(contentType);
}

function isFormUrlEncodedMediaType(contentType: string): boolean {
  return contentType.toLowerCase().includes('application/x-www-form-urlencoded');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function defaultAuthCheck(c: Context): boolean {
  const auth = c.req.header('authorization') ?? c.req.header('Authorization');
  return Boolean(auth && /^Bearer\s+\S+/i.test(auth));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
