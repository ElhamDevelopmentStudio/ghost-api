import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prisma = {
  project: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
};

const r2 = {
  getObjectBuffer: vi.fn(),
  putObject: vi.fn(),
};

const parser = {
  parseSchema: vi.fn(),
};

class TestSchemaParseError extends Error {}
class TestSchemaValidationError extends Error {
  issues = [];
}

vi.mock('../db.js', () => ({ prisma }));
vi.mock('../features/uploads/r2.client.js', () => r2);
vi.mock('@ghostapi/parser', () => ({
  parseSchema: parser.parseSchema,
  SchemaParseError: TestSchemaParseError,
  SchemaValidationError: TestSchemaValidationError,
}));
vi.mock('../features/auth/index.js', () => ({
  authContext: () => ({
    userId: '00000000-0000-4000-8000-000000000010',
    sessionId: '00000000-0000-4000-8000-000000000011',
  }),
  requireAuth: async (_c: unknown, next: () => Promise<void>) => next(),
  requireCsrf: async (_c: unknown, next: () => Promise<void>) => next(),
}));

const { schemasRouter } = await import('./schemas.js');

describe('schema upload route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.project.findFirst.mockResolvedValue({ id: '00000000-0000-4000-8000-000000000001' });
    r2.putObject.mockResolvedValue(undefined);
  });

  it('persists authorized schema upload payloads to R2 before OpenAPI parsing rejects them', async () => {
    parser.parseSchema.mockRejectedValue(new TestSchemaParseError('invalid schema'));

    const response = await app().request('/projects/00000000-0000-4000-8000-000000000001/schemas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'not: openapi' }),
    });

    expect(response.status).toBe(400);
    expect(r2.putObject).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringContaining('projects/00000000-0000-4000-8000-000000000001/schemas/'),
        body: Buffer.from('not: openapi', 'utf8'),
        contentType: 'application/yaml',
      }),
    );
    expect(r2.putObject.mock.invocationCallOrder[0]).toBeLessThan(
      parser.parseSchema.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

function app() {
  const hono = new Hono();
  hono.route('/projects', schemasRouter);
  return hono;
}
