import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Prisma } from '@prisma/client';
import { uploadProjectSchemaBodySchema } from '@ghostapi/types';
import { parseSchema, SchemaParseError, SchemaValidationError } from '@ghostapi/parser';
import { prisma } from '../db.js';
import { logger } from '../logger.js';
import { authContext, requireAuth, requireCsrf } from '../features/auth/index.js';
import { invalidateProjectMockRuntime } from '../features/projects/mock-runtime-cache.js';
import type { AppEnv } from '../server/types.js';

export const schemasRouter = new Hono<AppEnv>();

schemasRouter.use('*', requireAuth);

schemasRouter.post(
  '/:projectId/schemas',
  requireCsrf,
  zValidator('json', uploadProjectSchemaBodySchema),
  async (c) => {
    const projectId = c.req.param('projectId');
    const { content } = c.req.valid('json');
    const { userId } = authContext(c);

    let normalized;
    try {
      normalized = await parseSchema(content);
    } catch (err) {
      if (err instanceof SchemaParseError) {
        return c.json({ error: 'Schema is not valid JSON or YAML', detail: err.message }, 400);
      }
      if (err instanceof SchemaValidationError) {
        return c.json({ error: 'Schema failed OpenAPI validation', issues: err.issues }, 422);
      }
      logger.error({ err }, 'Unexpected error parsing schema');
      return c.json({ error: 'Unexpected error parsing schema' }, 500);
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId, role: { in: ['OWNER', 'ADMIN', 'EDITOR'] } } } },
        ],
      },
    });
    if (!project) return c.json({ error: 'Project not found' }, 404);

    // Replace endpoints atomically. Phase 1: full replace on each upload.
    const result = await prisma.$transaction(async (tx) => {
      const lastVersion = await tx.schema.findFirst({
        where: { projectId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      const schema = await tx.schema.create({
        data: {
          projectId,
          version: (lastVersion?.version ?? 0) + 1,
          content: { raw: content },
          metadata: {
            title: normalized.title,
            version: normalized.version,
            endpointCount: normalized.endpoints.length,
          },
        },
      });

      await tx.endpoint.deleteMany({ where: { projectId } });
      for (const ep of normalized.endpoints) {
        await tx.endpoint.create({
          data: {
            projectId,
            method: ep.method,
            path: ep.path,
            group: ep.group,
            requestSchema: {
              parameters: ep.parameters,
              requestBody: ep.requestBody ?? null,
            } as unknown as Prisma.InputJsonValue,
            responseSchema: { responses: ep.responses } as unknown as Prisma.InputJsonValue,
            config: {
              create: {
                authRequired: ep.authRequired,
              },
            },
          },
        });
      }

      return { schema, endpointCount: normalized.endpoints.length };
    });
    invalidateProjectMockRuntime(projectId);

    return c.json(
      {
        schemaId: result.schema.id,
        version: result.schema.version,
        endpointCount: result.endpointCount,
      },
      201,
    );
  },
);
