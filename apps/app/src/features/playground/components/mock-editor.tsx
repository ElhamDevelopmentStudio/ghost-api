import type { ReactNode } from 'react';
import {
  RiDeleteBinLine,
  RiFlashlightLine,
  RiSave3Line,
  RiShieldKeyholeLine,
} from '@remixicon/react';

import type { EndpointMockConfig, ProjectEndpoint } from '@ghostapi/types';
import { Button, cn } from '@ghostapi/ui';

import { clamp, uniqueNumbers } from '../utils/format';
import { responseContentTypesForStatus } from '../utils/sample-value';
import { JsonEditor } from './json-editor';
import { PlaygroundSelect } from './playground-select';

const COMMON_STATUS_OPTIONS = [200, 201, 202, 204, 400, 401, 403, 404, 409, 422, 500, 503];
const LATENCY_PRESETS = [0, 250, 1000, 3000];
const ERROR_PRESETS = [0, 10, 25, 50, 100];

export function MockEditor({
  endpoint,
  config,
  responseStatus,
  responseContentType,
  responseText,
  responseError,
  isSavingConfig,
  isSavingResponse,
  isDeletingResponse,
  onConfigChange,
  onSaveConfig,
  onStatusChange,
  onContentTypeChange,
  onResponseTextChange,
  onSaveResponse,
  onDeleteResponse,
  onUseResponseStatus,
}: {
  endpoint: ProjectEndpoint;
  config: EndpointMockConfig;
  responseStatus: number;
  responseContentType: string;
  responseText: string;
  responseError: string | null;
  isSavingConfig: boolean;
  isSavingResponse: boolean;
  isDeletingResponse: boolean;
  onConfigChange: (config: EndpointMockConfig) => void;
  onSaveConfig: () => void;
  onStatusChange: (status: number) => void;
  onContentTypeChange: (contentType: string) => void;
  onResponseTextChange: (value: string) => void;
  onSaveResponse: () => void;
  onDeleteResponse: () => void;
  onUseResponseStatus: () => void;
}) {
  const statusOptions = uniqueNumbers([
    ...endpoint.responses.map((item) => item.status),
    ...endpoint.savedResponses.map((item) => item.status),
    ...COMMON_STATUS_OPTIONS,
    responseStatus,
    config.statusCode ?? responseStatus,
  ]);
  const contentTypeOptions = responseContentTypesForStatus(endpoint, responseStatus);
  const schemaStatus = endpoint.responses.some((response) => response.status === responseStatus);
  const savedResponse = endpoint.savedResponses.find(
    (response) =>
      response.status === responseStatus &&
      response.contentType.toLowerCase() === responseContentType.toLowerCase(),
  );
  const isRuntimeStatus = config.statusCode === responseStatus;
  const selectedStatusLabel = `${responseStatus} ${statusLabel(responseStatus)}`;

  return (
    <div className="space-y-5">
      <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-4">
        <Metric
          label="Runtime status"
          value={config.statusCode ? String(config.statusCode) : 'Schema'}
        />
        <Metric label="Latency" value={`${config.latencyMs}ms`} />
        <Metric label="Error chance" value={`${Math.round(config.errorChance * 100)}%`} />
        <Metric label="Auth" value={config.authRequired ? 'Bearer' : 'Open'} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-black/15 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Runtime behavior</p>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  These settings are applied by the mock server before every response.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onSaveConfig}
                loading={isSavingConfig}
              >
                <RiSave3Line className="size-4" />
                Save
              </Button>
            </div>

            <div className="space-y-4">
              <FieldLabel
                title="Status override"
                detail="Force a response code, or return to schema default."
              >
                <PlaygroundSelect
                  value={config.statusCode === null ? 'schema' : String(config.statusCode)}
                  options={[
                    { label: 'Schema default', value: 'schema' },
                    ...statusOptions.map((status) => ({
                      label: `${status} ${statusLabel(status)}`,
                      value: String(status),
                    })),
                  ]}
                  ariaLabel="Runtime response status"
                  className="h-10 w-full"
                  onChange={(value) =>
                    onConfigChange({
                      ...config,
                      statusCode: value === 'schema' ? null : Number(value),
                    })
                  }
                />
              </FieldLabel>

              <FieldLabel
                title="Latency"
                detail="Simulate slow networks, queues, and backend work."
              >
                <div className="grid grid-cols-[minmax(0,1fr)_92px] gap-2">
                  <div className="flex rounded-md border border-white/10 bg-[#0d121b] p-1">
                    {LATENCY_PRESETS.map((preset) => (
                      <PresetButton
                        key={preset}
                        active={config.latencyMs === preset}
                        onClick={() => onConfigChange({ ...config, latencyMs: preset })}
                      >
                        {preset === 0 ? 'None' : `${preset}ms`}
                      </PresetButton>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={60000}
                    value={config.latencyMs}
                    onChange={(event) =>
                      onConfigChange({
                        ...config,
                        latencyMs: clamp(Number(event.target.value), 0, 60000),
                      })
                    }
                    className="h-10 rounded-md border border-white/10 bg-[#0d121b] px-3 text-right font-mono text-sm text-white outline-none focus:border-cyan-300/60"
                    aria-label="Latency milliseconds"
                  />
                </div>
              </FieldLabel>

              <FieldLabel
                title="Failure rate"
                detail="Return randomized server errors while keeping the endpoint mounted."
              >
                <div className="space-y-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(config.errorChance * 100)}
                    onChange={(event) =>
                      onConfigChange({ ...config, errorChance: Number(event.target.value) / 100 })
                    }
                    className="w-full accent-cyan-300"
                    aria-label="Error chance percentage"
                  />
                  <div className="flex rounded-md border border-white/10 bg-[#0d121b] p-1">
                    {ERROR_PRESETS.map((preset) => (
                      <PresetButton
                        key={preset}
                        active={Math.round(config.errorChance * 100) === preset}
                        onClick={() => onConfigChange({ ...config, errorChance: preset / 100 })}
                      >
                        {preset}%
                      </PresetButton>
                    ))}
                  </div>
                </div>
              </FieldLabel>

              <button
                type="button"
                onClick={() => onConfigChange({ ...config, authRequired: !config.authRequired })}
                className={cn(
                  'flex w-full items-center justify-between rounded-md border px-3 py-3 text-left transition',
                  config.authRequired
                    ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100'
                    : 'border-white/10 bg-[#0d121b] text-white/75 hover:border-white/20',
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-md bg-white/[0.06]">
                    <RiShieldKeyholeLine className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">Require bearer token</span>
                    <span className="mt-0.5 block text-xs text-white/45">
                      Requests without Authorization receive 401.
                    </span>
                  </span>
                </span>
                <span className="rounded border border-white/10 px-2 py-1 text-xs">
                  {config.authRequired ? 'On' : 'Off'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-white/10 bg-black/15">
          <div className="border-b border-white/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-white">Saved response</p>
                  <StatusBadge tone={savedResponse ? 'green' : 'muted'}>
                    {savedResponse ? 'Saved override' : 'Generated fallback'}
                  </StatusBadge>
                  {schemaStatus ? <StatusBadge tone="blue">In schema</StatusBadge> : null}
                </div>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  Edit the body for a status and media type. Saved bodies beat generated mock data.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={onUseResponseStatus}
                  loading={isSavingConfig && !isRuntimeStatus}
                  disabled={isRuntimeStatus}
                >
                  <RiFlashlightLine className="size-4" />
                  {isRuntimeStatus ? 'In use' : 'Use status'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={onSaveResponse}
                  loading={isSavingResponse}
                  disabled={Boolean(responseError)}
                >
                  <RiSave3Line className="size-4" />
                  Save body
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={onDeleteResponse}
                  loading={isDeletingResponse}
                  disabled={!savedResponse}
                >
                  <RiDeleteBinLine className="size-4" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-[180px_minmax(0,1fr)]">
              <FieldLabel title="Status" compact>
                <PlaygroundSelect
                  value={String(responseStatus)}
                  options={statusOptions.map((status) => ({
                    label: `${status} ${statusLabel(status)}`,
                    value: String(status),
                  }))}
                  ariaLabel="Saved response status"
                  className="h-10 w-full"
                  onChange={(value) => onStatusChange(Number(value))}
                />
              </FieldLabel>
              <FieldLabel title="Media type" compact>
                <PlaygroundSelect
                  value={responseContentType}
                  options={contentTypeOptions.map((contentType) => ({
                    label: contentType,
                    value: contentType,
                  }))}
                  ariaLabel="Saved response media type"
                  className="h-10 w-full font-mono"
                  onChange={onContentTypeChange}
                />
              </FieldLabel>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-sm text-white">{selectedStatusLabel}</p>
              <p className="font-mono text-xs text-white/45">{responseContentType}</p>
            </div>
            <JsonEditor value={responseText} onChange={onResponseTextChange} minHeight={380} />
            {responseError ? <p className="mt-3 text-sm text-red-200">{responseError}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#070b12] px-4 py-3">
      <p className="text-white/38 text-[0.68rem] uppercase tracking-[0.16em]">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function FieldLabel({
  title,
  detail,
  compact = false,
  children,
}: {
  title: string;
  detail?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-white/42 block text-xs font-medium uppercase tracking-[0.14em]">
        {title}
      </span>
      {detail ? <span className="text-white/42 mt-1 block text-xs leading-5">{detail}</span> : null}
      <span className={cn('block', compact ? 'mt-2' : 'mt-3')}>{children}</span>
    </label>
  );
}

function PresetButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 flex-1 rounded text-xs font-medium transition',
        active
          ? 'bg-cyan-300/15 text-cyan-100'
          : 'text-white/50 hover:bg-white/[0.04] hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: 'green' | 'blue' | 'muted';
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'rounded border px-2 py-0.5 text-xs',
        tone === 'green'
          ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
          : tone === 'blue'
            ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
            : 'border-white/10 bg-white/[0.04] text-white/45',
      )}
    >
      {children}
    </span>
  );
}

function statusLabel(status: number) {
  if (status >= 200 && status < 300) return 'Success';
  if (status >= 300 && status < 400) return 'Redirect';
  if (status >= 400 && status < 500) return 'Client error';
  if (status >= 500) return 'Server error';
  return 'Informational';
}
