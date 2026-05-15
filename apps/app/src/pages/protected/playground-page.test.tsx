import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProjectDetail, ProjectEndpoint } from '@ghostapi/types';

import { PlaygroundPage } from './playground-page';

const apiMocks = vi.hoisted(() => ({
  getProject: vi.fn(),
  listProjectEndpoints: vi.fn(),
  updateEndpointConfig: vi.fn(),
  saveEndpointResponse: vi.fn(),
  deleteEndpointResponse: vi.fn(),
}));

vi.mock('@/lib/env', () => ({
  env: {
    VITE_API_URL: 'http://localhost:3001',
  },
}));

vi.mock('@/features/projects/api/projects-api', () => apiMocks);

vi.mock('@monaco-editor/react', () => ({
  default: ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange?: (value: string) => void;
    options?: { readOnly?: boolean };
  }) => (
    <textarea
      aria-label={options?.readOnly ? 'Rendered response body' : 'Editable JSON body'}
      readOnly={options?.readOnly}
      value={value}
      onChange={(event) => onChange?.(event.currentTarget.value)}
    />
  ),
}));

describe('PlaygroundPage mock workflow', () => {
  let currentEndpoint: ProjectEndpoint;

  beforeEach(() => {
    vi.clearAllMocks();
    currentEndpoint = endpoint();
    apiMocks.getProject.mockResolvedValue(project());
    apiMocks.listProjectEndpoints.mockImplementation(async () => [currentEndpoint]);
    apiMocks.updateEndpointConfig.mockImplementation(async ({ config }) => {
      currentEndpoint = endpoint({ config: { ...currentEndpoint.config, ...config } });
      return currentEndpoint;
    });
    apiMocks.saveEndpointResponse.mockImplementation(async ({ response, status }) => {
      currentEndpoint = endpoint({
        config: currentEndpoint.config,
        savedResponses: [
          {
            status,
            contentType: response.contentType,
            body: response.body,
          },
        ],
      });
      return currentEndpoint;
    });
  });

  it('saves a mock response, refreshes the selected endpoint, and sends the playground request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(String(input)).toBe(
          'http://localhost:3001/mock/00000000-0000-4000-8000-000000000010/users',
        );
        expect(init?.method).toBe('GET');
        return new Response(JSON.stringify({ message: 'edited' }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'x-ghostapi-request-log-id': '00000000-0000-4000-8000-000000000099',
          },
        });
      }),
    );

    renderPlayground();

    await screen.findByText('Testing /users');
    fireEvent.click(screen.getByRole('button', { name: 'Mock' }));

    fireEvent.change(screen.getByLabelText('Editable JSON body'), {
      target: { value: '{ "message": "edited" }' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save body/i }));

    await waitFor(() => expect(apiMocks.saveEndpointResponse).toHaveBeenCalledTimes(1));
    expect(apiMocks.saveEndpointResponse.mock.calls[0]?.[0]).toEqual({
      projectId: '00000000-0000-4000-8000-000000000010',
      endpointId: '00000000-0000-4000-8000-000000000020',
      status: 200,
      response: {
        contentType: 'application/json',
        body: { message: 'edited' },
      },
    });
    await screen.findByText('Saved override');

    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await screen.findByText('200');
    await screen.findByRole('link', { name: /View log/i });
    await waitFor(() => {
      expect((screen.getByLabelText('Rendered response body') as HTMLTextAreaElement).value).toBe(
        '{\n  "message": "edited"\n}',
      );
    });
  });
});

function renderPlayground() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/projects/00000000-0000-4000-8000-000000000010/playground']}>
        <Routes>
          <Route path="/projects/:projectId/playground" element={<PlaygroundPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function project(): ProjectDetail {
  return {
    id: '00000000-0000-4000-8000-000000000010',
    ownerId: '00000000-0000-4000-8000-000000000001',
    name: 'James API',
    slug: 'james-api',
    description: 'Mock API',
    icon: null,
    role: 'OWNER',
    visibility: 'Private',
    status: 'Live',
    endpointCount: 1,
    requestCount: 0,
    activityLogRetentionDays: 0,
    mockDefaults: {
      latencyMs: 0,
      statusCode: null,
      authRequired: false,
      errorChance: 0,
    },
    environment: {
      name: 'Development',
      baseUrl: 'https://api.example.com',
    },
    environments: [
      {
        id: '00000000-0000-4000-8000-000000000011',
        name: 'Development',
        baseUrl: 'https://api.example.com',
        description: null,
        color: '#22c55e',
        icon: 'globe',
        status: 'ACTIVE',
        variables: {},
        headers: {},
        authConfig: {},
        corsConfig: {},
        createdAt: '2026-05-15T00:00:00.000Z',
        updatedAt: '2026-05-15T00:00:00.000Z',
      },
    ],
    schemas: [
      {
        id: '00000000-0000-4000-8000-000000000012',
        version: 1,
        title: 'James API',
        schemaVersion: '1.0.0',
        endpointCount: 1,
        sizeBytes: 1024,
        uploadedAt: '2026-05-15T00:00:00.000Z',
      },
    ],
    overview: {
      requestTrend: [],
      routeMethodBreakdown: [],
      statusBreakdown: [],
      averageDurationMs: null,
      recentRequests: [],
      sampleEndpoint: { method: 'GET', path: '/users' },
    },
    createdAt: '2026-05-15T00:00:00.000Z',
    updatedAt: '2026-05-15T00:00:00.000Z',
  };
}

function endpoint({
  config = {
    latencyMs: 0,
    statusCode: null,
    authRequired: false,
    errorChance: 0,
  },
  savedResponses = [],
}: {
  config?: ProjectEndpoint['config'];
  savedResponses?: ProjectEndpoint['savedResponses'];
} = {}): ProjectEndpoint {
  return {
    id: '00000000-0000-4000-8000-000000000020',
    method: 'GET',
    path: '/users',
    group: 'Users',
    parameters: [],
    requestBody: null,
    responses: [
      {
        status: 200,
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'generated' },
          },
        },
        mediaTypes: [
          {
            contentType: 'application/json',
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'generated' },
              },
            },
          },
        ],
      },
    ],
    config,
    savedResponses,
    createdAt: '2026-05-15T00:00:00.000Z',
    updatedAt: '2026-05-15T00:00:00.000Z',
  };
}
