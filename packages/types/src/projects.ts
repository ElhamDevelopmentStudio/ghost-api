import { z } from 'zod';

export const projectRoleSchema = z.enum(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']);
export type ProjectRole = z.infer<typeof projectRoleSchema>;

export const projectVisibilitySchema = z.enum(['Private', 'Team']);
export type ProjectVisibility = z.infer<typeof projectVisibilitySchema>;

export const projectStatusSchema = z.enum(['Live', 'Paused']);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectEnvironmentNameSchema = z.enum(['Development', 'Staging', 'Production']);
export type ProjectEnvironmentName = z.infer<typeof projectEnvironmentNameSchema>;

export const projectEnvironmentSummarySchema = z.object({
  name: z.string(),
  baseUrl: z.string(),
});
export type ProjectEnvironmentSummary = z.infer<typeof projectEnvironmentSummarySchema>;

export const projectSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  role: projectRoleSchema,
  visibility: projectVisibilitySchema,
  status: projectStatusSchema,
  endpointCount: z.number().int().nonnegative(),
  requestCount: z.number().int().nonnegative(),
  environment: projectEnvironmentSummarySchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ProjectSummary = z.infer<typeof projectSummarySchema>;

export const projectEnvironmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  baseUrl: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ProjectEnvironment = z.infer<typeof projectEnvironmentSchema>;

export const projectSchemaVersionSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().nonnegative(),
  uploadedAt: z.string().datetime(),
});
export type ProjectSchemaVersion = z.infer<typeof projectSchemaVersionSchema>;

export const projectOverviewTrendPointSchema = z.object({
  date: z.string().date(),
  label: z.string(),
  count: z.number().int().nonnegative(),
});
export type ProjectOverviewTrendPoint = z.infer<typeof projectOverviewTrendPointSchema>;

export const projectOverviewBreakdownItemSchema = z.object({
  label: z.string(),
  count: z.number().int().nonnegative(),
});
export type ProjectOverviewBreakdownItem = z.infer<typeof projectOverviewBreakdownItemSchema>;

export const projectRecentRequestSchema = z.object({
  id: z.string().uuid(),
  method: z.string(),
  path: z.string(),
  status: z.number().int(),
  durationMs: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});
export type ProjectRecentRequest = z.infer<typeof projectRecentRequestSchema>;

export const projectSampleEndpointSchema = z.object({
  method: z.string(),
  path: z.string(),
});
export type ProjectSampleEndpoint = z.infer<typeof projectSampleEndpointSchema>;

export const projectOverviewMetricsSchema = z.object({
  requestTrend: z.array(projectOverviewTrendPointSchema),
  routeMethodBreakdown: z.array(projectOverviewBreakdownItemSchema),
  statusBreakdown: z.array(projectOverviewBreakdownItemSchema),
  averageDurationMs: z.number().int().nonnegative().nullable(),
  recentRequests: z.array(projectRecentRequestSchema),
  sampleEndpoint: projectSampleEndpointSchema.nullable(),
});
export type ProjectOverviewMetrics = z.infer<typeof projectOverviewMetricsSchema>;

export const projectDetailSchema = projectSummarySchema.extend({
  ownerId: z.string().uuid(),
  environments: z.array(projectEnvironmentSchema),
  schemas: z.array(projectSchemaVersionSchema),
  overview: projectOverviewMetricsSchema,
});
export type ProjectDetail = z.infer<typeof projectDetailSchema>;

export const listProjectsResponseSchema = z.object({
  projects: z.array(projectSummarySchema),
});
export type ListProjectsResponse = z.infer<typeof listProjectsResponseSchema>;

export const projectResponseSchema = z.object({
  project: projectSummarySchema,
});
export type ProjectResponse = z.infer<typeof projectResponseSchema>;

export const projectDetailResponseSchema = z.object({
  project: projectDetailSchema,
});
export type ProjectDetailResponse = z.infer<typeof projectDetailResponseSchema>;

export const createProjectBodySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'slug must be kebab-case')
    .optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(64).optional(),
  imageAttachmentId: z.string().uuid().optional(),
  baseUrl: z.string().max(250).optional(),
  environment: projectEnvironmentNameSchema.default('Development'),
});
export type CreateProjectInput = z.input<typeof createProjectBodySchema>;
export type CreateProjectParsed = z.infer<typeof createProjectBodySchema>;

export const uploadProjectSchemaBodySchema = z.object({
  content: z.string().min(1).max(2_000_000),
});
export type UploadProjectSchemaInput = z.infer<typeof uploadProjectSchemaBodySchema>;

export const uploadProjectSchemaResponseSchema = z.object({
  schemaId: z.string().uuid(),
  version: z.number().int().positive(),
  endpointCount: z.number().int().nonnegative(),
});
export type UploadProjectSchemaResponse = z.infer<typeof uploadProjectSchemaResponseSchema>;
