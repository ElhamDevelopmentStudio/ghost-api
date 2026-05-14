import {
  CSRF_HEADER,
  type CreateProjectInput,
  type EndpointMockConfig,
  type ListProjectsResponse,
  type ListProjectEndpointsResponse,
  type ProjectDetail,
  type ProjectDetailResponse,
  type ProjectEndpoint,
  type ProjectEndpointResponse,
  type ProjectResponse,
  type ProjectSummary,
  type SaveEndpointResponseInput,
  type UpdateEndpointConfigInput,
  type UploadProjectSchemaResponse,
} from '@ghostapi/types';

import { getCsrfToken } from '@/features/auth/api/auth-api';
import { apiRequest } from '@/lib/api-client';

export type {
  CreateProjectInput,
  EndpointMockConfig,
  ProjectDetail,
  ProjectEndpoint,
  ProjectSummary,
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

export async function uploadProjectSchema(input: {
  projectId: string;
  content: string;
}): Promise<UploadProjectSchemaResponse> {
  const csrfToken = await getCsrfToken();
  return apiRequest<UploadProjectSchemaResponse>({
    path: `/projects/${input.projectId}/schemas`,
    method: 'POST',
    body: { content: input.content },
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
