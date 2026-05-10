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
  /** Stable seed for deterministic generation. Defaults to endpoint id. */
  seed?: string;
}

export interface RequestLogEntry {
  endpointId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  requestHeaders: Record<string, string>;
  requestBody: unknown;
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
  const isAuthorized = opts.isAuthorized ?? defaultAuthCheck;
  const random = opts.random ?? Math.random;

  for (const input of inputs) {
    const honoPath = toHonoPath(input.endpoint.path);
    const method = input.endpoint.method.toLowerCase() as
      | 'get'
      | 'post'
      | 'put'
      | 'patch'
      | 'delete';
    if (
      method === 'get' ||
      method === 'post' ||
      method === 'put' ||
      method === 'patch' ||
      method === 'delete'
    ) {
      router[method](honoPath, async (c) =>
        handle(c, input, { isAuthorized, random, onLog: opts.onLog }),
      );
    }
  }

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
    return finish(c, 401, { error: 'Unauthorized' }, opts.onLog, input, start);
  }

  if (config.errorChance > 0 && opts.random() < config.errorChance) {
    const status = pickErrorStatus(opts.random);
    return finish(c, status, errorBody(status), opts.onLog, input, start);
  }

  if (config.latencyMs > 0) {
    await sleep(config.latencyMs);
  }

  const response = pickResponse(endpoint, config.statusCode);
  const status = response?.status ?? config.statusCode ?? 200;
  const body =
    savedBody !== undefined
      ? savedBody
      : response?.schema
        ? generateMockValue(response.schema, { seed: seed ?? endpoint.id })
        : null;

  return finish(c, status, body, opts.onLog, input, start);
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

async function finish(
  c: Context,
  status: number,
  body: unknown,
  onLog: BuildOptions['onLog'],
  input: MountInput,
  start: number,
): Promise<Response> {
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((v, k) => {
    headers[k] = v;
  });
  let requestBody: unknown = null;
  try {
    if (c.req.raw.body) requestBody = await c.req.json();
  } catch {
    requestBody = null;
  }
  const durationMs = Date.now() - start;
  const response = body === null ? c.body(null, status as 200) : c.json(body, status as 200);
  if (onLog) {
    void onLog({
      endpointId: input.endpoint.id,
      method: input.endpoint.method,
      path: input.endpoint.path,
      status,
      durationMs,
      requestHeaders: headers,
      requestBody,
      responseBody: body,
      receivedAt: new Date(),
    });
  }
  return response;
}

function defaultAuthCheck(c: Context): boolean {
  const auth = c.req.header('authorization') ?? c.req.header('Authorization');
  return Boolean(auth && /^Bearer\s+\S+/i.test(auth));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
