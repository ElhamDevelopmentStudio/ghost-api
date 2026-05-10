import { z } from 'zod';

export const EndpointMockConfigSchema = z.object({
  /** Artificial delay in milliseconds before the response is sent. */
  latencyMs: z.number().int().min(0).max(60_000).default(0),
  /** Override status code — when null, the mock engine picks a 2xx from the schema. */
  statusCode: z.number().int().min(100).max(599).nullable().default(null),
  /** Whether this endpoint requires bearer-token auth at the mock runtime. */
  authRequired: z.boolean().default(false),
  /** Probability (0–1) the runtime returns a randomized error response. */
  errorChance: z.number().min(0).max(1).default(0),
});
export type EndpointMockConfig = z.infer<typeof EndpointMockConfigSchema>;

export const ProjectMockDefaultsSchema = EndpointMockConfigSchema;
export type ProjectMockDefaults = EndpointMockConfig;
