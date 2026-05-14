import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  RiCloseLine,
  RiFileList3Line,
  RiFilter3Line,
  RiRefreshLine,
  RiSearchLine,
} from '@remixicon/react';

import type { ProjectActivityLog, ProjectDetail } from '@ghostapi/types';
import {
  Button,
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Skeleton,
  cn,
} from '@ghostapi/ui';

import { listProjectActivityLogs } from '@/features/projects/api/projects-api';
import { PlaygroundSelect } from '@/features/playground/components/playground-select';

const METHOD_OPTIONS = [
  { label: 'All methods', value: 'all' },
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'HEAD', value: 'HEAD' },
  { label: 'OPTIONS', value: 'OPTIONS' },
];

const STATUS_OPTIONS = [
  { label: 'All status', value: 'all' },
  { label: '2xx', value: '2xx' },
  { label: '3xx', value: '3xx' },
  { label: '4xx', value: '4xx' },
  { label: '5xx', value: '5xx' },
];

const RANGE_OPTIONS = [
  { label: 'Last hour', value: '1h' },
  { label: '24 hours', value: '24h' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
];

export function ProjectActivity({ project }: { project: ProjectDetail }) {
  const [params, setParams] = useSearchParams();
  const [selectedLog, setSelectedLog] = useState<ProjectActivityLog | null>(null);
  const filters = useMemo(
    () => ({
      method: normalizedParam(params.get('method')),
      statusClass: normalizedParam(params.get('status')) as
        | '2xx'
        | '3xx'
        | '4xx'
        | '5xx'
        | undefined,
      search: params.get('search') ?? undefined,
      range: (params.get('range') as '1h' | '24h' | '7d' | '30d' | null) ?? '24h',
      limit: 50,
    }),
    [params],
  );
  const query = useInfiniteQuery({
    queryKey: ['projects', project.id, 'activity', filters],
    queryFn: ({ pageParam }) =>
      listProjectActivityLogs(project.id, { ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  const logs = query.data?.pages.flatMap((page) => page.logs) ?? [];

  function setFilter(key: string, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (!value || value === 'all') next.delete(key);
      else next.set(key, value);
      return next;
    });
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">
            <RiFileList3Line className="size-4" />
            Activity
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Request logs</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/55">
            Inspect mock runtime traffic, payloads, headers, response types, and failures.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
          <RiRefreshLine className="size-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 rounded-lg border border-white/10 bg-[#070b12] p-3 lg:grid-cols-[minmax(220px,1fr)_160px_150px_150px]">
        <label className="relative">
          <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <input
            value={filters.search ?? ''}
            onChange={(event) => setFilter('search', event.target.value)}
            placeholder="Search path"
            className="h-10 w-full rounded-md border border-white/10 bg-[#0d121b] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60"
          />
        </label>
        <PlaygroundSelect
          value={filters.method ?? 'all'}
          options={METHOD_OPTIONS}
          ariaLabel="Filter method"
          className="h-10 w-full"
          onChange={(value) => setFilter('method', value)}
        />
        <PlaygroundSelect
          value={filters.statusClass ?? 'all'}
          options={STATUS_OPTIONS}
          ariaLabel="Filter status"
          className="h-10 w-full"
          onChange={(value) => setFilter('status', value)}
        />
        <PlaygroundSelect
          value={filters.range}
          options={RANGE_OPTIONS}
          ariaLabel="Filter time range"
          className="h-10 w-full"
          onChange={(value) => setFilter('range', value)}
        />
      </div>

      {query.isLoading ? <ActivitySkeleton /> : null}
      {query.isError ? <ActivityError onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.isError && logs.length === 0 ? <ActivityEmpty /> : null}
      {!query.isLoading && !query.isError && logs.length ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-[#070b12]">
            {logs.map((log) => (
              <button
                key={log.id}
                type="button"
                onClick={() => setSelectedLog(log)}
                className="grid w-full gap-3 border-b border-white/10 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/[0.035] md:grid-cols-[92px_minmax(0,1fr)_92px_96px_160px]"
              >
                <span className="font-mono text-sm font-semibold text-cyan-100">{log.method}</span>
                <span className="min-w-0 truncate font-mono text-sm text-white">{log.path}</span>
                <StatusPill status={log.status} />
                <span className="text-white/62 text-sm">{log.durationMs}ms</span>
                <span className="text-white/42 text-sm">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
          {query.hasNextPage ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void query.fetchNextPage()}
                loading={query.isFetchingNextPage}
              >
                Load more
              </Button>
            </div>
          ) : (
            <p className="text-center text-xs text-white/35">End of matching requests</p>
          )}
        </div>
      ) : null}

      <LogDetail log={selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)} />
    </section>
  );
}

function StatusPill({ status }: { status: number }) {
  return (
    <span
      className={cn(
        'w-fit rounded-md px-2 py-1 text-xs font-semibold',
        status < 300
          ? 'bg-emerald-400/10 text-emerald-200'
          : status < 400
            ? 'bg-cyan-400/10 text-cyan-200'
            : status < 500
              ? 'bg-amber-400/10 text-amber-200'
              : 'bg-red-400/10 text-red-200',
      )}
    >
      {status}
    </span>
  );
}

function LogDetail({
  log,
  onOpenChange,
}: {
  log: ProjectActivityLog | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={Boolean(log)} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-white/10 bg-[#050910] text-white sm:max-w-2xl"
      >
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="font-mono text-white">
                {log ? `${log.method} ${log.path}` : 'Request'}
              </SheetTitle>
              {log ? (
                <p className="mt-2 text-sm text-white/50">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="tertiary"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <RiCloseLine className="size-4" />
            </Button>
          </div>
        </SheetHeader>
        {log ? (
          <SheetBody className="space-y-4 overflow-y-auto">
            <DetailGrid log={log} />
            <JsonBlock title="Request headers" value={log.requestHeaders} />
            <JsonBlock title="Request body" value={log.requestBody} />
            <JsonBlock title="Response headers" value={log.responseHeaders} />
            <JsonBlock title="Response body" value={log.responseBody} />
          </SheetBody>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function DetailGrid({ log }: { log: ProjectActivityLog }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <DetailItem label="Status" value={String(log.status)} />
      <DetailItem label="Latency" value={`${log.durationMs}ms`} />
      <DetailItem label="Response type" value={log.responseContentType ?? '(none)'} />
      <DetailItem label="Endpoint id" value={log.endpointId ?? '(deleted)'} />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</div>
      <div className="mt-1 min-w-0 break-words font-mono text-sm text-white">{value}</div>
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20">
      <div className="border-b border-white/10 px-3 py-2 text-sm font-medium text-white">
        {title}
      </div>
      <pre className="text-white/78 max-h-72 overflow-auto p-3 text-xs leading-6">
        {JSON.stringify(value ?? null, null, 2)}
      </pre>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton key={index} className="h-14 rounded-lg bg-white/[0.06]" />
      ))}
    </div>
  );
}

function ActivityEmpty() {
  return (
    <div className="rounded-lg border border-dashed border-white/10 px-6 py-16 text-center">
      <RiFilter3Line className="text-white/28 mx-auto size-8" />
      <p className="mt-3 text-sm font-medium text-white">No matching requests.</p>
      <p className="mt-1 text-sm text-white/45">Send a Playground request or loosen the filters.</p>
    </div>
  );
}

function ActivityError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-6 py-10 text-center">
      <p className="text-sm font-medium text-red-100">Activity could not be loaded.</p>
      <Button type="button" variant="secondary" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function normalizedParam(value: string | null) {
  return value && value !== 'all' ? value : undefined;
}
