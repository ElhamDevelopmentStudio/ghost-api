import type {
  ProjectDetail,
  ProjectEnvironment,
  ProjectMockDefaults,
  ProjectOverviewMetrics,
  ProjectRole,
  ProjectSchemaVersion,
  ProjectSummary,
} from '@ghostapi/types';
import { ProjectMockDefaultsSchema } from '@ghostapi/types';

export type ProjectSummaryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  activityLogRetentionDays: number;
  mockDefaults: unknown;
  ownerId: string;
  members: { role: ProjectRole }[];
  environments: { name: string; baseUrl: string }[];
  _count: { endpoints: number; requestLogs: number; members: number };
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectDetailRow = Omit<ProjectSummaryRow, 'environments'> & {
  environments: Array<{
    id: string;
    name: string;
    baseUrl: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  schemas: Array<{ id: string; version: number; uploadedAt: Date; metadata: unknown }>;
};

export type ProjectRequestLogRow = {
  id: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  createdAt: Date;
};

export type ProjectActivityLogRow = ProjectRequestLogRow & {
  endpointId: string | null;
  headers: unknown;
  body: unknown;
  responseHeaders: unknown;
  responseContentType: string | null;
  responseBody: unknown;
};

export type ProjectMethodCountRow = {
  method: string;
  _count: { _all: number };
};

export type ProjectSampleEndpointRow = {
  method: string;
  path: string;
};

export function serializeProject(project: ProjectSummaryRow, userId: string): ProjectSummary {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    description: project.description,
    icon: project.icon,
    role: project.ownerId === userId ? 'OWNER' : (project.members[0]?.role ?? 'VIEWER'),
    visibility: project._count.members > 1 ? 'Team' : 'Private',
    status: 'Live',
    endpointCount: project._count.endpoints,
    requestCount: project._count.requestLogs,
    activityLogRetentionDays: toActivityLogRetentionDays(project.activityLogRetentionDays),
    mockDefaults: parseMockDefaults(project.mockDefaults),
    environment: project.environments[0] ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

function toActivityLogRetentionDays(value: number): 0 | 1 | 7 | 30 {
  return value === 0 || value === 1 || value === 7 ? value : 30;
}

export function serializeProjectDetail(
  project: ProjectDetailRow,
  userId: string,
  overview: ProjectOverviewMetrics,
): ProjectDetail {
  const summary = serializeProject(
    {
      ...project,
      environments: project.environments.map((env) => ({ name: env.name, baseUrl: env.baseUrl })),
    },
    userId,
  );

  const environments: ProjectEnvironment[] = project.environments.map((env) => ({
    id: env.id,
    name: env.name,
    baseUrl: env.baseUrl,
    createdAt: env.createdAt.toISOString(),
    updatedAt: env.updatedAt.toISOString(),
  }));

  const schemas: ProjectSchemaVersion[] = project.schemas.map((schema) => ({
    id: schema.id,
    version: schema.version,
    ...schemaMetadata(schema.metadata),
    uploadedAt: schema.uploadedAt.toISOString(),
  }));

  return {
    ...summary,
    ownerId: project.ownerId,
    environments,
    schemas,
    overview,
  };
}

export function parseMockDefaults(value: unknown): ProjectMockDefaults {
  return ProjectMockDefaultsSchema.parse(
    value && typeof value === 'object' && !Array.isArray(value) ? value : {},
  );
}

export function schemaMetadata(value: unknown) {
  const metadata =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    title: typeof metadata.title === 'string' ? metadata.title : null,
    schemaVersion: typeof metadata.version === 'string' ? metadata.version : null,
    endpointCount:
      typeof metadata.endpointCount === 'number' && Number.isFinite(metadata.endpointCount)
        ? Math.max(0, Math.trunc(metadata.endpointCount))
        : 0,
    sizeBytes:
      typeof metadata.sizeBytes === 'number' && Number.isFinite(metadata.sizeBytes)
        ? Math.max(0, Math.trunc(metadata.sizeBytes))
        : null,
  };
}

export function serializeProjectOverviewMetrics({
  recentRequests,
  windowRequests,
  routeMethodCounts,
  sampleEndpoint,
}: {
  recentRequests: ProjectRequestLogRow[];
  windowRequests: ProjectRequestLogRow[];
  routeMethodCounts: ProjectMethodCountRow[];
  sampleEndpoint: ProjectSampleEndpointRow | null;
}): ProjectOverviewMetrics {
  const requestTrend = buildSevenDayTrend(windowRequests);
  const statusBreakdown = buildStatusBreakdown(windowRequests);
  const averageDurationMs =
    windowRequests.length > 0
      ? Math.round(
          windowRequests.reduce((sum, request) => sum + request.durationMs, 0) /
            windowRequests.length,
        )
      : null;

  return {
    requestTrend,
    routeMethodBreakdown: routeMethodCounts.map((row) => ({
      label: row.method,
      count: row._count._all,
    })),
    statusBreakdown,
    averageDurationMs,
    recentRequests: recentRequests.map((request) => ({
      id: request.id,
      method: request.method,
      path: request.path,
      status: request.status,
      durationMs: request.durationMs,
      createdAt: request.createdAt.toISOString(),
    })),
    sampleEndpoint,
  };
}

export function serializeProjectActivityLog(row: ProjectActivityLogRow) {
  return {
    id: row.id,
    endpointId: row.endpointId,
    method: row.method,
    path: row.path,
    status: row.status,
    durationMs: row.durationMs,
    requestHeaders: stringRecord(row.headers),
    requestBody: row.body ?? null,
    responseHeaders: stringRecord(row.responseHeaders),
    responseContentType: row.responseContentType,
    responseBody: row.responseBody ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

function stringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      typeof item === 'string' ? item : String(item),
    ]),
  );
}

function buildSevenDayTrend(requests: ProjectRequestLogRow[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (6 - index));
    return date;
  });

  return days.map((date) => {
    const key = date.toISOString().slice(0, 10);
    return {
      date: key,
      label: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      count: requests.filter((request) => request.createdAt.toISOString().startsWith(key)).length,
    };
  });
}

function buildStatusBreakdown(requests: ProjectRequestLogRow[]) {
  const success = { label: '2xx', count: 0 };
  const redirect = { label: '3xx', count: 0 };
  const clientError = { label: '4xx', count: 0 };
  const serverError = { label: '5xx', count: 0 };

  for (const request of requests) {
    if (request.status >= 200 && request.status < 300) success.count += 1;
    else if (request.status >= 300 && request.status < 400) redirect.count += 1;
    else if (request.status >= 400 && request.status < 500) clientError.count += 1;
    else if (request.status >= 500) serverError.count += 1;
  }

  return [success, redirect, clientError, serverError];
}
