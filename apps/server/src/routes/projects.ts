import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authContext, requireAuth } from '../features/auth/index.js';
import type { AppEnv } from '../server/types.js';

export const projectsRouter = new Hono<AppEnv>();

projectsRouter.use('*', requireAuth);

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'slug must be kebab-case'),
  description: z.string().max(500).optional(),
});

projectsRouter.get('/', async (c) => {
  const { userId } = authContext(c);
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, description: true, createdAt: true },
  });
  return c.json({ projects });
});

projectsRouter.post('/', zValidator('json', createProjectSchema), async (c) => {
  const input = c.req.valid('json');
  const { userId } = authContext(c);
  const project = await prisma.project.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: 'OWNER',
        },
      },
    },
  });
  return c.json({ project }, 201);
});

projectsRouter.get('/:id', async (c) => {
  const { userId } = authContext(c);
  const project = await prisma.project.findUnique({
    where: { id: c.req.param('id') },
    include: {
      members: { where: { userId }, select: { id: true, role: true } },
      environments: true,
      schemas: { orderBy: { uploadedAt: 'desc' }, take: 5 },
      _count: { select: { endpoints: true } },
    },
  });
  if (!project) return c.json({ error: 'Project not found' }, 404);
  if (project.ownerId !== userId && project.members.length === 0) {
    return c.json({ error: 'Project not found' }, 404);
  }
  return c.json({ project });
});
