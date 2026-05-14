import Editor from '@monaco-editor/react';

type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
  readOnly?: boolean;
};

export function JsonEditor({
  value,
  onChange,
  minHeight = 330,
  readOnly = false,
}: JsonEditorProps) {
  return (
    <div
      className="overflow-hidden rounded-md border border-white/10 bg-black/35"
      style={{ minHeight }}
    >
      <Editor
        height={minHeight}
        defaultLanguage="json"
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? '')}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          lineHeight: 22,
          folding: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 2,
          padding: { top: 14, bottom: 14 },
        }}
      />
    </div>
  );
}
