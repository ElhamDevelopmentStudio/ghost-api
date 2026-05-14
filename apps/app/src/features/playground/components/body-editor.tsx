import { beautifyJson, validateJsonText } from '../utils/json';
import { EditorHeader, EmptyEditorLine } from './editor-controls';
import { JsonEditor } from './json-editor';

export function BodyEditor({
  bodyText,
  disabled,
  onChange,
}: {
  bodyText: string;
  disabled: boolean;
  onChange: (bodyText: string) => void;
}) {
  const error = validateJsonText(bodyText);

  return (
    <div className="space-y-3">
      <EditorHeader
        title="Request body"
        actionLabel="Beautify"
        onAction={() => {
          const nextBody = beautifyJson(bodyText);
          if (nextBody !== null) onChange(nextBody);
        }}
        disabled={disabled || !bodyText.trim()}
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
