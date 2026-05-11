import { getCsrfToken } from '@/features/auth/api/auth-api';
import { apiRequest } from '@/lib/api-client';

const CSRF_HEADER = 'x-csrf-token';

export type ProjectSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  visibility: 'Private' | 'Team';
  status: 'Live' | 'Paused';
  endpointCount: number;
  requestCount: number;
  environment: {
    name: string;
    baseUrl: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  icon?: string;
  imageAttachmentId?: string;
  baseUrl?: string;
  environment: 'Development' | 'Staging' | 'Production';
};

type ProjectsResponse = {
  projects: ProjectSummary[];
};

type CreateProjectResponse = {
  project: ProjectSummary;
};

export async function listProjects(): Promise<ProjectSummary[]> {
  const response = await apiRequest<ProjectsResponse>({ path: '/projects' });
  return response.projects;
}

export async function createProject(input: CreateProjectInput): Promise<ProjectSummary> {
  const csrfToken = await getCsrfToken();
  const response = await apiRequest<CreateProjectResponse>({
    path: '/projects',
    method: 'POST',
    body: input,
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });

  return response.project;
}
