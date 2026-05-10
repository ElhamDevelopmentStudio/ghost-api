import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { parseSchema, SchemaParseError, SchemaValidationError } from '@ghostapi/parser';
import { prisma } from '../db.js';
import { logger } from '../logger.js';

export const schemasRouter = new Hono();

const uploadSchema = z.object({
  /** OpenAPI document as a string — JSON or YAML, no eval, no execution. */
  content: z.string().min(1).max(2_000_000),
});

schemasRouter.post('/:projectId/schemas', zValidator('json', uploadSchema), async (c) => {
  const projectId = c.req.param('projectId');
  const { content } = c.req.valid('json');

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

  const project = await prisma.project.findUnique({ where: { id: projectId } });
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

  return c.json(
    {
      schemaId: result.schema.id,
      version: result.schema.version,
      endpointCount: result.endpointCount,
    },
    201,
  );
});
