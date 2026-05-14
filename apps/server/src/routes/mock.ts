import { Hono } from 'hono';
import { buildMockRouter, type MountInput } from '@ghostapi/runtime';
import { prisma } from '../db.js';
import { logger } from '../logger.js';
import { toMountInput, type DbEndpoint } from './mock.mount-input.js';
import { requestLogRetentionCutoff, sanitizeRequestLogEntry } from './request-log-privacy.js';

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
    onLog: async (entry) => {
      const safeLog = sanitizeRequestLogEntry(entry);
      await prisma.requestLog
        .create({
          data: {
            id: safeLog.id,
            projectId,
            endpointId: safeLog.endpointId,
            method: safeLog.method,
            path: safeLog.path,
            status: safeLog.status,
            durationMs: safeLog.durationMs,
            headers: safeLog.headers,
            body: safeLog.body,
            responseHeaders: safeLog.responseHeaders,
            responseContentType: safeLog.responseContentType,
            responseBody: safeLog.responseBody,
          },
        })
        .catch((err) => logger.error({ err }, 'Failed to persist request log'));
      await prisma.requestLog
        .deleteMany({
          where: {
            projectId,
            createdAt: { lt: requestLogRetentionCutoff() },
          },
        })
        .catch((err) => logger.error({ err }, 'Failed to prune request logs'));
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
