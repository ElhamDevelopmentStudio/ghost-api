import { cn } from './cn.js';

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-emerald-400',
  POST: 'text-sky-400',
  PUT: 'text-amber-400',
  PATCH: 'text-fuchsia-400',
  DELETE: 'text-rose-400',
  HEAD: 'text-neutral-400',
  OPTIONS: 'text-neutral-400',
};

export function MethodPill({
  method,
  className,
}: {
  method: string;
  className?: string;
}): React.JSX.Element {
  const color = METHOD_COLORS[method.toUpperCase()] ?? 'text-neutral-300';
  return (
    <span className={cn('font-mono text-xs uppercase tracking-wide', color, className)}>
      {method.padEnd(6, ' ')}
    </span>
  );
}
