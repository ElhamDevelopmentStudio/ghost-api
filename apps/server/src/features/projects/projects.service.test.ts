import { beforeEach, describe, expect, it, vi } from 'vitest';

const prisma = {
  project: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  requestLog: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
  },
};

vi.mock('../../db.js', () => ({ prisma }));

const {
  clearProjectActivityLogsForUser,
  getProjectActivityLogForUser,
  listProjectActivityLogsForUser,
  updateProjectActivitySettingsForUser,
} = await import('./projects.service.js');

describe('listProjectActivityLogsForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.project.findFirst.mockResolvedValue({ id: 'project-id' });
    prisma.requestLog.findFirst.mockResolvedValue(
      activityRow('00000000-0000-4000-8000-000000000001', 404, '/auth/login'),
    );
    prisma.requestLog.deleteMany.mockResolvedValue({ count: 3 });
    prisma.project.update.mockResolvedValue({ activityLogRetentionDays: 7 });
    prisma.requestLog.findMany.mockResolvedValue([
      activityRow('00000000-0000-4000-8000-000000000001', 404, '/auth/login'),
      activityRow('00000000-0000-4000-8000-000000000002', 401, '/auth/logout'),
      activityRow('00000000-0000-4000-8000-000000000003', 400, '/auth/register'),
    ]);
  });

  it('applies access, filters, cursor, and limit-plus-one pagination', async () => {
    const result = await listProjectActivityLogsForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      userId: '00000000-0000-4000-8000-000000000011',
      method: 'POST',
      statusClass: '4xx',
      search: 'auth',
      range: '24h',
      cursor: '00000000-0000-4000-8000-000000000099',
      limit: 2,
    });

    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: '00000000-0000-4000-8000-000000000010',
        OR: [
          { ownerId: '00000000-0000-4000-8000-000000000011' },
          { members: { some: { userId: '00000000-0000-4000-8000-000000000011' } } },
        ],
      },
      select: { id: true },
    });
    expect(prisma.requestLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId: '00000000-0000-4000-8000-000000000010',
          method: 'POST',
          status: { gte: 400, lt: 500 },
          path: { contains: 'auth', mode: 'insensitive' },
          createdAt: { gte: expect.any(Date) },
        }),
        orderBy: { createdAt: 'desc' },
        take: 3,
        cursor: { id: '00000000-0000-4000-8000-000000000099' },
        skip: 1,
      }),
    );
    expect(result).toMatchObject({
      nextCursor: '00000000-0000-4000-8000-000000000002',
      logs: [
        {
          id: '00000000-0000-4000-8000-000000000001',
          requestHeaders: { authorization: 'Bearer token' },
          responseContentType: 'application/json',
        },
        {
          id: '00000000-0000-4000-8000-000000000002',
        },
      ],
    });
  });

  it('does not query logs when the user cannot read the project', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    const result = await listProjectActivityLogsForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      userId: '00000000-0000-4000-8000-000000000011',
      limit: 50,
    });

    expect(result).toBeNull();
    expect(prisma.requestLog.findMany).not.toHaveBeenCalled();
  });

  it('loads one activity log by id inside the readable project', async () => {
    const result = await getProjectActivityLogForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      userId: '00000000-0000-4000-8000-000000000011',
      logId: '00000000-0000-4000-8000-000000000001',
    });

    expect(prisma.requestLog.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: '00000000-0000-4000-8000-000000000001',
          projectId: '00000000-0000-4000-8000-000000000010',
        },
      }),
    );
    expect(result).toMatchObject({
      id: '00000000-0000-4000-8000-000000000001',
      requestHeaders: { authorization: 'Bearer token' },
    });
  });

  it('clears all activity logs inside the readable project', async () => {
    const result = await clearProjectActivityLogsForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      userId: '00000000-0000-4000-8000-000000000011',
    });

    expect(prisma.requestLog.deleteMany).toHaveBeenCalledWith({
      where: { projectId: '00000000-0000-4000-8000-000000000010' },
    });
    expect(result).toEqual({ deletedCount: 3 });
  });

  it('does not clear logs when the user cannot read the project', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    const result = await clearProjectActivityLogsForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      userId: '00000000-0000-4000-8000-000000000011',
    });

    expect(result).toBeNull();
    expect(prisma.requestLog.deleteMany).not.toHaveBeenCalled();
  });

  it('updates activity log retention inside the readable project', async () => {
    const result = await updateProjectActivitySettingsForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      userId: '00000000-0000-4000-8000-000000000011',
      activityLogRetentionDays: 7,
    });

    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: '00000000-0000-4000-8000-000000000010' },
      data: { activityLogRetentionDays: 7 },
      select: { activityLogRetentionDays: true },
    });
    expect(result).toEqual({ activityLogRetentionDays: 7 });
  });

  it('does not update activity log retention when the user cannot read the project', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    const result = await updateProjectActivitySettingsForUser({
      projectId: '00000000-0000-4000-8000-000000000010',
      userId: '00000000-0000-4000-8000-000000000011',
      activityLogRetentionDays: 0,
    });

    expect(result).toBeNull();
    expect(prisma.project.update).not.toHaveBeenCalled();
  });
});

function activityRow(id: string, status: number, path: string) {
  return {
    id,
    endpointId: '00000000-0000-4000-8000-000000000020',
    method: 'POST',
    path,
    status,
    durationMs: 12,
    headers: { authorization: 'Bearer token' },
    body: { ok: true },
    responseHeaders: { 'content-type': 'application/json' },
    responseContentType: 'application/json',
    responseBody: { saved: true },
    createdAt: new Date('2026-05-15T00:00:00.000Z'),
  };
}
