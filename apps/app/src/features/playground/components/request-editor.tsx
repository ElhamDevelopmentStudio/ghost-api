import type { EndpointMockConfig, ProjectEndpoint } from '@ghostapi/types';

import { REQUEST_TABS } from '../constants';
import type { HeaderDraft, ParamDraft, RequestDraft, RequestTab } from '../types';
import { effectiveContentType, effectiveHeaders } from '../utils/headers';
import { requestContentTypesForEndpoint } from '../utils/request';
import { AuthEditor } from './auth-editor';
import { BodyEditor } from './body-editor';
import { HeadersEditor } from './headers-editor';
import { MockEditor } from './mock-editor';
import { ParamsEditor } from './params-editor';
import { TabBar } from './tab-bar';

export function RequestEditor({
  endpoint,
  request,
  sharedHeaders,
  activeTab,
  config,
  responseStatus,
  responseContentType,
  savedResponseText,
  responseBodyError,
  isSavingConfig,
  isSavingResponse,
  onTabChange,
  onParamsChange,
  onHeadersChange,
  onRequestContentTypeChange,
  onBodyChange,
  onAuthModeChange,
  onAuthTokenChange,
  onConfigChange,
  onSaveConfig,
  onStatusChange,
  onContentTypeChange,
  onResponseTextChange,
  onSaveResponse,
}: {
  endpoint: ProjectEndpoint | null;
  request: RequestDraft;
  sharedHeaders: HeaderDraft[];
  activeTab: RequestTab;
  config: EndpointMockConfig | null;
  responseStatus: number;
  responseContentType: string;
  savedResponseText: string;
  responseBodyError: string | null;
  isSavingConfig: boolean;
  isSavingResponse: boolean;
  onTabChange: (tab: RequestTab) => void;
  onParamsChange: (params: ParamDraft[]) => void;
  onHeadersChange: (headers: HeaderDraft[]) => void;
  onRequestContentTypeChange: (contentType: string) => void;
  onBodyChange: (bodyText: string) => void;
  onAuthModeChange: (mode: 'none' | 'bearer') => void;
  onAuthTokenChange: (token: string) => void;
  onConfigChange: (config: EndpointMockConfig) => void;
  onSaveConfig: () => void;
  onStatusChange: (status: number) => void;
  onContentTypeChange: (contentType: string) => void;
  onResponseTextChange: (value: string) => void;
  onSaveResponse: () => void;
}) {
  const enabledHeaders = effectiveHeaders({
    requestHeaders: request.headers,
    sharedHeaders,
  });
  const contentType = effectiveContentType({
    requestHeaders: request.headers,
    sharedHeaders,
    fallback: endpoint?.requestBody?.contentType,
  });
  const requestContentTypes = endpoint ? requestContentTypesForEndpoint(endpoint) : [];

  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-[#070b12]">
      <TabBar
        items={REQUEST_TABS}
        active={activeTab}
        onChange={onTabChange}
        counts={{ Headers: enabledHeaders.length }}
      />
      <div className="p-4 md:p-5">
        {activeTab === 'Params' ? (
          <ParamsEditor params={request.params} onChange={onParamsChange} />
        ) : null}
        {activeTab === 'Headers' ? (
          <HeadersEditor
            headers={request.headers}
            sharedHeaders={sharedHeaders}
            onChange={onHeadersChange}
          />
        ) : null}
        {activeTab === 'Body' ? (
          <BodyEditor
            bodyText={request.bodyText}
            contentType={request.bodyContentType || contentType}
            effectiveContentType={contentType}
            contentTypeOptions={requestContentTypes}
            disabled={!endpoint?.requestBody}
            onContentTypeChange={onRequestContentTypeChange}
            onChange={onBodyChange}
          />
        ) : null}
        {activeTab === 'Auth' ? (
          <AuthEditor
            mode={request.auth.mode}
            token={request.auth.token}
            onModeChange={onAuthModeChange}
            onTokenChange={onAuthTokenChange}
            authRequired={Boolean(config?.authRequired)}
          />
        ) : null}
        {activeTab === 'Mock' && endpoint && config ? (
          <MockEditor
            endpoint={endpoint}
            config={config}
            responseStatus={responseStatus}
            responseContentType={responseContentType}
            responseText={savedResponseText}
            responseError={responseBodyError}
            isSavingConfig={isSavingConfig}
            isSavingResponse={isSavingResponse}
            onConfigChange={onConfigChange}
            onSaveConfig={onSaveConfig}
            onStatusChange={onStatusChange}
            onContentTypeChange={onContentTypeChange}
            onResponseTextChange={onResponseTextChange}
            onSaveResponse={onSaveResponse}
          />
        ) : null}
      </div>
    </section>
  );
}
