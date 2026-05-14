import type { HeaderDraft } from '../types';
import { visibleRequestHeaders, visibleSharedHeaders } from '../utils/headers';
import { makeId } from '../utils/ids';
import { EditorHeader, RemoveButton, RowToggle } from './editor-controls';

export function HeadersEditor({
  headers,
  sharedHeaders,
  onChange,
}: {
  headers: HeaderDraft[];
  sharedHeaders: HeaderDraft[];
  onChange: (headers: HeaderDraft[]) => void;
}) {
  const inheritedHeaders = visibleSharedHeaders(sharedHeaders);
  const requestHeaders = visibleRequestHeaders(headers, sharedHeaders);

  return (
    <div className="space-y-5">
      {inheritedHeaders.length ? (
        <section className="space-y-3">
          <div>
            <p className="text-sm font-medium text-white">Shared headers</p>
            <p className="mt-1 text-sm text-white/45">
              These are inherited from the project and sent with every request.
            </p>
          </div>
          <div className="space-y-2">
            {inheritedHeaders.map((header) => (
              <div
                key={header.id}
                className="grid gap-2 rounded-md border border-violet-400/20 bg-violet-500/[0.07] p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_90px]"
              >
                <div className="min-w-0 rounded-md border border-white/10 bg-black/25 px-3 py-2 font-mono text-sm text-white/80">
                  {header.key}
                </div>
                <div className="text-white/72 min-w-0 rounded-md border border-white/10 bg-black/25 px-3 py-2 font-mono text-sm">
                  {maskHeaderValue(header)}
                </div>
                <div className="text-white/52 flex h-10 items-center justify-center rounded-md border border-white/10 text-xs">
                  {header.enabled ? 'Inherited' : 'Disabled'}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <EditorHeader
          title="Request headers"
          actionLabel="Add header"
          onAction={() =>
            onChange([...headers, { id: makeId(), key: '', value: '', enabled: true }])
          }
        />
        {requestHeaders.length ? (
          requestHeaders.map((header) => (
            <div
              key={header.id}
              className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px_40px]"
            >
              <input
                value={header.key}
                onChange={(event) =>
                  onChange(
                    headers.map((item) =>
                      item.id === header.id ? { ...item, key: event.target.value } : item,
                    ),
                  )
                }
                placeholder="Header"
                className="h-10 rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-white/35"
              />
              <input
                value={header.value}
                onChange={(event) =>
                  onChange(
                    headers.map((item) =>
                      item.id === header.id ? { ...item, value: event.target.value } : item,
                    ),
                  )
                }
                placeholder="Value"
                className="h-10 rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-white/35"
              />
              <RowToggle
                checked={header.enabled}
                onChange={(enabled) =>
                  onChange(
                    headers.map((item) => (item.id === header.id ? { ...item, enabled } : item)),
                  )
                }
              />
              <RemoveButton
                label="Remove header"
                onClick={() => onChange(headers.filter((item) => item.id !== header.id))}
              />
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/45">
            No endpoint-specific headers.
          </div>
        )}
      </section>
    </div>
  );
}

function maskHeaderValue(header: HeaderDraft) {
  if (header.key.trim().toLowerCase() !== 'authorization') return header.value || '(empty)';
  if (!header.value.trim()) return '(empty)';
  return 'Bearer ********';
}
