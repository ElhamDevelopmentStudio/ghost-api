import { beforeEach, describe, expect, it, vi } from 'vitest';

const prisma = {
  endpoint: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
  },
  endpointConfig: {
    upsert: vi.fn(),
  },
  endpointResponse: {
    deleteMany: vi.fn(),
    upsert: vi.fn(),
  },
};

vi.mock('../../db.js', () => ({ prisma }));

const { deleteProjectEndpointResponseForUser } = await import('./project-endpoints.service.js');

describe('deleteProjectEndpointResponseForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.endpoint.findFirst.mockResolvedValue(endpointRow());
    prisma.endpoint.findUnique.mockResolvedValue(endpointRow({ responses: [] }));
    prisma.endpointResponse.deleteMany.mockResolvedValue({ count: 1 });
  });

  it('removes the selected saved response and returns the refreshed endpoint', async () => {
    const result = await deleteProjectEndpointResponseForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      endpointId: '00000000-0000-4000-8000-000000000020',
      status: 422,
      contentType: 'application/problem+json',
      userId: '00000000-0000-4000-8000-000000000030',
    });

    expect(prisma.endpoint.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: '00000000-0000-4000-8000-000000000020',
          projectId: '00000000-0000-4000-8000-000000000010',
        }),
      }),
    );
    expect(prisma.endpointResponse.deleteMany).toHaveBeenCalledWith({
      where: {
        endpointId: '00000000-0000-4000-8000-000000000020',
        status: 422,
        contentType: 'application/problem+json',
      },
    });
    expect(result).toMatchObject({
      id: '00000000-0000-4000-8000-000000000020',
      savedResponses: [],
    });
  });

  it('does not remove responses when the endpoint is not editable by the user', async () => {
    prisma.endpoint.findFirst.mockResolvedValue(null);

    const result = await deleteProjectEndpointResponseForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      endpointId: '00000000-0000-4000-8000-000000000020',
      status: 422,
      contentType: 'application/problem+json',
      userId: '00000000-0000-4000-8000-000000000030',
    });

    expect(result).toBeNull();
    expect(prisma.endpointResponse.deleteMany).not.toHaveBeenCalled();
  });
});

function endpointRow({ responses = savedResponses() }: { responses?: unknown[] } = {}) {
  return {
    id: '00000000-0000-4000-8000-000000000020',
    method: 'POST',
    path: '/auth/login',
    group: 'Authentication',
    requestSchema: {
      parameters: [],
      requestBody: null,
    },
    responseSchema: {
      responses: [
        {
          status: 200,
          contentType: 'application/json',
          schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
          mediaTypes: [
            {
              contentType: 'application/json',
              schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
            },
          ],
        },
      ],
    },
    config: {
      latencyMs: 0,
      statusCode: null,
      authRequired: false,
      errorChance: 0,
    },
    responses,
    createdAt: new Date('2026-05-15T00:00:00.000Z'),
    updatedAt: new Date('2026-05-15T00:00:00.000Z'),
  };
}

function savedResponses() {
  return [
    {
      status: 422,
      contentType: 'application/problem+json',
      body: { error: 'Invalid input' },
    },
  ];
}
