import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Prisma } from '@prisma/client';
import { ProjectMockDefaultsSchema, uploadProjectSchemaBodySchema } from '@ghostapi/types';
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
    const { content, overrideDuplicateEndpoints } = c.req.valid('json');
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
            sizeBytes: Buffer.byteLength(content, 'utf8'),
          },
        },
      });

      const mockDefaults = ProjectMockDefaultsSchema.parse(
        project.mockDefaults && typeof project.mockDefaults === 'object'
          ? project.mockDefaults
          : {},
      );
      const existingEndpoints = await tx.endpoint.findMany({
        where: { projectId },
        select: { id: true, method: true, path: true, config: { select: { id: true } } },
      });
      const existingByKey = new Map(
        existingEndpoints.map((endpoint) => [
          endpointKey(endpoint.method, endpoint.path),
          endpoint,
        ]),
      );
      let addedEndpointCount = 0;
      let updatedEndpointCount = 0;
      let skippedDuplicateCount = 0;

      const endpointCreateData: Prisma.EndpointCreateManyInput[] = [];
      const endpointConfigCreateData: Prisma.EndpointConfigCreateManyInput[] = [];

      for (const ep of normalized.endpoints) {
        const existing = existingByKey.get(endpointKey(ep.method, ep.path));
        const requestSchema = {
          parameters: ep.parameters,
          requestBody: ep.requestBody ?? null,
        };
        const responseSchema = { responses: ep.responses };

        if (existing) {
          if (!overrideDuplicateEndpoints) {
            skippedDuplicateCount += 1;
            continue;
          }

          await tx.endpoint.update({
            where: { id: existing.id },
            data: {
              group: ep.group,
              requestSchema: toJsonInput(requestSchema),
              responseSchema: toJsonInput(responseSchema),
            },
          });
          await tx.endpointConfig.upsert({
            where: { endpointId: existing.id },
            create: {
              endpointId: existing.id,
              latencyMs: mockDefaults.latencyMs,
              statusCode: mockDefaults.statusCode,
              authRequired: ep.authRequired || mockDefaults.authRequired,
              errorChance: mockDefaults.errorChance,
            },
            update: {
              authRequired: ep.authRequired || mockDefaults.authRequired,
            },
          });
          updatedEndpointCount += 1;
          continue;
        }

        const endpointId = crypto.randomUUID();
        endpointCreateData.push({
          id: endpointId,
          projectId,
          method: ep.method,
          path: ep.path,
          group: ep.group,
          requestSchema: toJsonInput(requestSchema),
          responseSchema: toJsonInput(responseSchema),
        });
        endpointConfigCreateData.push({
          endpointId,
          latencyMs: mockDefaults.latencyMs,
          statusCode: mockDefaults.statusCode,
          authRequired: ep.authRequired || mockDefaults.authRequired,
          errorChance: mockDefaults.errorChance,
        });
        existingByKey.set(endpointKey(ep.method, ep.path), {
          id: endpointId,
          method: ep.method,
          path: ep.path,
          config: { id: '' },
        });
        addedEndpointCount += 1;
      }

      if (endpointCreateData.length > 0) {
        await tx.endpoint.createMany({ data: endpointCreateData });
        await tx.endpointConfig.createMany({ data: endpointConfigCreateData });
      }

      return {
        schema,
        endpointCount: normalized.endpoints.length,
        addedEndpointCount,
        updatedEndpointCount,
        skippedDuplicateCount,
      };
    });
    invalidateProjectMockRuntime(projectId);

    return c.json(
      {
        schemaId: result.schema.id,
        version: result.schema.version,
        endpointCount: result.endpointCount,
        addedEndpointCount: result.addedEndpointCount,
        updatedEndpointCount: result.updatedEndpointCount,
        skippedDuplicateCount: result.skippedDuplicateCount,
      },
      201,
    );
  },
);

function endpointKey(method: string, path: string) {
  return `${method.toUpperCase()} ${path}`;
}

function toJsonInput(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
