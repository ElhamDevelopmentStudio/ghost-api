import { Hono } from 'hono';
import { buildMockRouter } from '@ghostapi/runtime';
import { prisma } from '../db.js';
import { logger } from '../logger.js';
import { loadProjectMockRuntimeInputs } from '../features/projects/mock-runtime-cache.js';
import {
  normalizeActivityLogRetentionDays,
  requestLogRetentionCutoff,
  sanitizeRequestLogEntry,
} from './request-log-privacy.js';

/**
 * Mounts `/mock/:projectId/*` — the public mock-API surface area for each project.
 * Runtime inputs are cached per project and invalidated by schema/config/response mutations.
 */
export const mockRouter = new Hono();

mockRouter.all('/:projectId/*', async (c) => {
  const projectId = c.req.param('projectId');
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, activityLogRetentionDays: true },
  });
  if (!project) return c.json({ error: 'Project not found' }, 404);

  const inputs = await loadProjectMockRuntimeInputs(projectId);
  if (inputs.length === 0) {
    return c.json({ error: 'No endpoints defined for this project yet' }, 404);
  }

  const retentionDays = normalizeActivityLogRetentionDays(project.activityLogRetentionDays);
  const router = buildMockRouter(inputs, {
    onLog:
      retentionDays === 0
        ? undefined
        : async (entry) => {
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
            const cutoff = requestLogRetentionCutoff(retentionDays);
            if (cutoff) {
              await prisma.requestLog
                .deleteMany({
                  where: {
                    projectId,
                    createdAt: { lt: cutoff },
                  },
                })
                .catch((err) => logger.error({ err }, 'Failed to prune request logs'));
            }
          },
  });

  // Strip `/:projectId` from the URL before delegating to the per-project router.
  const url = new URL(c.req.url);
  const mountedPrefix = `/mock/${projectId}`;
  const directPrefix = `/${projectId}`;
  const stripped =
    (url.pathname.startsWith(mountedPrefix)
      ? url.pathname.slice(mountedPrefix.length)
      : url.pathname.slice(directPrefix.length)) || '/';
  const subRequest = new Request(`${url.origin}${stripped}${url.search}`, c.req.raw);
  return router.fetch(subRequest);
});
