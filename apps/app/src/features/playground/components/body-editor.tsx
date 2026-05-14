import { beautifyJson, validateJsonText } from '../utils/json';
import { isJsonContentType } from '../utils/headers';
import { EditorHeader, EmptyEditorLine } from './editor-controls';
import { JsonEditor } from './json-editor';
import { PlaygroundSelect } from './playground-select';

export function BodyEditor({
  bodyText,
  contentType,
  effectiveContentType,
  contentTypeOptions,
  disabled,
  onContentTypeChange,
  onChange,
}: {
  bodyText: string;
  contentType: string;
  effectiveContentType: string;
  contentTypeOptions: string[];
  disabled: boolean;
  onContentTypeChange: (contentType: string) => void;
  onChange: (bodyText: string) => void;
}) {
  const isJson = isJsonContentType(contentType);
  const error = isJson ? validateJsonText(bodyText) : null;
  const isOverridden =
    effectiveContentType.trim().toLowerCase() !== contentType.trim().toLowerCase();

  return (
    <div className="space-y-3">
      <EditorHeader
        title="Request body"
        actionLabel="Beautify"
        onAction={() => {
          const nextBody = beautifyJson(bodyText);
          if (nextBody !== null) onChange(nextBody);
        }}
        disabled={disabled || !isJson || !bodyText.trim()}
      />
      {disabled ? (
        <EmptyEditorLine text="This endpoint does not accept a request body." />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
              Media type
            </label>
            <PlaygroundSelect
              value={contentType}
              options={contentTypeOptions.map((option) => ({ label: option, value: option }))}
              ariaLabel="Request body media type"
              readOnlyWhenSingle
              className="min-w-[11.25rem] font-mono"
              onChange={onContentTypeChange}
            />
            {isOverridden ? (
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-xs text-amber-100">
                Sent as {effectiveContentType}
              </span>
            ) : null}
          </div>
          <JsonEditor value={bodyText} onChange={onChange} />
          {error ? <p className="text-sm text-red-200">{error}</p> : null}
        </>
      )}
    </div>
  );
}
