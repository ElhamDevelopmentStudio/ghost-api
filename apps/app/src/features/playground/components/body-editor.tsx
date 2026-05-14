import { beautifyJson, validateJsonText } from '../utils/json';
import { isJsonContentType } from '../utils/headers';
import { EditorHeader, EmptyEditorLine } from './editor-controls';
import { JsonEditor } from './json-editor';

export function BodyEditor({
  bodyText,
  contentType,
  disabled,
  onChange,
}: {
  bodyText: string;
  contentType: string;
  disabled: boolean;
  onChange: (bodyText: string) => void;
}) {
  const isJson = isJsonContentType(contentType);
  const error = isJson ? validateJsonText(bodyText) : null;

  return (
    <div className="space-y-3">
      <EditorHeader
        title={`Request body · ${contentType}`}
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
          <JsonEditor value={bodyText} onChange={onChange} />
          {error ? <p className="text-sm text-red-200">{error}</p> : null}
        </>
      )}
    </div>
  );
}
