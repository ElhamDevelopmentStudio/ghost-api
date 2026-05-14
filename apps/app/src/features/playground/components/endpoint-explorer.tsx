import { Link } from 'react-router-dom';
import { RiArrowLeftLine, RiFileCopyLine, RiRefreshLine, RiSearchLine } from '@remixicon/react';

import type { ProjectDetail, ProjectEndpoint } from '@ghostapi/types';
import { Button, MethodBadge, cn, toast } from '@ghostapi/ui';

import { Logo } from '@/components/logo';
import { groupEndpoints } from '../utils/endpoint-list';

export function EndpointExplorer({
  project,
  endpoints,
  search,
  runtimeBase,
  selectedEndpointId,
  onSearchChange,
  onSelectEndpoint,
  onRefresh,
}: {
  project: ProjectDetail;
  endpoints: ProjectEndpoint[];
  search: string;
  runtimeBase: string;
  selectedEndpointId: string | null;
  onSearchChange: (value: string) => void;
  onSelectEndpoint: (endpoint: ProjectEndpoint) => void;
  onRefresh: () => void;
}) {
  const groupedEndpoints = groupEndpoints(endpoints);

  return (
    <aside className="flex h-screen min-h-0 w-full flex-col border-r border-white/10 bg-[#05080d]">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center justify-between">
          <Logo imageClassName="h-10" />
          <Button
            asChild
            type="button"
            size="icon-sm"
            variant="secondary"
            aria-label="Back to overview"
          >
            <Link to={`/projects/${project.id}`}>
              <RiArrowLeftLine className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 text-left text-sm text-white"
            onClick={onRefresh}
          >
            <span className="size-2 rounded-full bg-emerald-400" />
            <span className="min-w-0 flex-1 truncate">{project.name}</span>
          </button>
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            onClick={onRefresh}
            aria-label="Refresh endpoints"
          >
            <RiRefreshLine className="size-4" />
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-white/56 text-[11px] uppercase tracking-[0.16em]">Endpoints</p>
          <span className="text-white/58 rounded-full bg-white/[0.06] px-2 py-0.5 text-xs">
            {endpoints.length}
          </span>
        </div>

        <label className="mt-3 flex h-9 items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-3 text-white/50">
          <RiSearchLine className="size-4" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search endpoints..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {groupedEndpoints.length ? (
          groupedEndpoints.map((group) => (
            <div key={group.name} className="mb-4">
              <div className="text-white/42 mb-2 flex items-center justify-between px-2 text-[11px] uppercase tracking-[0.14em]">
                <span className="truncate">{group.name}</span>
                <span>{group.endpoints.length}</span>
              </div>
              <div className="space-y-1">
                {group.endpoints.map((endpoint) => (
                  <EndpointButton
                    key={endpoint.id}
                    endpoint={endpoint}
                    isActive={endpoint.id === selectedEndpointId}
                    onClick={() => onSelectEndpoint(endpoint)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-white/52 rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm">
            No endpoints match the current search.
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <p className="font-mono text-xs text-violet-300">&gt;_</p>
          <p className="mt-2 text-sm font-medium text-white">Mock server</p>
          <button
            type="button"
            onClick={() => void copyRuntimeBase(runtimeBase)}
            className="mt-2 flex max-w-full items-center gap-2 rounded bg-black/30 px-2 py-1 font-mono text-[11px] text-white/70"
          >
            <span className="truncate">{runtimeBase}</span>
            <RiFileCopyLine className="size-3 shrink-0" />
          </button>
          <p className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Runtime connected
          </p>
        </div>
      </div>
    </aside>
  );
}

function EndpointButton({
  endpoint,
  isActive,
  onClick,
}: {
  endpoint: ProjectEndpoint;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-md border px-2.5 py-2 text-left transition-colors',
        isActive
          ? 'border-violet-400/30 bg-violet-500/20 text-white'
          : 'text-white/68 border-transparent hover:border-white/10 hover:bg-white/[0.035] hover:text-white',
      )}
    >
      <MethodBadge method={endpoint.method} size="sm" />
      <span className="min-w-0 flex-1 truncate font-mono text-xs">{endpoint.path}</span>
    </button>
  );
}

async function copyRuntimeBase(runtimeBase: string) {
  try {
    await navigator.clipboard.writeText(runtimeBase);
    toast.success('Runtime URL copied');
  } catch {
    toast.error('Clipboard is not available');
  }
}
