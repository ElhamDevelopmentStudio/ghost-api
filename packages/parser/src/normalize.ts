import type { OpenAPIV3 } from 'openapi-types';
import type {
  FieldSchema,
  HttpMethod,
  MediaTypeDefinition,
  NormalizedEndpoint,
  NormalizedSchema,
  Parameter,
  RequestBody,
  ResponseDefinition,
} from '@ghostapi/types';

const HTTP_METHODS: ReadonlyArray<HttpMethod> = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
];

/**
 * Convert a fully dereferenced OpenAPI 3 document into our NormalizedSchema.
 *
 * Preconditions: the input must already have `$ref`s resolved (the parser
 * pipeline uses swagger-parser for that). We deliberately keep this function
 * pure and synchronous — easier to test, easier to reason about.
 */
export function normalize(doc: OpenAPIV3.Document): NormalizedSchema {
  const endpoints: NormalizedEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(doc.paths ?? {})) {
    if (!pathItem) continue;
    for (const method of HTTP_METHODS) {
      const op = pathItem[method.toLowerCase() as Lowercase<HttpMethod>];
      if (!op) continue;
      endpoints.push(normalizeOperation(method, path, op, pathItem));
    }
  }

  return {
    sourceFormat: 'openapi-3',
    title: doc.info?.title ?? 'Untitled API',
    version: doc.info?.version ?? '0.0.0',
    servers: (doc.servers ?? []).map((s) => s.url).filter((u): u is string => Boolean(u)),
    endpoints,
  };
}

function normalizeOperation(
  method: HttpMethod,
  path: string,
  op: OpenAPIV3.OperationObject,
  pathItem: OpenAPIV3.PathItemObject,
): NormalizedEndpoint {
  const parameters = mergeParameters(pathItem.parameters, op.parameters);
  return {
    id: `${method} ${path}`,
    method,
    path,
    group: op.tags?.[0] ?? 'default',
    operationId: op.operationId,
    summary: op.summary,
    description: op.description,
    parameters: parameters.map(toParameter),
    requestBody: op.requestBody
      ? toRequestBody(op.requestBody as OpenAPIV3.RequestBodyObject)
      : undefined,
    responses: toResponses(op.responses),
    authRequired: Array.isArray(op.security) ? op.security.length > 0 : false,
    extensions: extractExtensions(op as unknown as Record<string, unknown>),
  };
}

function mergeParameters(
  pathLevel: OpenAPIV3.PathItemObject['parameters'],
  opLevel: OpenAPIV3.OperationObject['parameters'],
): OpenAPIV3.ParameterObject[] {
  const all = [...(pathLevel ?? []), ...(opLevel ?? [])] as OpenAPIV3.ParameterObject[];
  // Operation-level overrides path-level when name+in match.
  const seen = new Map<string, OpenAPIV3.ParameterObject>();
  for (const p of all) {
    seen.set(`${p.in}:${p.name}`, p);
  }
  return Array.from(seen.values());
}

function toParameter(p: OpenAPIV3.ParameterObject): Parameter {
  return {
    name: p.name,
    in: p.in as Parameter['in'],
    required: Boolean(p.required),
    description: p.description,
    schema: toFieldSchema((p.schema ?? {}) as OpenAPIV3.SchemaObject),
  };
}

function toRequestBody(body: OpenAPIV3.RequestBodyObject): RequestBody {
  const mediaTypes = toMediaTypes(body.content);
  const primary = preferredMediaType(mediaTypes) ?? {
    contentType: 'application/json',
    schema: { type: 'unknown' } satisfies FieldSchema,
  };
  return {
    contentType: primary.contentType,
    required: Boolean(body.required),
    description: body.description,
    schema: primary.schema ?? { type: 'unknown' },
    mediaTypes,
  };
}

function toResponses(responses: OpenAPIV3.ResponsesObject | undefined): ResponseDefinition[] {
  if (!responses) return [];
  const out: ResponseDefinition[] = [];
  for (const [statusKey, response] of Object.entries(responses)) {
    const status = parseStatus(statusKey);
    if (status === null) continue;
    const r = response as OpenAPIV3.ResponseObject;
    const mediaTypes = toMediaTypes(r.content);
    const primary = preferredMediaType(mediaTypes);
    out.push({
      status,
      contentType: primary?.contentType ?? 'application/json',
      description: r.description,
      schema: primary?.schema,
      mediaTypes,
    });
  }
  return out;
}

function toMediaTypes(
  content: OpenAPIV3.RequestBodyObject['content'] | OpenAPIV3.ResponseObject['content'] = {},
): MediaTypeDefinition[] {
  return Object.entries(content).map(([contentType, media]) => ({
    contentType,
    schema: media.schema ? toFieldSchema(media.schema as OpenAPIV3.SchemaObject) : undefined,
  }));
}

function preferredMediaType(mediaTypes: MediaTypeDefinition[]): MediaTypeDefinition | undefined {
  return (
    mediaTypes.find((media) => isJsonMediaType(media.contentType)) ??
    mediaTypes.find((media) => media.schema) ??
    mediaTypes[0]
  );
}

function isJsonMediaType(contentType: string): boolean {
  return /\bjson\b|\+json\b/i.test(contentType);
}

function parseStatus(key: string): number | null {
  if (key === 'default') return null;
  const n = Number.parseInt(key, 10);
  if (Number.isNaN(n) || n < 100 || n > 599) return null;
  return n;
}

function toFieldSchema(s: OpenAPIV3.SchemaObject): FieldSchema {
  // Treat composed schemas (oneOf/anyOf/allOf) as `unknown` for Phase 1 — the
  // mock-engine can still produce values, just less specifically. Resolving
  // composition properly is a Phase 2 concern.
  if (!s || typeof s !== 'object') {
    return { type: 'unknown' };
  }

  if (s.allOf || s.oneOf || s.anyOf) {
    return { type: 'unknown', hints: { composed: true } };
  }

  const baseType = (s.type ?? 'unknown') as FieldSchema['type'];
  const field: FieldSchema = { type: baseType };

  if (s.format) field.format = s.format;
  if (s.enum) field.enum = s.enum as FieldSchema['enum'];
  if (s.nullable) field.nullable = true;
  if (s.description) field.description = s.description;
  if (s.example !== undefined) field.example = s.example;

  if (baseType === 'array') {
    const arr = s as OpenAPIV3.ArraySchemaObject;
    if (arr.items) {
      field.items = toFieldSchema(arr.items as OpenAPIV3.SchemaObject);
    }
  }

  if (baseType === 'object') {
    const props: Record<string, FieldSchema> = {};
    for (const [name, prop] of Object.entries(s.properties ?? {})) {
      props[name] = toFieldSchema(prop as OpenAPIV3.SchemaObject);
    }
    field.properties = props;
    if (s.required?.length) field.required = s.required;
  }

  const hints = extractExtensions(s as Record<string, unknown>);
  if (hints) field.hints = hints;

  return field;
}

function extractExtensions(obj: Record<string, unknown>): Record<string, unknown> | undefined {
  const ext: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('x-')) ext[k] = v;
  }
  return Object.keys(ext).length ? ext : undefined;
}
