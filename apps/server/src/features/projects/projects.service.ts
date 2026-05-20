import { Prisma } from '@prisma/client';
import {
  ProjectMockDefaultsSchema,
  type CreateProjectParsed,
  type UpdateProjectInput,
  type UpdateProjectMockDefaultsInput,
  type UpsertProjectEnvironmentsInput,
} from '@ghostapi/types';

import { prisma } from '../../db.js';
import { attachmentThumbnailUrl } from '../uploads/upload.urls.js';
import { resolveSchemaContent } from '../../routes/schema-storage.js';
import { invalidateProjectMockRuntime } from './mock-runtime-cache.js';
import {
  serializeProjectActivityLog,
  serializeProject,
  serializeProjectDetail,
  serializeProjectOverviewMetrics,
  parseMockDefaults,
  schemaMetadata,
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
      archivedAt: null,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      archivedAt: true,
      activityLogRetentionDays: true,
      mockDefaults: true,
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
        archivedAt: null,
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
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        archivedAt: true,
        activityLogRetentionDays: true,
        mockDefaults: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
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
      archivedAt: true,
      activityLogRetentionDays: true,
      mockDefaults: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      members: { where: { userId }, select: { role: true } },
      environments: {
        orderBy: { createdAt: 'asc' },
        select: environmentSelect,
      },
      schemas: {
        orderBy: { uploadedAt: 'desc' },
        take: 5,
        select: { id: true, version: true, uploadedAt: true, metadata: true },
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

export async function updateProjectForUser({
  projectId,
  userId,
  input,
}: {
  projectId: string;
  userId: string;
  input: UpdateProjectInput;
}) {
  const canRead = await userCanReadProject(projectId, userId);
  if (!canRead) return null;

  const data: Prisma.ProjectUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.icon !== undefined) data.icon = input.icon;
  if (input.slug !== undefined) data.slug = input.slug;

  try {
    await prisma.project.update({
      where: { id: projectId },
      data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ProjectSlugConflictError();
    }
    throw error;
  }

  return getProjectForUser(projectId, userId);
}

export async function getProjectSchemaForUser({
  projectId,
  userId,
  schemaId,
}: {
  projectId: string;
  userId: string;
  schemaId: string;
}) {
  const canRead = await userCanReadProject(projectId, userId);
  if (!canRead) return null;

  const schema = await prisma.schema.findFirst({
    where: { id: schemaId, projectId },
    select: { id: true, version: true, uploadedAt: true, metadata: true, content: true },
  });
  if (!schema) return null;

  return {
    id: schema.id,
    version: schema.version,
    ...schemaMetadata(schema.metadata),
    uploadedAt: schema.uploadedAt.toISOString(),
    metadata:
      schema.metadata && typeof schema.metadata === 'object' && !Array.isArray(schema.metadata)
        ? (schema.metadata as Record<string, unknown>)
        : {},
    content: await resolveSchemaContent(schema.content),
  };
}

export async function upsertProjectEnvironmentsForUser({
  projectId,
  userId,
  input,
}: {
  projectId: string;
  userId: string;
  input: UpsertProjectEnvironmentsInput;
}) {
  const canRead = await userCanReadProject(projectId, userId);
  if (!canRead) return null;

  const environments = await prisma.$transaction(async (tx) => {
    for (const environment of input.environments) {
      const data = {
        name: environment.name,
        baseUrl: environment.baseUrl,
        description: environment.description ?? null,
        color: environment.color ?? '#22c55e',
        icon: environment.icon ?? 'globe',
        status: environment.status ?? 'ACTIVE',
        variables: (environment.variables ?? {}) as Prisma.InputJsonValue,
        headers: (environment.headers ?? {}) as Prisma.InputJsonValue,
        authConfig: (environment.authConfig ?? {}) as Prisma.InputJsonValue,
        corsConfig: (environment.corsConfig ?? {}) as Prisma.InputJsonValue,
      };

      if (environment.id) {
        await tx.environment.updateMany({
          where: { id: environment.id, projectId },
          data,
        });
        continue;
      }

      await tx.environment.upsert({
        where: { projectId_name: { projectId, name: environment.name } },
        create: {
          projectId,
          ...data,
        },
        update: data,
      });
    }

    return tx.environment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      select: environmentSelect,
    });
  });

  return { environments: serializeEnvironments(environments) };
}

export async function deleteProjectEnvironmentForUser({
  projectId,
  environmentId,
  userId,
}: {
  projectId: string;
  environmentId: string;
  userId: string;
}) {
  const canEdit = await userCanEditProject(projectId, userId);
  if (!canEdit) return null;

  const environmentCount = await prisma.environment.count({ where: { projectId } });
  if (environmentCount <= 1) {
    return { deleted: false as const, reason: 'LAST_ENVIRONMENT' as const };
  }

  const result = await prisma.environment.deleteMany({
    where: { id: environmentId, projectId },
  });

  return { deleted: result.count > 0 };
}

export async function updateProjectMockDefaultsForUser({
  projectId,
  userId,
  input,
}: {
  projectId: string;
  userId: string;
  input: UpdateProjectMockDefaultsInput;
}) {
  const canEdit = await userCanEditProject(projectId, userId);
  if (!canEdit) return null;

  const currentProject = await prisma.project.findUnique({
    where: { id: projectId },
    select: { mockDefaults: true },
  });
  if (!currentProject) return null;

  const mockDefaults = ProjectMockDefaultsSchema.parse({
    ...parseMockDefaults(currentProject.mockDefaults),
    ...input,
  });

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: projectId },
      data: { mockDefaults: mockDefaults as unknown as Prisma.InputJsonValue },
    });

    const endpoints = await tx.endpoint.findMany({
      where: { projectId },
      select: { id: true, config: { select: { id: true } } },
    });

    for (const endpoint of endpoints) {
      await tx.endpointConfig.upsert({
        where: { endpointId: endpoint.id },
        create: {
          endpointId: endpoint.id,
          latencyMs: mockDefaults.latencyMs,
          statusCode: mockDefaults.statusCode,
          authRequired: mockDefaults.authRequired,
          errorChance: mockDefaults.errorChance,
        },
        update: {
          latencyMs: mockDefaults.latencyMs,
          statusCode: mockDefaults.statusCode,
          authRequired: mockDefaults.authRequired,
          errorChance: mockDefaults.errorChance,
        },
      });
    }
  });

  invalidateProjectMockRuntime(projectId);
  return { mockDefaults };
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

export async function clearProjectActivityLogsForUser({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) {
  const canEdit = await userCanEditProject(projectId, userId);
  if (!canEdit) return null;

  const result = await prisma.requestLog.deleteMany({
    where: { projectId },
  });

  return { deletedCount: result.count };
}

export async function updateProjectActivitySettingsForUser({
  projectId,
  userId,
  activityLogRetentionDays,
}: {
  projectId: string;
  userId: string;
  activityLogRetentionDays: 0 | 1 | 7 | 30;
}) {
  const canEdit = await userCanEditProject(projectId, userId);
  if (!canEdit) return null;

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { activityLogRetentionDays },
    select: { activityLogRetentionDays: true },
  });

  return { activityLogRetentionDays: project.activityLogRetentionDays as 0 | 1 | 7 | 30 };
}

export async function resetProjectMockDataForUser({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) {
  const canEdit = await userCanEditProject(projectId, userId);
  if (!canEdit) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { mockDefaults: true },
  });
  if (!project) return null;

  const mockDefaults = parseMockDefaults(project.mockDefaults);
  const result = await prisma.$transaction(async (tx) => {
    const responses = await tx.endpointResponse.deleteMany({
      where: { endpoint: { projectId } },
    });

    await tx.endpointConfig.deleteMany({
      where: { endpoint: { projectId } },
    });

    const endpoints = await tx.endpoint.findMany({
      where: { projectId },
      select: { id: true },
    });

    for (const endpoint of endpoints) {
      await tx.endpointConfig.create({
        data: {
          endpointId: endpoint.id,
          latencyMs: mockDefaults.latencyMs,
          statusCode: mockDefaults.statusCode,
          authRequired: mockDefaults.authRequired,
          errorChance: mockDefaults.errorChance,
        },
      });
    }

    return {
      deletedResponseCount: responses.count,
      resetEndpointCount: endpoints.length,
    };
  });

  invalidateProjectMockRuntime(projectId);
  return result;
}

export async function archiveProjectForUser({
  projectId,
  userId,
  archived,
}: {
  projectId: string;
  userId: string;
  archived: boolean;
}) {
  const canManage = await userCanManageProject(projectId, userId);
  if (!canManage) return null;

  await prisma.project.update({
    where: { id: projectId },
    data: { archivedAt: archived ? new Date() : null },
  });

  invalidateProjectMockRuntime(projectId);
  return getProjectForUser(projectId, userId);
}

export async function deleteProjectForUser({
  projectId,
  userId,
  confirmation,
}: {
  projectId: string;
  userId: string;
  confirmation: string;
}) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true, name: true },
  });
  if (!project) return null;
  if (confirmation !== project.name) {
    return { deleted: false as const, reason: 'CONFIRMATION_MISMATCH' as const };
  }

  await prisma.project.delete({ where: { id: projectId } });
  invalidateProjectMockRuntime(projectId);
  return { deleted: true as const };
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

async function userCanEditProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      archivedAt: null,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, role: { in: ['OWNER', 'ADMIN', 'EDITOR'] } } } },
      ],
    },
    select: { id: true },
  });

  return Boolean(project);
}

async function userCanManageProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, role: { in: ['OWNER', 'ADMIN'] } } } },
      ],
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

const environmentSelect = {
  id: true,
  name: true,
  baseUrl: true,
  description: true,
  color: true,
  icon: true,
  status: true,
  variables: true,
  headers: true,
  authConfig: true,
  corsConfig: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EnvironmentSelect;

function serializeEnvironments(
  environments: Array<Prisma.EnvironmentGetPayload<{ select: typeof environmentSelect }>>,
) {
  return environments.map((env) => ({
    id: env.id,
    name: env.name,
    baseUrl: env.baseUrl,
    description: env.description,
    color: env.color,
    icon: env.icon,
    status: env.status === 'INACTIVE' ? 'INACTIVE' : ('ACTIVE' as const),
    variables: toStringRecord(env.variables),
    headers: toStringRecord(env.headers),
    authConfig: toRecord(env.authConfig),
    corsConfig: toRecord(env.corsConfig),
    createdAt: env.createdAt.toISOString(),
    updatedAt: env.updatedAt.toISOString(),
  }));
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      typeof item === 'string' ? item : String(item),
    ]),
  );
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

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
