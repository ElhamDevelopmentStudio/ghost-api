import { cn } from '@ghostapi/ui';

export function TabBar<T extends string>({
  items,
  active,
  onChange,
  counts,
}: {
  items: readonly T[];
  active: T;
  onChange: (item: T) => void;
  counts?: Partial<Record<T, number>>;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cn(
            'h-9 shrink-0 rounded-md px-3 text-sm transition-colors',
            active === item
              ? 'bg-white/[0.08] text-white'
              : 'text-white/52 hover:bg-white/[0.04] hover:text-white',
          )}
        >
          {item}
          {counts?.[item] ? <span className="text-white/42 ml-1">{counts[item]}</span> : null}
        </button>
      ))}
    </div>
  );
}
