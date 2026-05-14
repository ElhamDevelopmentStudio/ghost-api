import { Prisma } from '@prisma/client';
import type { CreateProjectParsed } from '@ghostapi/types';

import { prisma } from '../../db.js';
import { attachmentThumbnailUrl } from '../uploads/upload.urls.js';
import {
  serializeProjectActivityLog,
  serializeProject,
  serializeProjectDetail,
  serializeProjectOverviewMetrics,
} from './projects.serializers.js';
import { slugifyProjectName } from './projects.utils.js';

export class ProjectImageAttachmentNotFoundError extends Error {
  constructor() {
    super('Project image attachment not found');
    this.name = 'ProjectImageAttachmentNotFoundError';
  }
}

export class ProjectSlugConflictError extends Error {
  constructor() {
    super('A project with this slug already exists');
    this.name = 'ProjectSlugConflictError';
  }
}

export async function listProjectsForUser(userId: string) {
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

  return projects.map((project) => serializeProject(project, userId));
}

export async function createProjectForUser(input: CreateProjectParsed, userId: string) {
  const slug = await uniqueProjectSlug(input.slug ?? input.name);
  const projectIcon = await resolveProjectIcon(input, userId);

  if (projectIcon === false) {
    throw new ProjectImageAttachmentNotFoundError();
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

    return serializeProject(project, userId);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ProjectSlugConflictError();
    }

    throw error;
  }
}

export async function getProjectForUser(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
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
        select: { id: true, name: true, baseUrl: true, createdAt: true, updatedAt: true },
      },
      schemas: {
        orderBy: { uploadedAt: 'desc' },
        take: 5,
        select: { id: true, version: true, uploadedAt: true },
      },
      _count: { select: { endpoints: true, requestLogs: true, members: true } },
    },
  });

  if (!project) return null;
  if (project.ownerId !== userId && project.members.length === 0) return null;

  const overviewWindowStart = new Date();
  overviewWindowStart.setUTCHours(0, 0, 0, 0);
  overviewWindowStart.setUTCDate(overviewWindowStart.getUTCDate() - 6);

  const [recentRequests, windowRequests, routeMethods, sampleEndpoint] = await prisma.$transaction([
    prisma.requestLog.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        method: true,
        path: true,
        status: true,
        durationMs: true,
        createdAt: true,
      },
    }),
    prisma.requestLog.findMany({
      where: {
        projectId,
        createdAt: { gte: overviewWindowStart },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        method: true,
        path: true,
        status: true,
        durationMs: true,
        createdAt: true,
      },
    }),
    prisma.endpoint.findMany({
      where: { projectId },
      orderBy: { method: 'asc' },
      select: { method: true },
    }),
    prisma.endpoint.findFirst({
      where: { projectId, method: 'GET' },
      orderBy: { path: 'asc' },
      select: { method: true, path: true },
    }),
  ]);

  const overview = serializeProjectOverviewMetrics({
    recentRequests,
    windowRequests,
    routeMethodCounts: countRouteMethods(routeMethods),
    sampleEndpoint,
  });

  return serializeProjectDetail(project, userId, overview);
}

export async function listProjectActivityLogsForUser({
  projectId,
  userId,
  method,
  statusClass,
  search,
  range,
  cursor,
  limit,
}: {
  projectId: string;
  userId: string;
  method?: string;
  statusClass?: '2xx' | '3xx' | '4xx' | '5xx';
  search?: string;
  range?: '1h' | '24h' | '7d' | '30d';
  cursor?: string;
  limit: number;
}) {
  const canRead = await userCanReadProject(projectId, userId);
  if (!canRead) return null;

  const where: Prisma.RequestLogWhereInput = { projectId };
  if (method) where.method = method;
  if (statusClass) {
    const start = Number(statusClass[0]) * 100;
    where.status = { gte: start, lt: start + 100 };
  }
  if (search?.trim()) {
    where.path = { contains: search.trim(), mode: 'insensitive' };
  }
  const createdAt = rangeStart(range);
  if (createdAt) where.createdAt = { gte: createdAt };

  const rows = await prisma.requestLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: activityLogSelect,
  });

  const page = rows.slice(0, limit);
  return {
    logs: page.map(serializeProjectActivityLog),
    nextCursor: rows.length > limit ? (page.at(-1)?.id ?? null) : null,
  };
}

export async function getProjectActivityLogForUser({
  projectId,
  userId,
  logId,
}: {
  projectId: string;
  userId: string;
  logId: string;
}) {
  const canRead = await userCanReadProject(projectId, userId);
  if (!canRead) return null;

  const row = await prisma.requestLog.findFirst({
    where: { id: logId, projectId },
    select: activityLogSelect,
  });

  return row ? serializeProjectActivityLog(row) : null;
}

async function userCanReadProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });

  return Boolean(project);
}

const activityLogSelect = {
  id: true,
  endpointId: true,
  method: true,
  path: true,
  status: true,
  durationMs: true,
  headers: true,
  body: true,
  responseHeaders: true,
  responseContentType: true,
  responseBody: true,
  createdAt: true,
} satisfies Prisma.RequestLogSelect;

function rangeStart(range: '1h' | '24h' | '7d' | '30d' | undefined) {
  if (!range) return null;
  const date = new Date();
  const hours = range === '1h' ? 1 : range === '24h' ? 24 : range === '7d' ? 24 * 7 : 24 * 30;
  date.setHours(date.getHours() - hours);
  return date;
}

function countRouteMethods(routeMethods: Array<{ method: string }>) {
  const counts = new Map<string, number>();
  for (const route of routeMethods) {
    counts.set(route.method, (counts.get(route.method) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([method, count]) => ({
    method,
    _count: { _all: count },
  }));
}

async function uniqueProjectSlug(value: string): Promise<string> {
  const baseSlug = slugifyProjectName(value);
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.project.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

async function resolveProjectIcon(
  input: { icon?: string; imageAttachmentId?: string },
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
