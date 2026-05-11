import type { OpenAPIHono } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';

import type { AppEnv } from '../server/types.js';

const errorSchema = z
  .object({
    error: z.string(),
    detail: z.string().optional(),
  })
  .openapi('RouteError');

const projectSchema = z
  .object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    icon: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('Project');

export function registerBackendOpenApi(app: OpenAPIHono<AppEnv>): void {
  app.openAPIRegistry.registerPath({
    method: 'get',
    path: '/health',
    tags: ['System'],
    summary: 'Check backend and database health',
    responses: {
      200: {
        description: 'Backend is healthy.',
        content: {
          'application/json': {
            schema: z.object({
              status: z.literal('ok'),
              checks: z.record(z.string()),
            }),
          },
        },
      },
      503: {
        description: 'Backend is reachable but at least one dependency is degraded.',
        content: {
          'application/json': {
            schema: z.object({
              status: z.literal('degraded'),
              checks: z.record(z.string()),
            }),
          },
        },
      },
    },
  });

  app.openAPIRegistry.registerPath({
    method: 'get',
    path: '/projects',
    tags: ['Projects'],
    summary: 'List projects visible to the authenticated user',
    security: [{ accessCookie: [] }],
    responses: {
      200: {
        description: 'Projects owned by or shared with the current user.',
        content: {
          'application/json': {
            schema: z.object({
              projects: z.array(
                projectSchema.pick({
                  id: true,
                  name: true,
                  slug: true,
                  description: true,
                  createdAt: true,
                }),
              ),
            }),
          },
        },
      },
      401: {
        description: 'Missing or invalid auth cookie.',
        content: { 'application/json': { schema: authErrorSchema() } },
      },
    },
  });

  app.openAPIRegistry.registerPath({
    method: 'post',
    path: '/projects',
    tags: ['Projects'],
    summary: 'Create a project for the authenticated user',
    security: [{ accessCookie: [] }],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: z.object({
              name: z.string().min(1).max(100),
              slug: z
                .string()
                .min(1)
                .max(64)
                .regex(/^[a-z0-9][a-z0-9-]*$/),
              description: z.string().max(500).optional(),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Project created. Ownership is derived from the session user.',
        content: { 'application/json': { schema: z.object({ project: projectSchema }) } },
      },
      401: {
        description: 'Missing or invalid auth cookie.',
        content: { 'application/json': { schema: authErrorSchema() } },
      },
    },
  });

  app.openAPIRegistry.registerPath({
    method: 'get',
    path: '/projects/{id}',
    tags: ['Projects'],
    summary: 'Fetch a project visible to the authenticated user',
    security: [{ accessCookie: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      200: {
        description: 'Project detail with environments, recent schemas, and endpoint count.',
        content: { 'application/json': { schema: z.object({ project: z.record(z.unknown()) }) } },
      },
      404: {
        description: 'Project does not exist or is not visible to this user.',
        content: { 'application/json': { schema: errorSchema } },
      },
    },
  });

  app.openAPIRegistry.registerPath({
    method: 'post',
    path: '/projects/{projectId}/schemas',
    tags: ['Schemas'],
    summary: 'Upload and normalize an OpenAPI schema for a project',
    security: [{ accessCookie: [] }],
    request: {
      params: z.object({ projectId: z.string().uuid() }),
      body: {
        required: true,
        content: {
          'application/json': {
            schema: z.object({
              content: z.string().min(1).max(2_000_000),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Schema stored and endpoints replaced atomically.',
        content: {
          'application/json': {
            schema: z.object({
              schemaId: z.string().uuid(),
              version: z.number().int().positive(),
              endpointCount: z.number().int().min(0),
            }),
          },
        },
      },
      400: {
        description: 'Schema is not valid JSON or YAML.',
        content: { 'application/json': { schema: errorSchema } },
      },
      422: {
        description: 'Schema parsed but failed OpenAPI validation.',
        content: {
          'application/json': {
            schema: errorSchema.extend({ issues: z.array(z.unknown()) }),
          },
        },
      },
    },
  });

  app.openAPIRegistry.registerPath({
    method: 'post',
    path: '/mock/{projectId}/{path}',
    tags: ['Mock Runtime'],
    summary: 'Invoke a generated mock endpoint for a project',
    description:
      'The mock runtime accepts any HTTP method and delegates to the dynamic routes generated from the uploaded OpenAPI schema.',
    request: {
      params: z.object({
        projectId: z.string().uuid(),
        path: z.string().openapi({ description: 'Wildcard endpoint path.' }),
      }),
    },
    responses: {
      200: {
        description: 'Generated or saved mock response body.',
        content: { 'application/json': { schema: z.unknown() } },
      },
      401: {
        description: 'Mock endpoint has auth simulation enabled and no bearer token was supplied.',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
      404: {
        description: 'Project or endpoint was not found.',
        content: { 'application/json': { schema: errorSchema } },
      },
    },
  });
}

function authErrorSchema() {
  return z.object({
    success: z.literal(false),
    error: z.object({ message: z.string() }),
  });
}
