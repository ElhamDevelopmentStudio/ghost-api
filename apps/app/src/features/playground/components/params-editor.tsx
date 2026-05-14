import type { ParamDraft } from '../types';
import { makeId } from '../utils/ids';
import { EditorHeader, EmptyEditorLine, RowToggle } from './editor-controls';
import { PlaygroundSelect } from './playground-select';

export function ParamsEditor({
  params,
  onChange,
}: {
  params: ParamDraft[];
  onChange: (params: ParamDraft[]) => void;
}) {
  return (
    <div className="space-y-3">
      <EditorHeader
        title="Request params"
        actionLabel="Add query param"
        onAction={() =>
          onChange([
            ...params,
            {
              id: makeId(),
              name: '',
              value: '',
              enabled: true,
              location: 'query',
              required: false,
            },
          ])
        }
      />
      {params.length ? (
        params.map((param) => (
          <div
            key={param.id}
            className="grid gap-2 md:grid-cols-[78px_minmax(0,1fr)_minmax(0,1fr)_40px]"
          >
            <PlaygroundSelect
              value={param.location}
              disabled={param.required}
              options={[
                { label: 'Path', value: 'path' },
                { label: 'Query', value: 'query' },
              ]}
              ariaLabel="Parameter location"
              className="h-10 w-full px-2 text-xs"
              onChange={(location) =>
                onChange(
                  params.map((item) =>
                    item.id === param.id
                      ? { ...item, location: location as ParamDraft['location'] }
                      : item,
                  ),
                )
              }
            />
            <input
              value={param.name}
              disabled={param.required}
              onChange={(event) =>
                onChange(
                  params.map((item) =>
                    item.id === param.id ? { ...item, name: event.target.value } : item,
                  ),
                )
              }
              placeholder="name"
              className="h-10 rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-white/35 disabled:opacity-50"
            />
            <input
              value={param.value}
              onChange={(event) =>
                onChange(
                  params.map((item) =>
                    item.id === param.id ? { ...item, value: event.target.value } : item,
                  ),
                )
              }
              placeholder="value"
              className="h-10 rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-white/35"
            />
            <RowToggle
              checked={param.enabled}
              disabled={param.required}
              onChange={(enabled) =>
                onChange(params.map((item) => (item.id === param.id ? { ...item, enabled } : item)))
              }
            />
          </div>
        ))
      ) : (
        <EmptyEditorLine text="This endpoint does not define path or query params." />
      )}
    </div>
  );
}
