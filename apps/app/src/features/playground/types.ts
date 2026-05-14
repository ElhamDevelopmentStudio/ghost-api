import type { EndpointMockConfig, HttpMethod } from '@ghostapi/types';

export type RequestTab = 'Params' | 'Headers' | 'Body' | 'Auth' | 'Mock';
export type ResponseTab = 'Response' | 'Headers' | 'Timeline';
export type ResponseFormat = 'pretty' | 'raw';

export type ParamDraft = {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
  location: 'path' | 'query';
  required: boolean;
};

export type HeaderDraft = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

export type AuthDraft = {
  mode: 'none' | 'bearer';
  token: string;
};

export type RequestDraft = {
  method: HttpMethod;
  url: string;
  params: ParamDraft[];
  headers: HeaderDraft[];
  bodyContentType: string;
  bodyText: string;
  bodyByContentType: Record<string, string>;
  auth: AuthDraft;
};

export type PlaygroundResponse = {
  status: number;
  ok: boolean;
  durationMs: number;
  sizeBytes: number;
  receivedAt: string;
  headers: Array<{ key: string; value: string }>;
  bodyText: string;
  parsedBody: unknown;
  url: string;
  method: string;
  requestHeaders: Array<{ key: string; value: string }>;
  requestBodyText: string;
  requestContentType: string;
  responseContentType: string;
  activityLogId: string | null;
};

export type MockDraft = {
  config: EndpointMockConfig | null;
  responseStatus: number;
  responseContentType: string;
  responseText: string;
};

export type SharedHeadersDraft = {
  headers: HeaderDraft[];
};
