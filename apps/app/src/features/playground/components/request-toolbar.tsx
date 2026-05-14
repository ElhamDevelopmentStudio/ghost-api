import { RiArrowRightUpLine, RiFileCopyLine, RiKey2Line, RiPlayLine } from '@remixicon/react';

import type { ProjectDetail } from '@ghostapi/types';
import { Button } from '@ghostapi/ui';

import { HTTP_METHODS } from '../constants';
import type { RequestDraft } from '../types';
import { env } from '@/lib/env';

export function RequestToolbar({
  project,
  endpointPath,
  request,
  isSending,
  requestError,
  runtimeBase,
  sharedHeaderCount,
  onRequestChange,
  onOpenSharedHeaders,
  onSend,
  onSave,
}: {
  project: ProjectDetail;
  endpointPath: string | null;
  request: RequestDraft;
  isSending: boolean;
  requestError: string | null;
  runtimeBase: string;
  sharedHeaderCount: number;
  onRequestChange: (request: RequestDraft) => void;
  onOpenSharedHeaders: () => void;
  onSend: () => void;
  onSave: () => void;
}) {
  return (
    <header>
      <div className="flex min-h-16 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-white">Playground</h1>
          <p className="text-white/58 mt-2 truncate text-sm">
            {endpointPath ? `Testing ${endpointPath}` : runtimeBase}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            asChild
            variant="secondary"
            className="border-white/10 bg-white/[0.035] text-white"
          >
            <a href={`${env.VITE_API_URL}/docs`} target="_blank" rel="noreferrer">
              Docs
              <RiArrowRightUpLine className="size-4" />
            </a>
          </Button>
          <Button type="button" variant="secondary" onClick={onSave}>
            <RiFileCopyLine className="size-4" />
            Save Request
          </Button>
          <Button type="button" variant="secondary" onClick={onOpenSharedHeaders}>
            <RiKey2Line className="size-4" />
            Shared Headers
            {sharedHeaderCount ? (
              <span className="rounded-full bg-violet-500/25 px-1.5 text-xs text-violet-100">
                {sharedHeaderCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <div className="mt-5 grid overflow-hidden rounded-md border border-white/10 bg-[#080d14] md:grid-cols-[96px_minmax(0,1fr)_184px]">
        <select
          value={request.method}
          onChange={(event) =>
            onRequestChange({ ...request, method: event.target.value as RequestDraft['method'] })
          }
          className="bg-violet-500/12 h-14 border-0 border-r border-white/10 px-4 text-sm font-semibold text-violet-200 outline-none"
        >
          {HTTP_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
        <input
          value={request.url}
          onChange={(event) => onRequestChange({ ...request, url: event.target.value })}
          className="placeholder:text-white/32 h-14 min-w-0 border-0 bg-transparent px-4 font-mono text-sm text-white outline-none"
          aria-label="Request URL"
        />
        <Button
          type="button"
          className="m-2 h-10 bg-violet-600 hover:bg-violet-500"
          onClick={onSend}
          loading={isSending}
          disabled={!project.id || !request.url}
        >
          <RiPlayLine className="size-4" />
          Send
        </Button>
      </div>
      {requestError ? (
        <div className="mt-3 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {requestError}
        </div>
      ) : null}
    </header>
  );
}
