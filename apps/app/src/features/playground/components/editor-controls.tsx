import { RiAddLine, RiCloseLine } from '@remixicon/react';

import { Button, cn } from '@ghostapi/ui';

export function EditorHeader({
  title,
  actionLabel,
  onAction,
  disabled,
  loading,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-medium text-white">{title}</p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={onAction}
        disabled={disabled}
        loading={loading}
      >
        <RiAddLine className="size-4" />
        {actionLabel}
      </Button>
    </div>
  );
}

export function RowToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'h-10 rounded-md border text-xs font-medium transition-colors disabled:opacity-50',
        checked
          ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-200'
          : 'text-white/42 border-white/10',
      )}
    >
      {checked ? 'On' : 'Off'}
    </button>
  );
}

export function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      className="grid h-10 place-items-center rounded-md border border-white/10 text-white/50 hover:text-white"
      onClick={onClick}
      aria-label={label}
    >
      <RiCloseLine className="size-4" />
    </button>
  );
}

export function EmptyEditorLine({ text }: { text: string }) {
  return (
    <div className="text-white/48 rounded-md border border-dashed border-white/10 px-4 py-8 text-center text-sm">
      {text}
    </div>
  );
}
