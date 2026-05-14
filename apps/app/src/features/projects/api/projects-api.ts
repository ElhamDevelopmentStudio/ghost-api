import {
  CSRF_HEADER,
  type CreateProjectInput,
  type ListProjectsResponse,
  type ProjectDetail,
  type ProjectDetailResponse,
  type ProjectResponse,
  type ProjectSummary,
  type UploadProjectSchemaResponse,
} from '@ghostapi/types';

import { getCsrfToken } from '@/features/auth/api/auth-api';
import { apiRequest } from '@/lib/api-client';

export type { CreateProjectInput, ProjectDetail, ProjectSummary };

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
