import type {
  EndpointMockConfig,
  NormalizedEndpoint,
  Parameter,
  ProjectMockDefaults,
  RequestBody,
  ResponseDefinition,
} from '@ghostapi/types';
import type { MountInput } from '@ghostapi/runtime';

export interface DbEndpoint {
  id: string;
  method: string;
  path: string;
  group: string;
  requestSchema: unknown;
  responseSchema: unknown;
  config: {
    latencyMs: number;
    statusCode: number | null;
    authRequired: boolean;
    errorChance: number;
  } | null;
  responses: { status: number; contentType?: string | null; body: unknown }[];
}

interface StoredRequestSchema {
  parameters?: Parameter[];
  requestBody?: RequestBody | null;
}

interface StoredResponseSchema {
  responses?: ResponseDefinition[];
}

export function toMountInput(
  row: DbEndpoint,
  projectDefaults: ProjectMockDefaults | null = null,
): MountInput {
  const requestSchema = toObject<StoredRequestSchema>(row.requestSchema);
  const responseSchema = toObject<StoredResponseSchema>(row.responseSchema);

  const endpoint: NormalizedEndpoint = {
    id: row.id,
    method: row.method as NormalizedEndpoint['method'],
    path: row.path,
    group: row.group,
    parameters: requestSchema.parameters ?? [],
    requestBody: requestSchema.requestBody ?? undefined,
    responses: responseSchema.responses ?? [],
    authRequired: row.config?.authRequired ?? false,
  };

  const config: EndpointMockConfig & Partial<ProjectMockDefaults> = {
    ...(projectDefaults ?? {}),
    latencyMs: row.config?.latencyMs ?? projectDefaults?.latencyMs ?? 0,
    statusCode: row.config?.statusCode ?? projectDefaults?.statusCode ?? null,
    authRequired: row.config?.authRequired ?? projectDefaults?.authRequired ?? false,
    errorChance: row.config?.errorChance ?? projectDefaults?.errorChance ?? 0,
  };

  const configuredSaved = row.config?.statusCode
    ? row.responses.find((response) => response.status === row.config?.statusCode)
    : undefined;
  const successSaved = row.responses.find(
    (response) => response.status >= 200 && response.status < 300,
  );
  return {
    endpoint,
    config,
    savedBody: (configuredSaved ?? successSaved)?.body,
    savedResponses: row.responses.map((response) => ({
      status: response.status,
      contentType: response.contentType || 'application/json',
      body: response.body,
    })),
    seed: row.id,
  };
}

function toObject<T extends object>(value: unknown): Partial<T> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Partial<T>) : {};
}
