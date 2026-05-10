import { z } from 'zod';

export const HttpMethodSchema = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]);
export type HttpMethod = z.infer<typeof HttpMethodSchema>;

export const ParameterLocationSchema = z.enum(['path', 'query', 'header', 'cookie']);
export type ParameterLocation = z.infer<typeof ParameterLocationSchema>;

/**
 * A schema-shape descriptor that survives normalization. We deliberately keep
 * this loose (recursive `unknown`) — the parser is responsible for converting
 * raw OpenAPI into something the mock-engine and runtime can introspect, but
 * downstream code must not assume an OpenAPI-specific shape.
 */
export const FieldSchemaSchema: z.ZodType<FieldSchema> = z.lazy(() =>
  z.object({
    type: z.enum(['string', 'number', 'integer', 'boolean', 'array', 'object', 'null', 'unknown']),
    format: z.string().optional(),
    enum: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
    nullable: z.boolean().optional(),
    description: z.string().optional(),
    example: z.unknown().optional(),
    items: FieldSchemaSchema.optional(),
    properties: z.record(z.string(), FieldSchemaSchema).optional(),
    required: z.array(z.string()).optional(),
    /** Arbitrary hints the parser found (e.g. `format: email`, `x-faker: name`). */
    hints: z.record(z.string(), z.unknown()).optional(),
  }),
);

export interface FieldSchema {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null' | 'unknown';
  format?: string;
  enum?: Array<string | number | boolean | null>;
  nullable?: boolean;
  description?: string;
  example?: unknown;
  items?: FieldSchema;
  properties?: Record<string, FieldSchema>;
  required?: string[];
  hints?: Record<string, unknown>;
}

export const ParameterSchema = z.object({
  name: z.string(),
  in: ParameterLocationSchema,
  required: z.boolean().default(false),
  schema: FieldSchemaSchema,
  description: z.string().optional(),
});
export type Parameter = z.infer<typeof ParameterSchema>;

export const RequestBodySchema = z.object({
  contentType: z.string().default('application/json'),
  schema: FieldSchemaSchema,
  required: z.boolean().default(false),
  description: z.string().optional(),
});
export type RequestBody = z.infer<typeof RequestBodySchema>;

export const ResponseSchema = z.object({
  status: z.number().int().min(100).max(599),
  contentType: z.string().default('application/json'),
  schema: FieldSchemaSchema.optional(),
  description: z.string().optional(),
});
export type ResponseDefinition = z.infer<typeof ResponseSchema>;

/**
 * NormalizedEndpoint is the load-bearing abstraction. Every downstream system —
 * runtime, mock-engine, workspace UI, logs — depends ONLY on this shape.
 * Future GraphQL/tRPC parsers must produce the same type so they plug in
 * without rewriting consumers.
 */
export const NormalizedEndpointSchema = z.object({
  /** Stable id, derived from `${method} ${path}` unless the parser overrides. */
  id: z.string(),
  method: HttpMethodSchema,
  /** OpenAPI-style path with `{param}` placeholders, e.g. `/users/{id}`. */
  path: z.string(),
  /** Logical group / tag, used for sidebar grouping. */
  group: z.string().default('default'),
  operationId: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  parameters: z.array(ParameterSchema).default([]),
  requestBody: RequestBodySchema.optional(),
  responses: z.array(ResponseSchema).default([]),
  /** True if at least one security requirement is declared on the operation. */
  authRequired: z.boolean().default(false),
  /** Free-form vendor extensions / parser hints (e.g. `x-ghostapi-deterministic`). */
  extensions: z.record(z.string(), z.unknown()).optional(),
});
export type NormalizedEndpoint = z.infer<typeof NormalizedEndpointSchema>;

export const NormalizedSchemaSchema = z.object({
  /** OpenAPI version used to produce this normalization. */
  sourceFormat: z.literal('openapi-3'),
  /** Original `info.title` / `info.version` for display. */
  title: z.string(),
  version: z.string(),
  /** Servers declared in the source schema, useful for default base-url hints. */
  servers: z.array(z.string()).default([]),
  endpoints: z.array(NormalizedEndpointSchema),
});
export type NormalizedSchema = z.infer<typeof NormalizedSchemaSchema>;
