import type { EndpointMockConfig, ProjectEndpoint } from '@ghostapi/types';
import { Button } from '@ghostapi/ui';

import { clamp, uniqueNumbers } from '../utils/format';
import { responseContentTypesForStatus } from '../utils/sample-value';
import { JsonEditor } from './json-editor';
import { EditorHeader } from './editor-controls';
import { PlaygroundSelect } from './playground-select';

export function MockEditor({
  endpoint,
  config,
  responseStatus,
  responseContentType,
  responseText,
  responseError,
  isSavingConfig,
  isSavingResponse,
  onConfigChange,
  onSaveConfig,
  onStatusChange,
  onContentTypeChange,
  onResponseTextChange,
  onSaveResponse,
}: {
  endpoint: ProjectEndpoint;
  config: EndpointMockConfig;
  responseStatus: number;
  responseContentType: string;
  responseText: string;
  responseError: string | null;
  isSavingConfig: boolean;
  isSavingResponse: boolean;
  onConfigChange: (config: EndpointMockConfig) => void;
  onSaveConfig: () => void;
  onStatusChange: (status: number) => void;
  onContentTypeChange: (contentType: string) => void;
  onResponseTextChange: (value: string) => void;
  onSaveResponse: () => void;
}) {
  const statusOptions = uniqueNumbers([
    ...endpoint.responses.map((item) => item.status),
    ...endpoint.savedResponses.map((item) => item.status),
    responseStatus,
  ]);
  const contentTypeOptions = responseContentTypesForStatus(endpoint, responseStatus);

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="space-y-4">
        <EditorHeader
          title="Mock behavior"
          actionLabel="Save settings"
          onAction={onSaveConfig}
          loading={isSavingConfig}
        />
        <label className="text-white/62 block text-sm">
          Latency ms
          <input
            type="number"
            min={0}
            max={60000}
            value={config.latencyMs}
            onChange={(event) =>
              onConfigChange({ ...config, latencyMs: clamp(Number(event.target.value), 0, 60000) })
            }
            className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none"
          />
        </label>
        <label className="text-white/62 block text-sm">
          Status override
          <input
            type="number"
            min={100}
            max={599}
            value={config.statusCode ?? ''}
            placeholder="Schema default"
            onChange={(event) =>
              onConfigChange({
                ...config,
                statusCode: event.target.value ? clamp(Number(event.target.value), 100, 599) : null,
              })
            }
            className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-white/35"
          />
        </label>
        <label className="text-white/62 block text-sm">
          Error chance {Math.round(config.errorChance * 100)}%
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(config.errorChance * 100)}
            onChange={(event) =>
              onConfigChange({ ...config, errorChance: Number(event.target.value) / 100 })
            }
            className="mt-2 w-full accent-violet-500"
          />
        </label>
        <label className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white">
          Require bearer token
          <input
            type="checkbox"
            checked={config.authRequired}
            onChange={(event) => onConfigChange({ ...config, authRequired: event.target.checked })}
            className="size-4 accent-violet-500"
          />
        </label>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-white">Saved response body</p>
            <p className="mt-1 text-xs text-white/45">
              Saved bodies are used by the runtime before generated mock data.
            </p>
          </div>
          <div className="flex min-w-0 flex-wrap gap-2">
            <PlaygroundSelect
              value={String(responseStatus)}
              options={statusOptions.map((status) => ({
                label: String(status),
                value: String(status),
              }))}
              ariaLabel="Saved response status"
              className="w-24 shrink-0"
              onChange={(value) => onStatusChange(Number(value))}
            />
            <PlaygroundSelect
              value={responseContentType}
              options={contentTypeOptions.map((contentType) => ({
                label: contentType,
                value: contentType,
              }))}
              ariaLabel="Saved response media type"
              className="min-w-[12rem] max-w-[220px] font-mono"
              onChange={onContentTypeChange}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onSaveResponse}
              loading={isSavingResponse}
              disabled={Boolean(responseError)}
            >
              Save body
            </Button>
          </div>
        </div>
        <JsonEditor value={responseText} onChange={onResponseTextChange} />
        {responseError ? <p className="text-sm text-red-200">{responseError}</p> : null}
      </div>
    </div>
  );
}
