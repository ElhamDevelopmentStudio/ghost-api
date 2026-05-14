import { RiFileCopyLine, RiPlayLine } from '@remixicon/react';

import type { ProjectDetail } from '@ghostapi/types';
import { Button, cn, toast } from '@ghostapi/ui';

import { RESPONSE_TABS } from '../constants';
import type { PlaygroundResponse, ResponseFormat, ResponseTab } from '../types';
import { countMatches, formatBytes } from '../utils/format';
import { formatResponseBody } from '../utils/json';
import { JsonEditor } from './json-editor';
import { TabBar } from './tab-bar';

export function ResponsePanel({
  project,
  response,
  activeTab,
  format,
  search,
  onTabChange,
  onFormatChange,
  onSearchChange,
}: {
  project: ProjectDetail;
  response: PlaygroundResponse | null;
  activeTab: ResponseTab;
  format: ResponseFormat;
  search: string;
  onTabChange: (tab: ResponseTab) => void;
  onFormatChange: (format: ResponseFormat) => void;
  onSearchChange: (value: string) => void;
}) {
  const responseText = response
    ? formatResponseBody(response.parsedBody, response.bodyText, format)
    : '';
  const responseMatches =
    response && search.trim() ? countMatches(responseText, search.trim()) : null;

  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-[#070b12]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'rounded-md px-2.5 py-1 text-sm font-semibold',
              response
                ? response.ok
                  ? 'bg-emerald-400/10 text-emerald-200'
                  : 'bg-red-400/10 text-red-200'
                : 'text-white/48 bg-white/[0.06]',
            )}
          >
            {response ? response.status : 'Idle'}
          </span>
          {response ? (
            <span className="text-white/52 text-sm">
              {response.durationMs}ms · {formatBytes(response.sizeBytes)}
            </span>
          ) : null}
        </div>
        <select className="h-9 rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none">
          <option>{project.environments[0]?.name ?? 'Development'}</option>
        </select>
      </div>

      <TabBar
        items={RESPONSE_TABS}
        active={activeTab}
        onChange={onTabChange}
        counts={{ Headers: response?.headers.length ?? 0 }}
      />
      <div className="p-4 md:p-5">
        {!response ? <EmptyResponse /> : null}
        {response && activeTab === 'Response' ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={format}
                onChange={(event) => onFormatChange(event.target.value as ResponseFormat)}
                className="h-9 rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none"
              >
                <option value="pretty">Pretty</option>
                <option value="raw">Raw</option>
              </select>
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search response"
                className="h-9 min-w-[190px] rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-white/35"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => void copyText(responseText)}
              >
                <RiFileCopyLine className="size-4" />
                Copy
              </Button>
              {responseMatches !== null ? (
                <span className="text-white/48 text-xs">{responseMatches} matches</span>
              ) : null}
            </div>
            <JsonEditor
              value={responseText || '(empty body)'}
              onChange={() => undefined}
              readOnly
            />
          </div>
        ) : null}
        {response && activeTab === 'Headers' ? <HeadersViewer headers={response.headers} /> : null}
        {response && activeTab === 'Timeline' ? <TimelineViewer response={response} /> : null}
      </div>
    </section>
  );
}

function EmptyResponse() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-md border border-dashed border-white/10 text-center">
      <RiPlayLine className="text-white/28 size-8" />
      <p className="mt-3 text-sm font-medium text-white">Send a request to inspect the response.</p>
      <p className="text-white/48 mt-1 max-w-sm text-sm">
        The result here is the live mock runtime response, including latency, headers, and body.
      </p>
    </div>
  );
}

function HeadersViewer({ headers }: { headers: Array<{ key: string; value: string }> }) {
  return (
    <div className="overflow-hidden rounded-md border border-white/10">
      {headers.map((header) => (
        <div
          key={header.key}
          className="grid gap-2 border-b border-white/10 px-3 py-2 text-sm last:border-b-0 md:grid-cols-[170px_minmax(0,1fr)]"
        >
          <span className="text-white/56 font-mono">{header.key}</span>
          <span className="text-white/82 min-w-0 break-words font-mono">{header.value}</span>
        </div>
      ))}
    </div>
  );
}

function TimelineViewer({ response }: { response: PlaygroundResponse }) {
  return (
    <div className="space-y-3 text-sm">
      <TimelineRow label="Request" value={`${response.method} ${response.url}`} />
      <TimelineRow label="Status" value={`${response.status} ${response.ok ? 'OK' : 'Error'}`} />
      <TimelineRow label="Duration" value={`${response.durationMs}ms`} />
      <TimelineRow label="Received" value={new Date(response.receivedAt).toLocaleString()} />
      <TimelineRow label="Size" value={formatBytes(response.sizeBytes)} />
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 md:grid-cols-[110px_minmax(0,1fr)]">
      <span className="text-white/42">{label}</span>
      <span className="text-white/86 min-w-0 break-words font-mono">{value}</span>
    </div>
  );
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success('Response copied');
  } catch {
    toast.error('Clipboard is not available');
  }
}
