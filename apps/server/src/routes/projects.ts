import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authContext, requireAuth, requireCsrf } from '../features/auth/index.js';
import { attachmentThumbnailUrl } from '../features/uploads/upload.urls.js';
import type { AppEnv } from '../server/types.js';

export const projectsRouter = new Hono<AppEnv>();

projectsRouter.use('*', requireAuth);

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'slug must be kebab-case')
    .optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(64).optional(),
  imageAttachmentId: z.string().uuid().optional(),
  baseUrl: z.string().max(250).optional(),
  environment: z.enum(['Development', 'Staging', 'Production']).default('Development'),
});

projectsRouter.get('/', async (c) => {
  const { userId } = authContext(c);
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      members: { where: { userId }, select: { role: true } },
      environments: {
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { name: true, baseUrl: true },
      },
      _count: { select: { endpoints: true, requestLogs: true, members: true } },
    },
  });
  return c.json({ projects: projects.map((project) => serializeProject(project, userId)) });
});

projectsRouter.post('/', requireCsrf, zValidator('json', createProjectSchema), async (c) => {
  const input = c.req.valid('json');
  const { userId } = authContext(c);
  const slug = await uniqueProjectSlug(input.slug ?? input.name);
  const projectIcon = await resolveProjectIcon(input, userId);

  if (projectIcon === false) {
    return c.json({ error: 'Project image attachment not found' }, 404);
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        icon: projectIcon,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        environments: {
          create: {
            name: input.environment,
            baseUrl: input.baseUrl ?? '',
          },
        },
      },
      include: {
        members: { where: { userId }, select: { role: true } },
        environments: { orderBy: { createdAt: 'asc' }, take: 1 },
        _count: { select: { endpoints: true, requestLogs: true, members: true } },
      },
    });

    return c.json({ project: serializeProject(project, userId) }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return c.json({ error: 'A project with this slug already exists' }, 409);
    }

    throw error;
  }
});

async function uniqueProjectSlug(value: string): Promise<string> {
  const baseSlug = slugify(value);
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.project.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

async function resolveProjectIcon(
  input: z.infer<typeof createProjectSchema>,
  userId: string,
): Promise<string | undefined | false> {
  if (!input.imageAttachmentId) return input.icon;

  const attachment = await prisma.attachment.findFirst({
    where: {
      id: input.imageAttachmentId,
      ownerId: userId,
      purpose: 'PROJECT_AVATAR',
      status: 'READY',
    },
  });
  if (!attachment) return false;

  return attachmentThumbnailUrl(attachment) ?? `/uploads/${attachment.id}/file`;
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 58);

  return slug || `project-${Date.now()}`;
}

function serializeProject(
  project: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    ownerId: string;
    members: { role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER' }[];
    environments: { name: string; baseUrl: string }[];
    _count: { endpoints: number; requestLogs: number; members: number };
    createdAt: Date;
    updatedAt: Date;
  },
  userId: string,
) {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    description: project.description,
    icon: project.icon,
    role: project.ownerId === userId ? 'OWNER' : (project.members[0]?.role ?? 'VIEWER'),
    visibility: project._count.members > 1 ? 'Team' : 'Private',
    status: 'Live',
    endpointCount: project._count.endpoints,
    requestCount: project._count.requestLogs,
    environment: project.environments[0] ?? null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

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
