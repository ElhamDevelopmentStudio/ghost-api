import { zValidator } from '@hono/zod-validator';
import { createProjectBodySchema } from '@ghostapi/types';
import { Hono } from 'hono';

import { authContext, requireAuth, requireCsrf } from '../auth/index.js';
import type { AppEnv } from '../../server/types.js';
import {
  createProjectForUser,
  getProjectForUser,
  listProjectsForUser,
  ProjectImageAttachmentNotFoundError,
  ProjectSlugConflictError,
} from './projects.service.js';

export const projectsRouter = new Hono<AppEnv>();

projectsRouter.use('*', requireAuth);

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
