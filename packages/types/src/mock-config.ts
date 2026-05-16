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

export const ProjectMockBehaviorSchema = z.object({
  responseMode: z.enum(['smart', 'success', 'client-error', 'server-error']).default('smart'),
  paginationMode: z.enum(['auto', 'cursor', 'page', 'none']).default('auto'),
  dataFreshness: z.enum(['dynamic', 'stable']).default('dynamic'),
  dataSource: z.enum(['smart', 'schema', 'faker']).default('smart'),
  fakerMode: z.boolean().default(true),
  preserveExamples: z.boolean().default(true),
  maxArrayItems: z.number().int().min(1).max(100).default(10),
  stringLength: z.number().int().min(1).max(500).default(20),
  cacheResponses: z.boolean().default(true),
  cacheTtlSeconds: z.number().int().min(1).max(86_400).default(30),
  randomization: z.boolean().default(false),
  errorStatusWeights: z.record(z.string(), z.number().min(0)).default({}),
  customErrorResponses: z.record(z.string(), z.unknown()).default({}),
});
export type ProjectMockBehavior = z.infer<typeof ProjectMockBehaviorSchema>;

export const ProjectMockDefaultsSchema = EndpointMockConfigSchema.merge(ProjectMockBehaviorSchema);
export type ProjectMockDefaults = z.infer<typeof ProjectMockDefaultsSchema>;
