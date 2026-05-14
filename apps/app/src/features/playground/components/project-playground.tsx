import { useEffect, useMemo, useReducer } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { HttpMethod, ProjectDetail, ProjectEndpoint } from '@ghostapi/types';
import { toast } from '@ghostapi/ui';

import {
  deleteEndpointResponse,
  saveEndpointResponse,
  updateEndpointConfig,
} from '@/features/projects/api/projects-api';
import { env } from '@/lib/env';
import { initialPlaygroundState, playgroundReducer } from '../state/playground-reducer';
import { filterEndpoints } from '../utils/endpoint-list';
import { effectiveContentType, isJsonContentType } from '../utils/headers';
import { parseEditableJson, validateJsonText } from '../utils/json';
import { executePlaygroundRequest, validateRequestBody } from '../utils/request';
import {
  loadSharedHeaders,
  normalizeSharedHeaders,
  saveSharedHeaders,
} from '../utils/shared-headers-storage';
import { EndpointExplorer } from './endpoint-explorer';
import { PlaygroundEmpty, PlaygroundError, PlaygroundSkeleton } from './playground-empty-states';
import { RequestEditor } from './request-editor';
import { RequestToolbar } from './request-toolbar';
import { ResponsePanel } from './response-panel';
import { SharedHeadersSheet } from './shared-headers-sheet';

type ProjectPlaygroundProps = {
  project: ProjectDetail;
  endpoints: ProjectEndpoint[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function ProjectPlayground({
  project,
  endpoints,
  isLoading,
  isError,
  onRetry,
}: ProjectPlaygroundProps) {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(playgroundReducer, project.id, (projectId) => ({
    ...initialPlaygroundState,
    sharedHeaders: loadSharedHeaders(projectId),
  }));
  const runtimeBase = `${env.VITE_API_URL.replace(/\/$/, '')}/mock/${project.id}`;

  const filteredEndpoints = useMemo(
    () => filterEndpoints(endpoints, state.search),
    [endpoints, state.search],
  );
  const selectedEndpoint =
    endpoints.find((endpoint) => endpoint.id === state.selectedEndpointId) ?? null;

  const configMutation = useMutation({
    mutationFn: updateEndpointConfig,
    onSuccess: async (updatedEndpoint) => {
      await queryClient.setQueryData<ProjectEndpoint[]>(
        ['projects', project.id, 'endpoints'],
        (current) =>
          current?.map((endpoint) =>
            endpoint.id === updatedEndpoint.id ? updatedEndpoint : endpoint,
          ) ?? current,
      );
      dispatch({ type: 'mockEndpointUpdated', endpoint: updatedEndpoint });
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id, 'endpoints'] });
      toast.success('Mock settings saved');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Mock settings could not be saved');
    },
  });

  const responseMutation = useMutation({
    mutationFn: saveEndpointResponse,
    onSuccess: async (updatedEndpoint) => {
      await queryClient.setQueryData<ProjectEndpoint[]>(
        ['projects', project.id, 'endpoints'],
        (current) =>
          current?.map((endpoint) =>
            endpoint.id === updatedEndpoint.id ? updatedEndpoint : endpoint,
          ) ?? current,
      );
      dispatch({ type: 'mockEndpointUpdated', endpoint: updatedEndpoint });
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id, 'endpoints'] });
      toast.success('Response body saved');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Response body could not be saved');
    },
  });

  const deleteResponseMutation = useMutation({
    mutationFn: deleteEndpointResponse,
    onSuccess: async (updatedEndpoint) => {
      await queryClient.setQueryData<ProjectEndpoint[]>(
        ['projects', project.id, 'endpoints'],
        (current) =>
          current?.map((endpoint) =>
            endpoint.id === updatedEndpoint.id ? updatedEndpoint : endpoint,
          ) ?? current,
      );
      dispatch({ type: 'mockEndpointUpdated', endpoint: updatedEndpoint });
      await queryClient.invalidateQueries({ queryKey: ['projects', project.id, 'endpoints'] });
      toast.success('Saved response removed');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Saved response could not be removed');
    },
  });

  useEffect(() => {
    saveSharedHeaders(project.id, state.sharedHeaders);
  }, [project.id, state.sharedHeaders]);

  useEffect(() => {
    if (!endpoints.length) {
      dispatch({ type: 'endpointsCleared' });
      return;
    }

    if (
      !state.selectedEndpointId ||
      !endpoints.some((endpoint) => endpoint.id === state.selectedEndpointId)
    ) {
      const firstEndpoint = endpoints[0];
      if (firstEndpoint)
        dispatch({ type: 'endpointSelected', endpoint: firstEndpoint, runtimeBase });
    }
  }, [endpoints, runtimeBase, state.selectedEndpointId]);

  const responseBodyError = isJsonContentType(state.mock.responseContentType)
    ? validateJsonText(state.mock.responseText)
    : null;

  async function sendRequest() {
    if (!selectedEndpoint) return;

    const bodyError = validateRequestBody({
      body: state.request.bodyText,
      method: state.request.method,
      hasBody: Boolean(selectedEndpoint.requestBody),
      contentType: effectiveContentType({
        requestHeaders: state.request.headers,
        sharedHeaders: state.sharedHeaders,
        fallback: selectedEndpoint.requestBody?.contentType,
      }),
    });
    if (bodyError) {
      dispatch({ type: 'requestValidationFailed', message: bodyError });
      return;
    }

    dispatch({ type: 'requestStarted' });
    try {
      dispatch({
        type: 'requestSucceeded',
        response: await executePlaygroundRequest({
          request: state.request,
          sharedHeaders: state.sharedHeaders,
        }),
      });
    } catch (error) {
      dispatch({
        type: 'requestFailed',
        message: error instanceof Error ? error.message : 'Request failed',
      });
    }
  }

  function saveRequestState() {
    if (!selectedEndpoint) return;
    window.localStorage.setItem(
      `ghostapi:playground:${project.id}:${selectedEndpoint.id}`,
      JSON.stringify({
        endpointId: selectedEndpoint.id,
        request: state.request,
        savedAt: new Date().toISOString(),
      }),
    );
    toast.success('Request saved locally');
  }

  function saveConfig() {
    if (!selectedEndpoint || !state.mock.config) return;
    configMutation.mutate({
      projectId: project.id,
      endpointId: selectedEndpoint.id,
      config: state.mock.config,
    });
  }

  function saveResponseBody() {
    if (!selectedEndpoint) return;
    const parsed = parseEditableBody(state.mock.responseText, state.mock.responseContentType);
    if (!parsed.ok) return;

    responseMutation.mutate({
      projectId: project.id,
      endpointId: selectedEndpoint.id,
      status: state.mock.responseStatus,
      response: { contentType: state.mock.responseContentType, body: parsed.value },
    });
  }

  function deleteResponseBody() {
    if (!selectedEndpoint) return;
    deleteResponseMutation.mutate({
      projectId: project.id,
      endpointId: selectedEndpoint.id,
      status: state.mock.responseStatus,
      contentType: state.mock.responseContentType,
    });
  }

  function useResponseStatus() {
    if (!selectedEndpoint || !state.mock.config) return;
    const nextConfig = { ...state.mock.config, statusCode: state.mock.responseStatus };
    dispatch({ type: 'configChanged', config: nextConfig });
    configMutation.mutate({
      projectId: project.id,
      endpointId: selectedEndpoint.id,
      config: nextConfig,
    });
  }

  return (
    <section className="grid h-screen min-h-0 overflow-hidden bg-[#02050a] text-white lg:grid-cols-[268px_minmax(0,1fr)]">
      <EndpointExplorer
        project={project}
        endpoints={filteredEndpoints}
        search={state.search}
        runtimeBase={runtimeBase}
        selectedEndpointId={state.selectedEndpointId}
        onSearchChange={(value) => dispatch({ type: 'searchChanged', value })}
        onSelectEndpoint={(endpoint) =>
          dispatch({ type: 'endpointSelected', endpoint, runtimeBase })
        }
        onRefresh={onRetry}
      />

      <div className="min-w-0 overflow-y-auto">
        <div className="space-y-5 px-5 py-5 xl:px-6">
          {isLoading ? <PlaygroundSkeleton /> : null}
          {isError ? <PlaygroundError onRetry={onRetry} /> : null}
          {!isLoading && !isError && !endpoints.length ? <PlaygroundEmpty /> : null}
          {!isLoading && !isError && endpoints.length ? (
            <>
              <RequestToolbar
                project={project}
                endpointPath={selectedEndpoint?.path ?? null}
                request={state.request}
                isSending={state.isSending}
                requestError={state.requestError}
                runtimeBase={runtimeBase}
                sharedHeaderCount={
                  state.sharedHeaders.filter((header) => header.enabled && header.key.trim()).length
                }
                onRequestChange={(request) => {
                  if (request.method !== state.request.method) {
                    dispatch({ type: 'methodChanged', method: request.method as HttpMethod });
                    return;
                  }
                  if (request.url !== state.request.url) {
                    dispatch({ type: 'urlChanged', url: request.url });
                  }
                }}
                onOpenSharedHeaders={() =>
                  dispatch({ type: 'sharedHeadersOpenChanged', open: true })
                }
                onSend={() => void sendRequest()}
                onSave={saveRequestState}
              />

              <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(430px,0.8fr)]">
                <RequestEditor
                  endpoint={selectedEndpoint}
                  request={state.request}
                  sharedHeaders={state.sharedHeaders}
                  activeTab={state.requestTab}
                  config={state.mock.config}
                  responseStatus={state.mock.responseStatus}
                  responseContentType={state.mock.responseContentType}
                  savedResponseText={state.mock.responseText}
                  responseBodyError={responseBodyError}
                  isSavingConfig={configMutation.isPending}
                  isSavingResponse={responseMutation.isPending}
                  isDeletingResponse={deleteResponseMutation.isPending}
                  onTabChange={(tab) => dispatch({ type: 'requestTabChanged', tab })}
                  onParamsChange={(params) => {
                    if (selectedEndpoint) {
                      dispatch({
                        type: 'paramsChanged',
                        params,
                        endpoint: selectedEndpoint,
                        runtimeBase,
                      });
                    }
                  }}
                  onHeadersChange={(headers) => dispatch({ type: 'headersChanged', headers })}
                  onRequestContentTypeChange={(contentType) => {
                    if (selectedEndpoint) {
                      dispatch({
                        type: 'requestContentTypeChanged',
                        endpoint: selectedEndpoint,
                        contentType,
                      });
                    }
                  }}
                  onBodyChange={(bodyText) => dispatch({ type: 'bodyChanged', bodyText })}
                  onAuthModeChange={(mode) => dispatch({ type: 'authModeChanged', mode })}
                  onAuthTokenChange={(token) => dispatch({ type: 'authTokenChanged', token })}
                  onConfigChange={(config) => dispatch({ type: 'configChanged', config })}
                  onSaveConfig={saveConfig}
                  onStatusChange={(status) => {
                    if (selectedEndpoint) {
                      dispatch({ type: 'mockStatusChanged', endpoint: selectedEndpoint, status });
                    }
                  }}
                  onContentTypeChange={(contentType) => {
                    if (selectedEndpoint) {
                      dispatch({
                        type: 'mockContentTypeChanged',
                        endpoint: selectedEndpoint,
                        contentType,
                      });
                    }
                  }}
                  onResponseTextChange={(value) =>
                    dispatch({ type: 'mockResponseTextChanged', value })
                  }
                  onSaveResponse={saveResponseBody}
                  onDeleteResponse={deleteResponseBody}
                  onUseResponseStatus={useResponseStatus}
                />

                <ResponsePanel
                  project={project}
                  response={state.response}
                  activeTab={state.responseTab}
                  format={state.responseFormat}
                  search={state.responseSearch}
                  onTabChange={(tab) => dispatch({ type: 'responseTabChanged', tab })}
                  onFormatChange={(format) => dispatch({ type: 'responseFormatChanged', format })}
                  onSearchChange={(value) => dispatch({ type: 'responseSearchChanged', value })}
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
      <SharedHeadersSheet
        open={state.sharedHeadersOpen}
        headers={state.sharedHeaders}
        onOpenChange={(open) => dispatch({ type: 'sharedHeadersOpenChanged', open })}
        onChange={(headers) =>
          dispatch({ type: 'sharedHeadersChanged', headers: normalizeSharedHeaders(headers) })
        }
      />
    </section>
  );
}

function parseEditableBody(
  value: string,
  contentType: string,
): { ok: true; value: unknown } | { ok: false } {
  if (!isJsonContentType(contentType)) return { ok: true, value };
  return parseEditableJson(value);
}
