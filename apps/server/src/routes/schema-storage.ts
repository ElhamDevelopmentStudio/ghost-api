import { getObjectBuffer, putObject } from '../features/uploads/r2.client.js';

const SCHEMA_STORAGE_PROVIDER = 'r2';

type R2SchemaContent = {
  storage: typeof SCHEMA_STORAGE_PROVIDER;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
};

export async function storeSchemaContent(input: {
  content: string;
  projectId: string;
  schemaId: string;
}): Promise<R2SchemaContent> {
  const contentType = schemaContentType(input.content);
  const objectKey = schemaObjectKey({
    projectId: input.projectId,
    schemaId: input.schemaId,
    extension: contentType === 'application/json' ? 'json' : 'yaml',
  });
  const body = Buffer.from(input.content, 'utf8');

  await putObject({
    key: objectKey,
    body,
    contentType,
  });

  return {
    storage: SCHEMA_STORAGE_PROVIDER,
    objectKey,
    contentType,
    sizeBytes: body.byteLength,
  };
}

export async function resolveSchemaContent(content: unknown): Promise<unknown> {
  if (!isR2SchemaContent(content)) return content;

  const body = await getObjectBuffer(content.objectKey);
  return { raw: body.toString('utf8') };
}

function schemaObjectKey(input: {
  projectId: string;
  schemaId: string;
  extension: 'json' | 'yaml';
}) {
  return `projects/${input.projectId}/schemas/${input.schemaId}/schema.${input.extension}`;
}

function schemaContentType(content: string) {
  return content.trimStart().startsWith('{') ? 'application/json' : 'application/yaml';
}

function isR2SchemaContent(content: unknown): content is R2SchemaContent {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return false;

  const value = content as Partial<R2SchemaContent>;
  return value.storage === SCHEMA_STORAGE_PROVIDER && typeof value.objectKey === 'string';
}
