import type { HttpMethod, ProjectEndpoint } from '@ghostapi/types';
import type { HeaderDraft, ParamDraft, RequestDraft } from '../types';
import { effectiveHeaders, isJsonContentType } from './headers';
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

  const bodyContentType = preferredRequestContentType(endpoint);
  const bodyText = endpoint.requestBody ? sampleRequestBodyText(endpoint, bodyContentType) : '';
  const headers = endpoint.requestBody
    ? [
        {
          id: makeId(),
          key: 'Content-Type',
          value: bodyContentType,
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
    bodyContentType,
    bodyText,
    bodyByContentType: bodyContentType ? { [bodyContentType]: bodyText } : {},
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

export function validateRequestBody({
  body,
  method,
  hasBody,
  contentType,
}: {
  body: string;
  method: HttpMethod;
  hasBody: boolean;
  contentType: string;
}) {
  if (!hasBody || !canSendBody(method) || !body.trim()) return null;
  if (!isJsonContentType(contentType)) return null;
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

  const requestBodyText =
    canSendBody(request.method) && request.bodyText.trim() ? request.bodyText : '';
  const requestHeaders = Array.from(headers.entries()).map(([key, value]) => ({ key, value }));
  const startedAt = performance.now();
  const response = await fetch(request.url, {
    method: request.method,
    headers,
    body: requestBodyText || undefined,
  });
  const text = await response.text();
  const responseHeaders = Array.from(response.headers.entries()).map(([key, value]) => ({
    key,
    value,
  }));

  return {
    status: response.status,
    ok: response.ok,
    durationMs: Math.round(performance.now() - startedAt),
    sizeBytes: new Blob([text]).size,
    receivedAt: new Date().toISOString(),
    headers: responseHeaders,
    bodyText: text,
    parsedBody: parseJson(text),
    url: request.url,
    method: request.method,
    requestHeaders,
    requestBodyText,
    requestContentType: headers.get('content-type') ?? '',
    responseContentType: response.headers.get('content-type') ?? '',
    activityLogId: response.headers.get('x-ghostapi-request-log-id'),
  };
}

export function canSendBody(method: HttpMethod) {
  return method !== 'GET' && method !== 'HEAD';
}

export function requestContentTypesForEndpoint(endpoint: ProjectEndpoint) {
  if (!endpoint.requestBody) return [];

  const contentTypes = [
    endpoint.requestBody.contentType,
    ...(endpoint.requestBody.mediaTypes?.map((mediaType) => mediaType.contentType) ?? []),
  ].filter(Boolean);

  return Array.from(new Set(contentTypes));
}

export function preferredRequestContentType(endpoint: ProjectEndpoint) {
  if (!endpoint.requestBody) return 'application/json';
  const contentTypes = requestContentTypesForEndpoint(endpoint);
  return (
    contentTypes.find((contentType) => isJsonContentType(contentType)) ??
    endpoint.requestBody.contentType ??
    contentTypes[0] ??
    'application/json'
  );
}

export function requestSchemaForContentType(endpoint: ProjectEndpoint, contentType: string) {
  if (!endpoint.requestBody) return undefined;
  return (
    endpoint.requestBody.mediaTypes?.find(
      (mediaType) => mediaType.contentType.toLowerCase() === contentType.toLowerCase(),
    )?.schema ?? endpoint.requestBody.schema
  );
}

export function sampleRequestBodyText(endpoint: ProjectEndpoint, contentType: string) {
  const schema = requestSchemaForContentType(endpoint, contentType);
  if (!schema) return '';
  return sampleBodyText(schema, contentType);
}

export function requestHeadersForContentType(headers: HeaderDraft[], contentType: string) {
  let updated = false;
  const nextHeaders = headers.map((header) => {
    if (header.key.trim().toLowerCase() !== 'content-type') return header;
    updated = true;
    return { ...header, value: contentType, enabled: true };
  });

  if (updated) return nextHeaders;
  return [{ id: makeId(), key: 'Content-Type', value: contentType, enabled: true }, ...nextHeaders];
}

function sampleBodyText(
  schema: NonNullable<ProjectEndpoint['requestBody']>['schema'],
  contentType: string,
) {
  const value = sampleValue(schema, 'body');
  if (isJsonContentType(contentType)) return JSON.stringify(value, null, 2);
  if (contentType.toLowerCase().includes('application/x-www-form-urlencoded')) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return new URLSearchParams(
        Object.entries(value).map(([key, item]) => [key, String(item ?? '')]),
      ).toString();
    }
    return String(value ?? '');
  }
  return typeof value === 'string' ? value : JSON.stringify(value);
}
