import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from '@ghostapi/ui';

type PlaygroundSelectOption = {
  label: string;
  value: string;
};

export function PlaygroundSelect({
  value,
  options,
  className,
  triggerClassName,
  disabled = false,
  readOnlyWhenSingle = false,
  ariaLabel,
  onChange,
}: {
  value: string;
  options: PlaygroundSelectOption[];
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  readOnlyWhenSingle?: boolean;
  ariaLabel: string;
  onChange: (value: string) => void;
}) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

  if (readOnlyWhenSingle && options.length <= 1) {
    return (
      <span
        className={cn(
          'inline-flex h-9 items-center rounded-md border border-white/10 bg-[#0d121b] px-3 font-mono text-sm text-white/85',
          className,
        )}
      >
        {options[0]?.label ?? value}
      </span>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || options.length === 0}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          'h-9 border-white/10 bg-[#0d121b] text-sm text-white shadow-none hover:border-white/20 focus-visible:border-cyan-300/60 focus-visible:ring-cyan-300/15',
          'min-w-0 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:text-left',
          className,
          triggerClassName,
        )}
      >
        <SelectValue placeholder={selectedLabel} />
      </SelectTrigger>
      <SelectContent
        className="border-white/10 bg-[#0b111a] text-white shadow-2xl shadow-black/40"
        position="popper"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="focus:bg-cyan-300/10 focus:text-cyan-100"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
