import type { FieldSchema, ProjectEndpoint, ResponseDefinition } from '@ghostapi/types';
import { isJsonContentType } from './headers';

export function sampleValue(schema: FieldSchema, name: string): unknown {
  if (schema.example !== undefined) return schema.example;
  if (schema.enum?.length) return schema.enum[0] ?? null;

  switch (schema.type) {
    case 'integer':
      return name.toLowerCase().includes('id') ? 1 : 42;
    case 'number':
      return 12.5;
    case 'boolean':
      return true;
    case 'array':
      return [schema.items ? sampleValue(schema.items, name) : 'item'];
    case 'object':
      return Object.fromEntries(
        Object.entries(schema.properties ?? {})
          .slice(0, 12)
          .map(([key, value]) => [key, sampleValue(value, key)]),
      );
    case 'null':
      return null;
    case 'unknown':
      return {};
    case 'string':
    default:
      return sampleString(schema, name);
  }
}

export function savedResponseTextForStatus(
  endpoint: ProjectEndpoint,
  status: number,
  contentType: string,
) {
  const saved = endpoint.savedResponses.find(
    (response) =>
      response.status === status &&
      response.contentType.toLowerCase() === contentType.toLowerCase(),
  );
  if (saved) return bodyText(saved.body, contentType);

  const response =
    endpoint.responses.find((item) => item.status === status) ?? endpoint.responses[0];
  const media = responseMediaTypes(response).find(
    (item) => item.contentType.toLowerCase() === contentType.toLowerCase(),
  );
  if (media?.schema) return bodyText(sampleValue(media.schema, 'response'), contentType);
  return isJsonContentType(contentType) ? '{}' : '';
}

export function responseContentTypesForStatus(endpoint: ProjectEndpoint, status: number) {
  const fromSchema = endpoint.responses
    .filter((response) => response.status === status)
    .flatMap(responseMediaTypes)
    .map((media) => media.contentType);
  const fromSaved = endpoint.savedResponses
    .filter((response) => response.status === status)
    .map((response) => response.contentType);
  return uniqueStrings([...fromSchema, ...fromSaved, 'application/json']);
}

export function preferredResponseContentType(endpoint: ProjectEndpoint, status: number) {
  const options = responseContentTypesForStatus(endpoint, status);
  return options.find(isJsonContentType) ?? options[0] ?? 'application/json';
}

function responseMediaTypes(response: ResponseDefinition | undefined) {
  if (!response) return [];
  return response.mediaTypes?.length
    ? response.mediaTypes
    : [{ contentType: response.contentType, schema: response.schema }];
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function bodyText(body: unknown, contentType: string) {
  if (isJsonContentType(contentType)) return JSON.stringify(body, null, 2);
  return typeof body === 'string' ? body : JSON.stringify(body);
}

function sampleString(schema: FieldSchema, name: string) {
  if (schema.format === 'date-time') return new Date('2026-05-14T00:00:00.000Z').toISOString();
  if (schema.format === 'email') return 'user@example.com';
  if (schema.format === 'uuid') return '00000000-0000-4000-8000-000000000000';
  return name.toLowerCase().includes('id') ? '1' : `sample-${name || 'value'}`;
}
