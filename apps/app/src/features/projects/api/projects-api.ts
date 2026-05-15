import {
  CSRF_HEADER,
  type ClearProjectActivityLogsResponse,
  type CreateProjectInput,
  type EndpointMockConfig,
  type ListProjectsResponse,
  type ProjectActivityLogsQuery,
  type ProjectActivityLogResponse,
  type ProjectActivityLogsResponse,
  type ListProjectEndpointsResponse,
  type ProjectDetail,
  type ProjectDetailResponse,
  type ProjectEndpoint,
  type ProjectEndpointResponse,
  type ProjectActivitySettingsResponse,
  type ProjectEnvironmentsResponse,
  type ProjectResponse,
  type ProjectSchemaDetail,
  type ProjectSchemaDetailResponse,
  type ProjectSummary,
  type SaveEndpointResponseInput,
  type UpdateEndpointConfigInput,
  type UpdateProjectInput,
  type UpdateProjectActivitySettingsInput,
  type UpdateProjectMockDefaultsInput,
  type UpsertProjectEnvironmentsInput,
  type UploadProjectSchemaResponse,
  type ProjectMockDefaultsResponse,
} from '@ghostapi/types';

import { getCsrfToken } from '@/features/auth/api/auth-api';
import { apiRequest } from '@/lib/api-client';

export type {
  CreateProjectInput,
  EndpointMockConfig,
  ProjectDetail,
  ProjectEndpoint,
  ProjectSummary,
  ProjectActivityLogsQuery,
  UpdateProjectInput,
  UpdateProjectMockDefaultsInput,
  UpsertProjectEnvironmentsInput,
};

export async function listProjects(): Promise<ProjectSummary[]> {
  const response = await apiRequest<ListProjectsResponse>({ path: '/projects' });
  return response.projects;
}

export async function getProject(id: string): Promise<ProjectDetail> {
  const response = await apiRequest<ProjectDetailResponse>({ path: `/projects/${id}` });
  return response.project;
}

export async function createProject(input: CreateProjectInput): Promise<ProjectSummary> {
  const csrfToken = await getCsrfToken();
  const response = await apiRequest<ProjectResponse>({
    path: '/projects',
    method: 'POST',
    body: input,
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });

  return response.project;
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
): Promise<ProjectDetail> {
  const csrfToken = await getCsrfToken();
  const response = await apiRequest<ProjectDetailResponse>({
    path: `/projects/${projectId}`,
    method: 'PATCH',
    body: input,
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });

  return response.project;
}

export async function uploadProjectSchema(input: {
  projectId: string;
  content: string;
  overrideDuplicateEndpoints?: boolean;
}): Promise<UploadProjectSchemaResponse> {
  const csrfToken = await getCsrfToken();
  return apiRequest<UploadProjectSchemaResponse>({
    path: `/projects/${input.projectId}/schemas`,
    method: 'POST',
    body: {
      content: input.content,
      overrideDuplicateEndpoints: input.overrideDuplicateEndpoints ?? false,
    },
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });
}

export async function getProjectSchema(input: {
  projectId: string;
  schemaId: string;
}): Promise<ProjectSchemaDetail> {
  const response = await apiRequest<ProjectSchemaDetailResponse>({
    path: `/projects/${input.projectId}/schemas/${input.schemaId}`,
  });
  return response.schema;
}

export async function upsertProjectEnvironments(
  projectId: string,
  input: UpsertProjectEnvironmentsInput,
): Promise<ProjectEnvironmentsResponse> {
  const csrfToken = await getCsrfToken();
  return apiRequest<ProjectEnvironmentsResponse>({
    path: `/projects/${projectId}/environments`,
    method: 'PUT',
    body: input,
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });
}

export async function updateProjectMockDefaults(
  projectId: string,
  input: UpdateProjectMockDefaultsInput,
): Promise<ProjectMockDefaultsResponse> {
  const csrfToken = await getCsrfToken();
  return apiRequest<ProjectMockDefaultsResponse>({
    path: `/projects/${projectId}/mock-defaults`,
    method: 'PATCH',
    body: input,
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });
}

export async function listProjectEndpoints(projectId: string): Promise<ProjectEndpoint[]> {
  const response = await apiRequest<ListProjectEndpointsResponse>({
    path: `/projects/${projectId}/endpoints`,
  });
  return response.endpoints;
}

export async function listProjectActivityLogs(
  projectId: string,
  filters: ProjectActivityLogsQuery,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const response = await apiRequest<ProjectActivityLogsResponse>({
    path: `/projects/${projectId}/activity${params.size ? `?${params.toString()}` : ''}`,
  });
  return response;
}

export async function getProjectActivityLog(projectId: string, logId: string) {
  const response = await apiRequest<ProjectActivityLogResponse>({
    path: `/projects/${projectId}/activity/${logId}`,
  });
  return response.log;
}

export async function clearProjectActivityLogs(
  projectId: string,
): Promise<ClearProjectActivityLogsResponse> {
  const csrfToken = await getCsrfToken();
  return apiRequest<ClearProjectActivityLogsResponse>({
    path: `/projects/${projectId}/activity`,
    method: 'DELETE',
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });
}

export async function updateProjectActivitySettings(
  projectId: string,
  input: UpdateProjectActivitySettingsInput,
): Promise<ProjectActivitySettingsResponse> {
  const csrfToken = await getCsrfToken();
  return apiRequest<ProjectActivitySettingsResponse>({
    path: `/projects/${projectId}/activity/settings`,
    method: 'PATCH',
    body: input,
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });
}

export async function updateEndpointConfig(input: {
  projectId: string;
  endpointId: string;
  config: UpdateEndpointConfigInput;
}): Promise<ProjectEndpoint> {
  const csrfToken = await getCsrfToken();
  const response = await apiRequest<ProjectEndpointResponse>({
    path: `/projects/${input.projectId}/endpoints/${input.endpointId}/config`,
    method: 'PATCH',
    body: input.config,
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });
  return response.endpoint;
}

export async function saveEndpointResponse(input: {
  projectId: string;
  endpointId: string;
  status: number;
  response: SaveEndpointResponseInput;
}): Promise<ProjectEndpoint> {
  const csrfToken = await getCsrfToken();
  const response = await apiRequest<ProjectEndpointResponse>({
    path: `/projects/${input.projectId}/endpoints/${input.endpointId}/responses/${input.status}`,
    method: 'PUT',
    body: input.response,
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });
  return response.endpoint;
}

export async function deleteEndpointResponse(input: {
  projectId: string;
  endpointId: string;
  status: number;
  contentType: string;
}): Promise<ProjectEndpoint> {
  const csrfToken = await getCsrfToken();
  const params = new URLSearchParams({ contentType: input.contentType });
  const response = await apiRequest<ProjectEndpointResponse>({
    path: `/projects/${input.projectId}/endpoints/${input.endpointId}/responses/${
      input.status
    }?${params.toString()}`,
    method: 'DELETE',
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });
  return response.endpoint;
}
