import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../db.js';

export const projectsRouter = new Hono();

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'slug must be kebab-case'),
  description: z.string().max(500).optional(),
  ownerId: z.string().uuid(),
});

projectsRouter.get('/', async (c) => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, description: true, createdAt: true },
  });
  return c.json({ projects });
});

projectsRouter.post('/', zValidator('json', createProjectSchema), async (c) => {
  const input = c.req.valid('json');
  const project = await prisma.project.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      ownerId: input.ownerId,
    },
  });
  return c.json({ project }, 201);
});

projectsRouter.get('/:id', async (c) => {
  const project = await prisma.project.findUnique({
    where: { id: c.req.param('id') },
    include: {
      environments: true,
      schemas: { orderBy: { uploadedAt: 'desc' }, take: 5 },
      _count: { select: { endpoints: true } },
    },
  });
  if (!project) return c.json({ error: 'Project not found' }, 404);
  return c.json({ project });
});
