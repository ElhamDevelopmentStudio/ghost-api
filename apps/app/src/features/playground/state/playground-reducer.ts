import type { EndpointMockConfig, HttpMethod, ProjectEndpoint } from '@ghostapi/types';
import type {
  HeaderDraft,
  MockDraft,
  ParamDraft,
  PlaygroundResponse,
  RequestDraft,
  RequestTab,
  ResponseFormat,
  ResponseTab,
} from '../types';
import {
  buildRequestUrl,
  endpointRequestDraft,
  requestHeadersForContentType,
  sampleRequestBodyText,
} from '../utils/request';
import { preferredResponseContentType, savedResponseTextForStatus } from '../utils/sample-value';

export type PlaygroundState = {
  search: string;
  selectedEndpointId: string | null;
  requestTab: RequestTab;
  responseTab: ResponseTab;
  request: RequestDraft;
  mock: MockDraft;
  response: PlaygroundResponse | null;
  sharedHeaders: HeaderDraft[];
  sharedHeadersOpen: boolean;
  requestError: string | null;
  responseFormat: ResponseFormat;
  responseSearch: string;
  isSending: boolean;
};

export type PlaygroundAction =
  | { type: 'searchChanged'; value: string }
  | { type: 'endpointSelected'; endpoint: ProjectEndpoint; runtimeBase: string }
  | { type: 'requestTabChanged'; tab: RequestTab }
  | { type: 'responseTabChanged'; tab: ResponseTab }
  | { type: 'methodChanged'; method: HttpMethod }
  | { type: 'urlChanged'; url: string }
  | { type: 'paramsChanged'; params: ParamDraft[]; endpoint: ProjectEndpoint; runtimeBase: string }
  | { type: 'headersChanged'; headers: HeaderDraft[] }
  | { type: 'sharedHeadersChanged'; headers: HeaderDraft[] }
  | { type: 'sharedHeadersOpenChanged'; open: boolean }
  | { type: 'requestContentTypeChanged'; endpoint: ProjectEndpoint; contentType: string }
  | { type: 'bodyChanged'; bodyText: string }
  | { type: 'bodyBeautified'; bodyText: string }
  | { type: 'authModeChanged'; mode: 'none' | 'bearer' }
  | { type: 'authTokenChanged'; token: string }
  | { type: 'configChanged'; config: EndpointMockConfig }
  | { type: 'mockStatusChanged'; endpoint: ProjectEndpoint; status: number }
  | { type: 'mockContentTypeChanged'; endpoint: ProjectEndpoint; contentType: string }
  | { type: 'mockResponseTextChanged'; value: string }
  | { type: 'requestStarted' }
  | { type: 'requestSucceeded'; response: PlaygroundResponse }
  | { type: 'requestFailed'; message: string }
  | { type: 'requestValidationFailed'; message: string }
  | { type: 'responseFormatChanged'; format: ResponseFormat }
  | { type: 'responseSearchChanged'; value: string }
  | { type: 'endpointsCleared' };

export const initialPlaygroundState: PlaygroundState = {
  search: '',
  selectedEndpointId: null,
  requestTab: 'Params',
  responseTab: 'Response',
  request: {
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    bodyContentType: 'application/json',
    bodyText: '',
    bodyByContentType: {},
    auth: { mode: 'none', token: '' },
  },
  mock: {
    config: null,
    responseStatus: 200,
    responseContentType: 'application/json',
    responseText: '',
  },
  sharedHeaders: [],
  sharedHeadersOpen: false,
  response: null,
  requestError: null,
  responseFormat: 'pretty',
  responseSearch: '',
  isSending: false,
};

export function playgroundReducer(
  state: PlaygroundState,
  action: PlaygroundAction,
): PlaygroundState {
  switch (action.type) {
    case 'searchChanged':
      return { ...state, search: action.value };
    case 'endpointSelected':
      return endpointState(state, action.endpoint, action.runtimeBase);
    case 'requestTabChanged':
      return { ...state, requestTab: action.tab };
    case 'responseTabChanged':
      return { ...state, responseTab: action.tab };
    case 'methodChanged':
      return { ...state, request: { ...state.request, method: action.method } };
    case 'urlChanged':
      return { ...state, request: { ...state.request, url: action.url } };
    case 'paramsChanged':
      return {
        ...state,
        request: {
          ...state.request,
          params: action.params,
          url: buildRequestUrl(action.runtimeBase, action.endpoint.path, action.params),
        },
      };
    case 'headersChanged':
      return { ...state, request: { ...state.request, headers: action.headers } };
    case 'sharedHeadersChanged':
      return { ...state, sharedHeaders: action.headers };
    case 'sharedHeadersOpenChanged':
      return { ...state, sharedHeadersOpen: action.open };
    case 'requestContentTypeChanged': {
      const bodyText =
        state.request.bodyByContentType[action.contentType] ??
        sampleRequestBodyText(action.endpoint, action.contentType);
      return {
        ...state,
        request: {
          ...state.request,
          headers: requestHeadersForContentType(state.request.headers, action.contentType),
          bodyContentType: action.contentType,
          bodyText,
          bodyByContentType: {
            ...state.request.bodyByContentType,
            [state.request.bodyContentType]: state.request.bodyText,
            [action.contentType]: bodyText,
          },
        },
      };
    }
    case 'bodyChanged':
    case 'bodyBeautified':
      return {
        ...state,
        request: {
          ...state.request,
          bodyText: action.bodyText,
          bodyByContentType: {
            ...state.request.bodyByContentType,
            [state.request.bodyContentType]: action.bodyText,
          },
        },
      };
    case 'authModeChanged':
      return {
        ...state,
        request: { ...state.request, auth: { ...state.request.auth, mode: action.mode } },
      };
    case 'authTokenChanged':
      return {
        ...state,
        request: { ...state.request, auth: { ...state.request.auth, token: action.token } },
      };
    case 'configChanged':
      return { ...state, mock: { ...state.mock, config: action.config } };
    case 'mockStatusChanged': {
      const contentType = preferredResponseContentType(action.endpoint, action.status);
      return {
        ...state,
        mock: {
          ...state.mock,
          responseStatus: action.status,
          responseContentType: contentType,
          responseText: savedResponseTextForStatus(action.endpoint, action.status, contentType),
        },
      };
    }
    case 'mockContentTypeChanged':
      return {
        ...state,
        mock: {
          ...state.mock,
          responseContentType: action.contentType,
          responseText: savedResponseTextForStatus(
            action.endpoint,
            state.mock.responseStatus,
            action.contentType,
          ),
        },
      };
    case 'mockResponseTextChanged':
      return { ...state, mock: { ...state.mock, responseText: action.value } };
    case 'requestStarted':
      return { ...state, isSending: true, requestError: null, response: null };
    case 'requestSucceeded':
      return { ...state, isSending: false, response: action.response, responseTab: 'Response' };
    case 'requestFailed':
      return { ...state, isSending: false, requestError: action.message };
    case 'requestValidationFailed':
      return { ...state, requestError: action.message, requestTab: 'Body' };
    case 'responseFormatChanged':
      return { ...state, responseFormat: action.format };
    case 'responseSearchChanged':
      return { ...state, responseSearch: action.value };
    case 'endpointsCleared':
      return { ...initialPlaygroundState, sharedHeaders: state.sharedHeaders };
    default:
      return state;
  }
}

function endpointState(
  state: PlaygroundState,
  endpoint: ProjectEndpoint,
  runtimeBase: string,
): PlaygroundState {
  const preferredResponse =
    endpoint.config.statusCode ??
    endpoint.savedResponses[0]?.status ??
    endpoint.responses[0]?.status ??
    200;
  const contentType = preferredResponseContentType(endpoint, preferredResponse);

  return {
    ...state,
    selectedEndpointId: endpoint.id,
    request: endpointRequestDraft(endpoint, runtimeBase),
    mock: {
      config: endpoint.config,
      responseStatus: preferredResponse,
      responseContentType: contentType,
      responseText: savedResponseTextForStatus(endpoint, preferredResponse, contentType),
    },
    response: null,
    requestError: null,
  };
}
