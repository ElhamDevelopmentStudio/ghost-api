import type {
  ProjectDetail,
  ProjectEnvironment,
  ProjectRole,
  ProjectSchemaVersion,
  ProjectSummary,
} from '@ghostapi/types';

export type ProjectSummaryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
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
  schemas: Array<{ id: string; version: number; uploadedAt: Date }>;
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
    environment: project.environments[0] ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function serializeProjectDetail(project: ProjectDetailRow, userId: string): ProjectDetail {
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
    uploadedAt: schema.uploadedAt.toISOString(),
  }));

  return {
    ...summary,
    ownerId: project.ownerId,
    environments,
    schemas,
  };
}
