import { zValidator } from '@hono/zod-validator';
import {
  createProjectBodySchema,
  projectActivityLogsQuerySchema,
  saveEndpointResponseBodySchema,
  updateEndpointConfigBodySchema,
} from '@ghostapi/types';
import { Hono } from 'hono';
import { z } from 'zod';

import { authContext, requireAuth, requireCsrf } from '../auth/index.js';
import type { AppEnv } from '../../server/types.js';
import {
  listProjectEndpointsForUser,
  saveProjectEndpointResponseForUser,
  updateProjectEndpointConfigForUser,
} from './project-endpoints.service.js';
import {
  createProjectForUser,
  getProjectActivityLogForUser,
  getProjectForUser,
  listProjectActivityLogsForUser,
  listProjectsForUser,
  ProjectImageAttachmentNotFoundError,
  ProjectSlugConflictError,
} from './projects.service.js';

export const projectsRouter = new Hono<AppEnv>();

projectsRouter.use('*', requireAuth);

const endpointStatusParamSchema = z.object({
  status: z.coerce.number().int().min(100).max(599),
});
const projectActivityLogParamSchema = z.object({
  logId: z.string().uuid(),
});

projectsRouter.get('/', async (c) => {
  const { userId } = authContext(c);
  const projects = await listProjectsForUser(userId);
  return c.json({ projects });
});

projectsRouter.post('/', requireCsrf, zValidator('json', createProjectBodySchema), async (c) => {
  const input = c.req.valid('json');
  const { userId } = authContext(c);

  try {
    const project = await createProjectForUser(input, userId);
    return c.json({ project }, 201);
  } catch (error) {
    if (error instanceof ProjectImageAttachmentNotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof ProjectSlugConflictError) {
      return c.json({ error: error.message }, 409);
    }

    throw error;
  }
});

projectsRouter.get('/:id', async (c) => {
  const { userId } = authContext(c);
  const project = await getProjectForUser(c.req.param('id'), userId);
  if (!project) return c.json({ error: 'Project not found' }, 404);

  return c.json({ project });
});

projectsRouter.get('/:projectId/endpoints', async (c) => {
  const { userId } = authContext(c);
  const endpoints = await listProjectEndpointsForUser(c.req.param('projectId'), userId);
  if (!endpoints) return c.json({ error: 'Project not found' }, 404);

  return c.json({ endpoints });
});

projectsRouter.get(
  '/:projectId/activity',
  zValidator('query', projectActivityLogsQuerySchema),
  async (c) => {
    const { userId } = authContext(c);
    const result = await listProjectActivityLogsForUser({
      projectId: c.req.param('projectId'),
      userId,
      ...c.req.valid('query'),
    });
    if (!result) return c.json({ error: 'Project not found' }, 404);

    return c.json(result);
  },
);

projectsRouter.get(
  '/:projectId/activity/:logId',
  zValidator('param', projectActivityLogParamSchema),
  async (c) => {
    const { userId } = authContext(c);
    const log = await getProjectActivityLogForUser({
      projectId: c.req.param('projectId'),
      userId,
      logId: c.req.valid('param').logId,
    });
    if (!log) return c.json({ error: 'Request log not found' }, 404);

    return c.json({ log });
  },
);

projectsRouter.patch(
  '/:projectId/endpoints/:endpointId/config',
  requireCsrf,
  zValidator('json', updateEndpointConfigBodySchema),
  async (c) => {
    const { userId } = authContext(c);
    const endpoint = await updateProjectEndpointConfigForUser({
      projectId: c.req.param('projectId'),
      endpointId: c.req.param('endpointId'),
      userId,
      input: c.req.valid('json'),
    });

    if (!endpoint) return c.json({ error: 'Endpoint not found' }, 404);
    return c.json({ endpoint });
  },
);

projectsRouter.put(
  '/:projectId/endpoints/:endpointId/responses/:status',
  requireCsrf,
  zValidator('param', endpointStatusParamSchema),
  zValidator('json', saveEndpointResponseBodySchema),
  async (c) => {
    const { userId } = authContext(c);
    const endpoint = await saveProjectEndpointResponseForUser({
      projectId: c.req.param('projectId'),
      endpointId: c.req.param('endpointId'),
      status: c.req.valid('param').status,
      userId,
      input: c.req.valid('json'),
    });

    if (!endpoint) return c.json({ error: 'Endpoint not found' }, 404);
    return c.json({ endpoint });
  },
);
