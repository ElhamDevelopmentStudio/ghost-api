import { zValidator } from '@hono/zod-validator';
import {
  archiveProjectBodySchema,
  createProjectBodySchema,
  deleteProjectBodySchema,
  projectActivityLogsQuerySchema,
  inviteProjectMemberBodySchema,
  projectInvitePreviewQuerySchema,
  saveEndpointResponseBodySchema,
  updateEndpointConfigBodySchema,
  updateProjectMemberRoleBodySchema,
  updateProjectActivitySettingsBodySchema,
  updateProjectBodySchema,
  updateProjectMockDefaultsBodySchema,
  upsertProjectEnvironmentsBodySchema,
} from '@ghostapi/types';
import { Hono } from 'hono';
import { z } from 'zod';

import { authContext, requireAuth, requireCsrf } from '../auth/index.js';
import type { AppEnv } from '../../server/types.js';
import {
  deleteProjectEndpointResponseForUser,
  listProjectEndpointsForUser,
  saveProjectEndpointResponseForUser,
  updateProjectEndpointConfigForUser,
} from './project-endpoints.service.js';
import {
  clearProjectActivityLogsForUser,
  archiveProjectForUser,
  createProjectForUser,
  deleteProjectForUser,
  deleteProjectEnvironmentForUser,
  getProjectActivityLogForUser,
  getProjectForUser,
  getProjectSchemaForUser,
  listProjectActivityLogsForUser,
  listProjectsForUser,
  ProjectImageAttachmentNotFoundError,
  ProjectSlugConflictError,
  updateProjectForUser,
  updateProjectActivitySettingsForUser,
  updateProjectMockDefaultsForUser,
  resetProjectMockDataForUser,
  upsertProjectEnvironmentsForUser,
} from './projects.service.js';
import {
  inviteProjectMemberForUser,
  listProjectMembersForUser,
  previewProjectInviteForUser,
  ProjectMembersError,
  removeProjectMemberForUser,
  revokeProjectInvitationForUser,
  updateProjectMemberRoleForUser,
} from './project-members.service.js';
import { EmailDeliveryError } from '../auth/auth.email.js';

export const projectsRouter = new Hono<AppEnv>();

projectsRouter.use('*', requireAuth);

const endpointStatusParamSchema = z.object({
  status: z.coerce.number().int().min(100).max(599),
});
const endpointResponseQuerySchema = z.object({
  contentType: z.string().min(1),
});
const projectActivityLogParamSchema = z.object({
  logId: z.string().uuid(),
});
const projectSchemaParamSchema = z.object({
  schemaId: z.string().uuid(),
});
const projectEnvironmentParamSchema = z.object({
  environmentId: z.string().uuid(),
});
const projectMemberParamSchema = z.object({
  memberId: z.string().uuid(),
});
const projectInvitationParamSchema = z.object({
  invitationId: z.string().uuid(),
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

projectsRouter.patch(
  '/:projectId',
  requireCsrf,
  zValidator('json', updateProjectBodySchema),
  async (c) => {
    const { userId } = authContext(c);

    try {
      const project = await updateProjectForUser({
        projectId: c.req.param('projectId'),
        userId,
        input: c.req.valid('json'),
      });

      if (!project) return c.json({ error: 'Project not found' }, 404);
      return c.json({ project });
    } catch (error) {
      if (error instanceof ProjectSlugConflictError) {
        return c.json({ error: error.message }, 409);
      }
      throw error;
    }
  },
);

projectsRouter.get(
  '/:projectId/schemas/:schemaId',
  zValidator('param', projectSchemaParamSchema),
  async (c) => {
    const { userId } = authContext(c);
    const schema = await getProjectSchemaForUser({
      projectId: c.req.param('projectId'),
      userId,
      schemaId: c.req.valid('param').schemaId,
    });

    if (!schema) return c.json({ error: 'Schema not found' }, 404);
    return c.json({ schema });
  },
);

projectsRouter.put(
  '/:projectId/environments',
  requireCsrf,
  zValidator('json', upsertProjectEnvironmentsBodySchema),
  async (c) => {
    const { userId } = authContext(c);
    const result = await upsertProjectEnvironmentsForUser({
      projectId: c.req.param('projectId'),
      userId,
      input: c.req.valid('json'),
    });
    if (!result) return c.json({ error: 'Project not found' }, 404);

    return c.json(result);
  },
);

projectsRouter.delete(
  '/:projectId/environments/:environmentId',
  requireCsrf,
  zValidator('param', projectEnvironmentParamSchema),
  async (c) => {
    const { userId } = authContext(c);
    const result = await deleteProjectEnvironmentForUser({
      projectId: c.req.param('projectId'),
      environmentId: c.req.valid('param').environmentId,
      userId,
    });
    if (!result) return c.json({ error: 'Project not found' }, 404);
    if (!result.deleted && result.reason === 'LAST_ENVIRONMENT') {
      return c.json({ error: 'A project must keep at least one environment' }, 400);
    }
    if (!result.deleted) return c.json({ error: 'Environment not found' }, 404);

    return c.json({ deleted: true });
  },
);

projectsRouter.patch(
  '/:projectId/mock-defaults',
  requireCsrf,
  zValidator('json', updateProjectMockDefaultsBodySchema),
  async (c) => {
    const { userId } = authContext(c);
    const result = await updateProjectMockDefaultsForUser({
      projectId: c.req.param('projectId'),
      userId,
      input: c.req.valid('json'),
    });
    if (!result) return c.json({ error: 'Project not found' }, 404);

    return c.json(result);
  },
);

projectsRouter.get('/:projectId/members', async (c) => {
  const { userId } = authContext(c);
  const result = await listProjectMembersForUser(c.req.param('projectId'), userId);
  if (!result) return c.json({ error: 'Project not found' }, 404);
  return c.json(result);
});

projectsRouter.get(
  '/:projectId/members/invite-preview',
  zValidator('query', projectInvitePreviewQuerySchema),
  async (c) => {
    const { userId } = authContext(c);
    const result = await previewProjectInviteForUser({
      projectId: c.req.param('projectId'),
      userId,
      email: c.req.valid('query').email,
    });
    if (!result) return c.json({ error: 'Project not found' }, 404);
    return c.json(result);
  },
);

projectsRouter.post(
  '/:projectId/members/invitations',
  requireCsrf,
  zValidator('json', inviteProjectMemberBodySchema),
  async (c) => {
    const { userId } = authContext(c);
    try {
      const result = await inviteProjectMemberForUser({
        projectId: c.req.param('projectId'),
        userId,
        ...c.req.valid('json'),
      });
      if (!result) return c.json({ error: 'Project not found' }, 404);
      return c.json(result, 201);
    } catch (error) {
      if (error instanceof ProjectMembersError) {
        return c.json({ error: error.message }, error.status === 409 ? 409 : 400);
      }
      if (error instanceof EmailDeliveryError) {
        return c.json({ error: error.message }, 503);
      }
      throw error;
    }
  },
);

projectsRouter.patch(
  '/:projectId/members/:memberId',
  requireCsrf,
  zValidator('param', projectMemberParamSchema),
  zValidator('json', updateProjectMemberRoleBodySchema),
  async (c) => {
    const { userId } = authContext(c);
    try {
      const member = await updateProjectMemberRoleForUser({
        projectId: c.req.param('projectId'),
        memberId: c.req.valid('param').memberId,
        userId,
        role: c.req.valid('json').role,
      });
      if (!member) return c.json({ error: 'Project member not found' }, 404);
      return c.json({ member });
    } catch (error) {
      if (error instanceof ProjectMembersError) {
        return c.json({ error: error.message }, 400);
      }
      throw error;
    }
  },
);

projectsRouter.delete(
  '/:projectId/members/:memberId',
  requireCsrf,
  zValidator('param', projectMemberParamSchema),
  async (c) => {
    const { userId } = authContext(c);
    try {
      const result = await removeProjectMemberForUser({
        projectId: c.req.param('projectId'),
        memberId: c.req.valid('param').memberId,
        userId,
      });
      if (!result) return c.json({ error: 'Project member not found' }, 404);
      return c.json(result);
    } catch (error) {
      if (error instanceof ProjectMembersError) {
        return c.json({ error: error.message }, 400);
      }
      throw error;
    }
  },
);

projectsRouter.delete(
  '/:projectId/members/invitations/:invitationId',
  requireCsrf,
  zValidator('param', projectInvitationParamSchema),
  async (c) => {
    const { userId } = authContext(c);
    const result = await revokeProjectInvitationForUser({
      projectId: c.req.param('projectId'),
      invitationId: c.req.valid('param').invitationId,
      userId,
    });
    if (!result) return c.json({ error: 'Project invitation not found' }, 404);
    return c.json(result);
  },
);

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

projectsRouter.delete('/:projectId/activity', requireCsrf, async (c) => {
  const { userId } = authContext(c);
  const result = await clearProjectActivityLogsForUser({
    projectId: c.req.param('projectId'),
    userId,
  });
  if (!result) return c.json({ error: 'Project not found' }, 404);

  return c.json(result);
});

projectsRouter.patch(
  '/:projectId/activity/settings',
  requireCsrf,
  zValidator('json', updateProjectActivitySettingsBodySchema),
  async (c) => {
    const { userId } = authContext(c);
    const result = await updateProjectActivitySettingsForUser({
      projectId: c.req.param('projectId'),
      userId,
      activityLogRetentionDays: c.req.valid('json').activityLogRetentionDays,
    });
    if (!result) return c.json({ error: 'Project not found' }, 404);

    return c.json(result);
  },
);

projectsRouter.post('/:projectId/mock-data/reset', requireCsrf, async (c) => {
  const { userId } = authContext(c);
  const result = await resetProjectMockDataForUser({
    projectId: c.req.param('projectId'),
    userId,
  });
  if (!result) return c.json({ error: 'Project not found' }, 404);

  return c.json(result);
});

projectsRouter.patch(
  '/:projectId/archive',
  requireCsrf,
  zValidator('json', archiveProjectBodySchema),
  async (c) => {
    const { userId } = authContext(c);
    const project = await archiveProjectForUser({
      projectId: c.req.param('projectId'),
      userId,
      archived: c.req.valid('json').archived,
    });
    if (!project) return c.json({ error: 'Project not found' }, 404);

    return c.json({ project });
  },
);

projectsRouter.delete(
  '/:projectId',
  requireCsrf,
  zValidator('json', deleteProjectBodySchema),
  async (c) => {
    const { userId } = authContext(c);
    const result = await deleteProjectForUser({
      projectId: c.req.param('projectId'),
      userId,
      confirmation: c.req.valid('json').confirmation,
    });
    if (!result) return c.json({ error: 'Project not found' }, 404);
    if (!result.deleted && result.reason === 'CONFIRMATION_MISMATCH') {
      return c.json({ error: 'Type the project name exactly to delete this project.' }, 400);
    }

    return c.json({ deleted: true });
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

projectsRouter.delete(
  '/:projectId/endpoints/:endpointId/responses/:status',
  requireCsrf,
  zValidator('param', endpointStatusParamSchema),
  zValidator('query', endpointResponseQuerySchema),
  async (c) => {
    const { userId } = authContext(c);
    const endpoint = await deleteProjectEndpointResponseForUser({
      projectId: c.req.param('projectId'),
      endpointId: c.req.param('endpointId'),
      status: c.req.valid('param').status,
      contentType: c.req.valid('query').contentType,
      userId,
    });

    if (!endpoint) return c.json({ error: 'Endpoint not found' }, 404);
    return c.json({ endpoint });
  },
);
