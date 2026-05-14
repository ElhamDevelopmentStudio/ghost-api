import { RiAddLine, RiCloseLine, RiKey2Line } from '@remixicon/react';

import {
  Button,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@ghostapi/ui';

import type { HeaderDraft } from '../types';
import { makeId } from '../utils/ids';
import { normalizeSharedHeaders } from '../utils/shared-headers-storage';

export function SharedHeadersSheet({
  open,
  headers,
  onOpenChange,
  onChange,
}: {
  open: boolean;
  headers: HeaderDraft[];
  onOpenChange: (open: boolean) => void;
  onChange: (headers: HeaderDraft[]) => void;
}) {
  const normalizedHeaders = normalizeSharedHeaders(headers);
  const authorizationHeader = normalizedHeaders.find((header) => isAuthorizationHeader(header.key));
  const customHeaders = normalizedHeaders.filter((header) => !isAuthorizationHeader(header.key));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[560px] border-white/10 bg-[#070b12] text-white sm:max-w-[560px]"
      >
        <SheetHeader className="border-white/10">
          <SheetTitle className="flex items-center gap-2 text-white">
            <RiKey2Line className="size-5 text-violet-300" />
            Shared headers
          </SheetTitle>
          <SheetDescription className="text-white/55">
            These headers are sent with every request in this project. Endpoint headers can still
            override the same key for a single request.
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-5">
          <section className="rounded-lg border border-violet-400/20 bg-violet-500/[0.08] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Bearer token</p>
                <p className="mt-1 text-sm text-white/55">
                  Creates `Authorization: Bearer your_token` for every request.
                </p>
              </div>
              {!authorizationHeader ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    onChange(normalizeSharedHeaders([...normalizedHeaders, bearerHeader()]))
                  }
                >
                  Add token
                </Button>
              ) : null}
            </div>

            {authorizationHeader ? (
              <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-3">
                <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_92px_40px]">
                  <div className="flex h-10 items-center rounded-md border border-white/10 bg-black/35 px-3 font-mono text-xs text-white/60">
                    Authorization
                  </div>
                  <label className="flex h-10 min-w-0 items-center overflow-hidden rounded-md border border-white/10 bg-black/35">
                    <span className="border-r border-white/10 px-3 font-mono text-xs text-violet-200">
                      Bearer
                    </span>
                    <input
                      value={bearerToken(authorizationHeader.value)}
                      onChange={(event) =>
                        replaceHeader(
                          normalizedHeaders,
                          {
                            ...authorizationHeader,
                            key: 'Authorization',
                            value: `Bearer ${event.target.value}`,
                          },
                          onChange,
                        )
                      }
                      placeholder="your_token"
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/30"
                    />
                  </label>
                  <EnabledButton
                    enabled={authorizationHeader.enabled}
                    onClick={() =>
                      replaceHeader(
                        normalizedHeaders,
                        { ...authorizationHeader, enabled: !authorizationHeader.enabled },
                        onChange,
                      )
                    }
                  />
                  <RemoveButton
                    onClick={() =>
                      onChange(
                        normalizedHeaders.filter((header) => !isAuthorizationHeader(header.key)),
                      )
                    }
                  />
                </div>
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Custom headers</p>
                <p className="mt-1 text-sm text-white/45">Add reusable headers for this project.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onChange([...normalizedHeaders, emptyHeader()])}
              >
                <RiAddLine className="size-4" />
                Add header
              </Button>
            </div>

            {customHeaders.length ? (
              <div className="space-y-2">
                {customHeaders.map((header) => (
                  <div
                    key={header.id}
                    className="grid gap-2 rounded-md border border-white/10 bg-black/20 p-3 sm:grid-cols-[minmax(130px,0.7fr)_minmax(0,1fr)_92px_40px]"
                  >
                    <input
                      value={header.key}
                      onChange={(event) =>
                        replaceHeader(
                          normalizedHeaders,
                          { ...header, key: event.target.value },
                          onChange,
                        )
                      }
                      placeholder="Header"
                      className="h-10 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-white/30"
                    />
                    <input
                      value={header.value}
                      onChange={(event) =>
                        replaceHeader(
                          normalizedHeaders,
                          { ...header, value: event.target.value },
                          onChange,
                        )
                      }
                      placeholder="Value"
                      className="h-10 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-white/30"
                    />
                    <EnabledButton
                      enabled={header.enabled}
                      onClick={() =>
                        replaceHeader(
                          normalizedHeaders,
                          { ...header, enabled: !header.enabled },
                          onChange,
                        )
                      }
                    />
                    <RemoveButton
                      onClick={() =>
                        onChange(normalizedHeaders.filter((item) => item.id !== header.id))
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/45">
                No custom shared headers.
              </div>
            )}
          </section>
        </SheetBody>

        <SheetFooter className="border-white/10">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function EnabledButton({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        enabled
          ? 'h-10 rounded-md border border-emerald-300/25 bg-emerald-400/10 text-sm text-emerald-200'
          : 'h-10 rounded-md border border-white/10 text-sm text-white/45'
      }
    >
      {enabled ? 'Enabled' : 'Disabled'}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-10 place-items-center rounded-md border border-white/10 text-white/50 hover:text-white"
      aria-label="Remove shared header"
    >
      <RiCloseLine className="size-4" />
    </button>
  );
}

function replaceHeader(
  headers: HeaderDraft[],
  nextHeader: HeaderDraft,
  onChange: (headers: HeaderDraft[]) => void,
) {
  onChange(
    normalizeSharedHeaders(
      headers.map((header) => (header.id === nextHeader.id ? nextHeader : header)),
    ),
  );
}

function emptyHeader(): HeaderDraft {
  return { id: makeId(), key: '', value: '', enabled: true };
}

function bearerHeader(): HeaderDraft {
  return { id: makeId(), key: 'Authorization', value: 'Bearer ', enabled: true };
}

function isAuthorizationHeader(key: string) {
  return key.trim().toLowerCase() === 'authorization';
}

function bearerToken(value: string) {
  return value.trimStart().toLowerCase().startsWith('bearer ') ? value.trimStart().slice(7) : value;
}
