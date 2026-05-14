import { Prisma } from '@prisma/client';
import {
  EndpointMockConfigSchema,
  type ProjectEndpoint,
  type RequestBody,
  type ResponseDefinition,
  type SaveEndpointResponseInput,
  type UpdateEndpointConfigInput,
  ParameterSchema,
  RequestBodySchema,
  ResponseSchema,
} from '@ghostapi/types';
import { z } from 'zod';

import { prisma } from '../../db.js';
import { invalidateProjectMockRuntime } from './mock-runtime-cache.js';

const storedRequestSchema = z.object({
  parameters: z.array(ParameterSchema).optional(),
  requestBody: RequestBodySchema.nullable().optional(),
});

const storedResponseSchema = z.object({
  responses: z.array(ResponseSchema).optional(),
});

type EndpointWithMockState = Prisma.EndpointGetPayload<{
  include: { config: true; responses: true };
}>;

const editableRoles = ['OWNER', 'ADMIN', 'EDITOR'] as const;

export async function listProjectEndpointsForUser(projectId: string, userId: string) {
  const canRead = await userCanReadProject(projectId, userId);
  if (!canRead) return null;

  const endpoints = await prisma.endpoint.findMany({
    where: { projectId },
    include: { config: true, responses: { orderBy: [{ status: 'asc' }, { contentType: 'asc' }] } },
    orderBy: [{ group: 'asc' }, { path: 'asc' }, { method: 'asc' }],
  });

  return endpoints.map(serializeProjectEndpoint);
}

export async function updateProjectEndpointConfigForUser({
  projectId,
  endpointId,
  userId,
  input,
}: {
  projectId: string;
  endpointId: string;
  userId: string;
  input: UpdateEndpointConfigInput;
}) {
  const endpoint = await findEditableEndpoint(projectId, endpointId, userId);
  if (!endpoint) return null;

  const currentConfig = defaultConfig(endpoint.config);
  const nextConfig = EndpointMockConfigSchema.parse({ ...currentConfig, ...input });

  await prisma.endpointConfig.upsert({
    where: { endpointId },
    create: {
      endpointId,
      latencyMs: nextConfig.latencyMs,
      statusCode: nextConfig.statusCode,
      authRequired: nextConfig.authRequired,
      errorChance: nextConfig.errorChance,
    },
    update: {
      latencyMs: nextConfig.latencyMs,
      statusCode: nextConfig.statusCode,
      authRequired: nextConfig.authRequired,
      errorChance: nextConfig.errorChance,
    },
  });

  invalidateProjectMockRuntime(projectId);
  return getEndpointWithMockState(endpointId);
}

export async function saveProjectEndpointResponseForUser({
  projectId,
  endpointId,
  status,
  userId,
  input,
}: {
  projectId: string;
  endpointId: string;
  status: number;
  userId: string;
  input: SaveEndpointResponseInput;
}) {
  const endpoint = await findEditableEndpoint(projectId, endpointId, userId);
  if (!endpoint) return null;

  await prisma.endpointResponse.upsert({
    where: {
      endpointId_status_contentType: {
        endpointId,
        status,
        contentType: input.contentType,
      },
    },
    create: {
      endpointId,
      status,
      contentType: input.contentType,
      body: toJsonInput(input.body),
    },
    update: {
      contentType: input.contentType,
      body: toJsonInput(input.body),
    },
  });

  invalidateProjectMockRuntime(projectId);
  return getEndpointWithMockState(endpointId);
}

export async function deleteProjectEndpointResponseForUser({
  projectId,
  endpointId,
  status,
  contentType,
  userId,
}: {
  projectId: string;
  endpointId: string;
  status: number;
  contentType: string;
  userId: string;
}) {
  const endpoint = await findEditableEndpoint(projectId, endpointId, userId);
  if (!endpoint) return null;

  await prisma.endpointResponse.deleteMany({
    where: {
      endpointId,
      status,
      contentType,
    },
  });

  invalidateProjectMockRuntime(projectId);
  return getEndpointWithMockState(endpointId);
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

async function findEditableEndpoint(projectId: string, endpointId: string, userId: string) {
  return prisma.endpoint.findFirst({
    where: {
      id: endpointId,
      projectId,
      project: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId, role: { in: [...editableRoles] } } } },
        ],
      },
    },
    include: { config: true, responses: { orderBy: [{ status: 'asc' }, { contentType: 'asc' }] } },
  });
}

async function getEndpointWithMockState(endpointId: string) {
  const endpoint = await prisma.endpoint.findUnique({
    where: { id: endpointId },
    include: { config: true, responses: { orderBy: [{ status: 'asc' }, { contentType: 'asc' }] } },
  });

  return endpoint ? serializeProjectEndpoint(endpoint) : null;
}

function serializeProjectEndpoint(endpoint: EndpointWithMockState): ProjectEndpoint {
  const requestSchema = storedRequestSchema.safeParse(toRecord(endpoint.requestSchema));
  const responseSchema = storedResponseSchema.safeParse(toRecord(endpoint.responseSchema));

  return {
    id: endpoint.id,
    method: endpoint.method as ProjectEndpoint['method'],
    path: endpoint.path,
    group: endpoint.group,
    parameters: requestSchema.success ? (requestSchema.data.parameters ?? []) : [],
    requestBody: requestSchema.success
      ? ((requestSchema.data.requestBody ?? null) as RequestBody | null)
      : null,
    responses: responseSchema.success
      ? ((responseSchema.data.responses ?? []) as ResponseDefinition[])
      : [],
    config: defaultConfig(endpoint.config),
    savedResponses: endpoint.responses.map((response) => ({
      status: response.status,
      contentType: response.contentType,
      body: response.body,
    })),
    createdAt: endpoint.createdAt.toISOString(),
    updatedAt: endpoint.updatedAt.toISOString(),
  };
}

function defaultConfig(config: EndpointWithMockState['config']) {
  return EndpointMockConfigSchema.parse({
    latencyMs: config?.latencyMs ?? 0,
    statusCode: config?.statusCode ?? null,
    authRequired: config?.authRequired ?? false,
    errorChance: config?.errorChance ?? 0,
  });
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toJsonInput(value: unknown): Prisma.InputJsonValue {
  if (value === null) return Prisma.JsonNull as unknown as Prisma.InputJsonValue;
  return value as Prisma.InputJsonValue;
}
