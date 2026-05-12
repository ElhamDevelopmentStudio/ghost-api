import { Hono } from 'hono';
import { Prisma } from '@prisma/client';
import { buildMockRouter, type MountInput } from '@ghostapi/runtime';
import { prisma } from '../db.js';
import { logger } from '../logger.js';
import { toMountInput, type DbEndpoint } from './mock.mount-input.js';

/**
 * Mounts `/mock/:projectId/*` — the public mock-API surface area for each
 * project. Routes are rebuilt on demand per request to keep the dev path
 * simple; Phase 2 should cache and invalidate via Redis.
 */
export const mockRouter = new Hono();

mockRouter.all('/:projectId/*', async (c) => {
  const projectId = c.req.param('projectId');
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) return c.json({ error: 'Project not found' }, 404);

  const inputs = await loadMountInputs(projectId);
  if (inputs.length === 0) {
    return c.json({ error: 'No endpoints defined for this project yet' }, 404);
  }

  const router = buildMockRouter(inputs, {
    onLog: (entry) => {
      void prisma.requestLog
        .create({
          data: {
            projectId,
            endpointId: entry.endpointId,
            method: entry.method,
            path: entry.path,
            status: entry.status,
            durationMs: entry.durationMs,
            headers: entry.requestHeaders as Prisma.InputJsonValue,
            body:
              entry.requestBody === null || entry.requestBody === undefined
                ? Prisma.JsonNull
                : (entry.requestBody as Prisma.InputJsonValue),
          },
        })
        .catch((err) => logger.error({ err }, 'Failed to persist request log'));
    },
  });

  // Strip `/:projectId` from the URL before delegating to the per-project router.
  const url = new URL(c.req.url);
  const stripped = url.pathname.replace(`/mock/${projectId}`, '') || '/';
  const subRequest = new Request(`${url.origin}${stripped}${url.search}`, c.req.raw);
  return router.fetch(subRequest);
});

async function loadMountInputs(projectId: string): Promise<MountInput[]> {
  const rows = (await prisma.endpoint.findMany({
    where: { projectId },
    include: { config: true, responses: true },
  })) as unknown as DbEndpoint[];

  return rows.map(toMountInput);
}
