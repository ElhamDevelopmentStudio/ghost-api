import type { EndpointMockConfig, ProjectEndpoint } from '@ghostapi/types';

import { REQUEST_TABS } from '../constants';
import type { HeaderDraft, ParamDraft, RequestDraft, RequestTab } from '../types';
import { effectiveHeaders } from '../utils/headers';
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
  savedResponseText,
  responseBodyError,
  isSavingConfig,
  isSavingResponse,
  onTabChange,
  onParamsChange,
  onHeadersChange,
  onBodyChange,
  onAuthModeChange,
  onAuthTokenChange,
  onConfigChange,
  onSaveConfig,
  onStatusChange,
  onResponseTextChange,
  onSaveResponse,
}: {
  endpoint: ProjectEndpoint | null;
  request: RequestDraft;
  sharedHeaders: HeaderDraft[];
  activeTab: RequestTab;
  config: EndpointMockConfig | null;
  responseStatus: number;
  savedResponseText: string;
  responseBodyError: string | null;
  isSavingConfig: boolean;
  isSavingResponse: boolean;
  onTabChange: (tab: RequestTab) => void;
  onParamsChange: (params: ParamDraft[]) => void;
  onHeadersChange: (headers: HeaderDraft[]) => void;
  onBodyChange: (bodyText: string) => void;
  onAuthModeChange: (mode: 'none' | 'bearer') => void;
  onAuthTokenChange: (token: string) => void;
  onConfigChange: (config: EndpointMockConfig) => void;
  onSaveConfig: () => void;
  onStatusChange: (status: number) => void;
  onResponseTextChange: (value: string) => void;
  onSaveResponse: () => void;
}) {
  const enabledHeaders = effectiveHeaders({
    requestHeaders: request.headers,
    sharedHeaders,
  });

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
            disabled={!endpoint?.requestBody}
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
            responseText={savedResponseText}
            responseError={responseBodyError}
            isSavingConfig={isSavingConfig}
            isSavingResponse={isSavingResponse}
            onConfigChange={onConfigChange}
            onSaveConfig={onSaveConfig}
            onStatusChange={onStatusChange}
            onResponseTextChange={onResponseTextChange}
            onSaveResponse={onSaveResponse}
          />
        ) : null}
      </div>
    </section>
  );
}
