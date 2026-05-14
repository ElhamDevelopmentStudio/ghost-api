import type { HttpMethod, ProjectEndpoint } from '@ghostapi/types';
import type { HeaderDraft, ParamDraft, RequestDraft } from '../types';
import { effectiveHeaders } from './headers';
import { makeId } from './ids';
import { parseJson } from './json';
import { sampleValue } from './sample-value';

export function endpointRequestDraft(endpoint: ProjectEndpoint, runtimeBase: string): RequestDraft {
  const params = endpoint.parameters
    .filter((parameter) => parameter.in === 'path' || parameter.in === 'query')
    .map<ParamDraft>((parameter) => ({
      id: makeId(),
      name: parameter.name,
      value: String(sampleValue(parameter.schema, parameter.name)),
      enabled: parameter.required || parameter.in === 'path',
      location: parameter.in === 'path' ? 'path' : 'query',
      required: parameter.required,
    }));

  const headerParams = endpoint.parameters
    .filter((parameter) => parameter.in === 'header')
    .map<HeaderDraft>((parameter) => ({
      id: makeId(),
      key: parameter.name,
      value: String(sampleValue(parameter.schema, parameter.name)),
      enabled: parameter.required,
    }));

  const headers = endpoint.requestBody
    ? [
        {
          id: makeId(),
          key: 'Content-Type',
          value: endpoint.requestBody.contentType,
          enabled: true,
        },
        ...headerParams,
      ]
    : headerParams;

  return {
    method: endpoint.method,
    url: buildRequestUrl(runtimeBase, endpoint.path, params),
    params,
    headers,
    bodyText: endpoint.requestBody?.schema
      ? JSON.stringify(sampleValue(endpoint.requestBody.schema, 'body'), null, 2)
      : '',
    auth: {
      mode: endpoint.config.authRequired ? 'bearer' : 'none',
      token: '',
    },
  };
}

export function buildRequestUrl(base: string, path: string, params: ParamDraft[]) {
  let nextPath = path;
  for (const param of params.filter((item) => item.location === 'path')) {
    if (param.name) nextPath = nextPath.replace(`{${param.name}}`, encodeURIComponent(param.value));
  }

  const url = new URL(`${base}${nextPath.startsWith('/') ? nextPath : `/${nextPath}`}`);
  for (const param of params.filter((item) => item.enabled && item.location === 'query')) {
    if (param.name.trim()) url.searchParams.set(param.name.trim(), param.value);
  }
  return url.toString();
}

export function validateJsonBody(body: string, method: HttpMethod, hasBody: boolean) {
  if (!hasBody || !canSendBody(method) || !body.trim()) return null;
  try {
    JSON.parse(body);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Invalid JSON';
  }
}

export async function executePlaygroundRequest({
  request,
  sharedHeaders,
}: {
  request: RequestDraft;
  sharedHeaders: HeaderDraft[];
}) {
  const headers = new Headers();
  for (const header of effectiveHeaders({
    requestHeaders: request.headers,
    sharedHeaders,
  })) {
    headers.set(header.key.trim(), header.value);
  }
  if (request.auth.mode === 'bearer' && request.auth.token.trim()) {
    headers.set('Authorization', `Bearer ${request.auth.token.trim()}`);
  }

  const startedAt = performance.now();
  const response = await fetch(request.url, {
    method: request.method,
    headers,
    body: canSendBody(request.method) && request.bodyText.trim() ? request.bodyText : undefined,
  });
  const text = await response.text();

  return {
    status: response.status,
    ok: response.ok,
    durationMs: Math.round(performance.now() - startedAt),
    sizeBytes: new Blob([text]).size,
    receivedAt: new Date().toISOString(),
    headers: Array.from(response.headers.entries()).map(([key, value]) => ({ key, value })),
    bodyText: text,
    parsedBody: parseJson(text),
    url: request.url,
    method: request.method,
  };
}

export function canSendBody(method: HttpMethod) {
  return method !== 'GET' && method !== 'HEAD';
}
