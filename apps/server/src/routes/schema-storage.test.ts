import { beforeEach, describe, expect, it, vi } from 'vitest';

const r2 = {
  getObjectBuffer: vi.fn(),
  putObject: vi.fn(),
};

vi.mock('../features/uploads/r2.client.js', () => r2);

const { resolveSchemaContent, storeSchemaContent } = await import('./schema-storage.js');

describe('schema R2 storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes uploaded schema content to R2 and returns a stored object pointer', async () => {
    const content = '{"openapi":"3.1.0","info":{"title":"API","version":"1.0.0"},"paths":{}}';

    const stored = await storeSchemaContent({
      content,
      projectId: '00000000-0000-4000-8000-000000000001',
      schemaId: '00000000-0000-4000-8000-000000000002',
    });

    expect(r2.putObject).toHaveBeenCalledWith({
      key: 'projects/00000000-0000-4000-8000-000000000001/schemas/00000000-0000-4000-8000-000000000002/schema.json',
      body: Buffer.from(content, 'utf8'),
      contentType: 'application/json',
    });
    expect(stored).toEqual({
      storage: 'r2',
      objectKey:
        'projects/00000000-0000-4000-8000-000000000001/schemas/00000000-0000-4000-8000-000000000002/schema.json',
      contentType: 'application/json',
      sizeBytes: Buffer.byteLength(content, 'utf8'),
    });
  });

  it('resolves R2-backed schema content into the legacy raw content shape', async () => {
    r2.getObjectBuffer.mockResolvedValue(Buffer.from('openapi: 3.1.0', 'utf8'));

    await expect(
      resolveSchemaContent({
        storage: 'r2',
        objectKey: 'projects/project-id/schemas/schema-id/schema.yaml',
        contentType: 'application/yaml',
        sizeBytes: 14,
      }),
    ).resolves.toEqual({ raw: 'openapi: 3.1.0' });
  });

  it('keeps legacy database-stored schema content readable', async () => {
    const legacyContent = { raw: 'openapi: 3.1.0' };

    await expect(resolveSchemaContent(legacyContent)).resolves.toBe(legacyContent);
    expect(r2.getObjectBuffer).not.toHaveBeenCalled();
  });
});
