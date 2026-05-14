import { beforeEach, describe, expect, it, vi } from 'vitest';

const prisma = {
  project: {
    findUnique: vi.fn(),
  },
  endpoint: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
  },
  endpointConfig: {
    upsert: vi.fn(),
  },
  endpointResponse: {
    upsert: vi.fn(),
  },
};

vi.mock('../db.js', () => ({ prisma }));

const { mockRouter } = await import('./mock.js');
const { clearProjectMockRuntimeCache } = await import('../features/projects/mock-runtime-cache.js');
const { saveProjectEndpointResponseForUser, updateProjectEndpointConfigForUser } =
  await import('../features/projects/project-endpoints.service.js');

describe('mock runtime cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearProjectMockRuntimeCache();
    prisma.project.findUnique.mockResolvedValue({
      id: '00000000-0000-4000-8000-000000000010',
      activityLogRetentionDays: 0,
    });
    prisma.endpointConfig.upsert.mockResolvedValue({});
    prisma.endpointResponse.upsert.mockResolvedValue({});
    setRuntimeRow(endpointRow());
  });

  it('serves refreshed runtime behavior after endpoint config and saved response changes', async () => {
    const initial = await mockRouter.request('/00000000-0000-4000-8000-000000000010/users');
    expect(initial.status).toBe(200);
    await expect(initial.json()).resolves.toEqual({ mode: 'generated' });
    expect(prisma.endpoint.findMany).toHaveBeenCalledTimes(1);

    setRuntimeRow(
      endpointRow({
        config: {
          latencyMs: 0,
          statusCode: 404,
          authRequired: false,
          errorChance: 0,
        },
        responses: [{ status: 404, contentType: 'application/json', body: { error: 'saved' } }],
      }),
    );
    await updateProjectEndpointConfigForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      endpointId: '00000000-0000-4000-8000-000000000020',
      userId: '00000000-0000-4000-8000-000000000030',
      input: { statusCode: 404 },
    });
    await saveProjectEndpointResponseForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      endpointId: '00000000-0000-4000-8000-000000000020',
      userId: '00000000-0000-4000-8000-000000000030',
      status: 404,
      input: { contentType: 'application/json', body: { error: 'saved' } },
    });

    const refreshed = await mockRouter.request('/00000000-0000-4000-8000-000000000010/users');
    expect(refreshed.status).toBe(404);
    await expect(refreshed.json()).resolves.toEqual({ error: 'saved' });
    expect(prisma.endpoint.findMany).toHaveBeenCalledTimes(2);
  });

  it('serves refreshed auth requirements after config changes', async () => {
    const open = await mockRouter.request('/00000000-0000-4000-8000-000000000010/users');
    expect(open.status).toBe(200);

    setRuntimeRow(
      endpointRow({
        config: {
          latencyMs: 0,
          statusCode: null,
          authRequired: true,
          errorChance: 0,
        },
      }),
    );
    await updateProjectEndpointConfigForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      endpointId: '00000000-0000-4000-8000-000000000020',
      userId: '00000000-0000-4000-8000-000000000030',
      input: { authRequired: true },
    });

    const unauthorized = await mockRouter.request('/00000000-0000-4000-8000-000000000010/users');
    expect(unauthorized.status).toBe(401);

    const authorized = await mockRouter.request('/00000000-0000-4000-8000-000000000010/users', {
      headers: { Authorization: 'Bearer token' },
    });
    expect(authorized.status).toBe(200);
  });
});

function setRuntimeRow(row: ReturnType<typeof endpointRow>) {
  prisma.endpoint.findMany.mockImplementation(async () => [row]);
  prisma.endpoint.findFirst.mockImplementation(async () => row);
  prisma.endpoint.findUnique.mockImplementation(async () => row);
}

function endpointRow({
  config = {
    latencyMs: 0,
    statusCode: null,
    authRequired: false,
    errorChance: 0,
  },
  responses = [],
}: {
  config?: {
    latencyMs: number;
    statusCode: number | null;
    authRequired: boolean;
    errorChance: number;
  };
  responses?: Array<{ status: number; contentType: string; body: unknown }>;
} = {}) {
  return {
    id: '00000000-0000-4000-8000-000000000020',
    method: 'GET',
    path: '/users',
    group: 'Users',
    requestSchema: {
      parameters: [],
      requestBody: null,
    },
    responseSchema: {
      responses: [
        {
          status: 200,
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              mode: { type: 'string', example: 'generated' },
            },
          },
          mediaTypes: [
            {
              contentType: 'application/json',
              schema: {
                type: 'object',
                properties: {
                  mode: { type: 'string', example: 'generated' },
                },
              },
            },
          ],
        },
        {
          status: 404,
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'generated-not-found' },
            },
          },
          mediaTypes: [
            {
              contentType: 'application/json',
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'generated-not-found' },
                },
              },
            },
          ],
        },
      ],
    },
    config,
    responses,
    createdAt: new Date('2026-05-15T00:00:00.000Z'),
    updatedAt: new Date('2026-05-15T00:00:00.000Z'),
  };
}
