import type { FieldSchema, ProjectEndpoint } from '@ghostapi/types';

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

export function savedResponseTextForStatus(endpoint: ProjectEndpoint, status: number) {
  const saved = endpoint.savedResponses.find((response) => response.status === status);
  if (saved) return JSON.stringify(saved.body, null, 2);

  const response =
    endpoint.responses.find((item) => item.status === status) ?? endpoint.responses[0];
  if (response?.schema) return JSON.stringify(sampleValue(response.schema, 'response'), null, 2);
  return '{}';
}

function sampleString(schema: FieldSchema, name: string) {
  if (schema.format === 'date-time') return new Date('2026-05-14T00:00:00.000Z').toISOString();
  if (schema.format === 'email') return 'user@example.com';
  if (schema.format === 'uuid') return '00000000-0000-4000-8000-000000000000';
  return name.toLowerCase().includes('id') ? '1' : `sample-${name || 'value'}`;
}
