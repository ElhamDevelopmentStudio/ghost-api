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

export const projectDetailSchema = projectSummarySchema.extend({
  ownerId: z.string().uuid(),
  environments: z.array(projectEnvironmentSchema),
  schemas: z.array(projectSchemaVersionSchema),
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
