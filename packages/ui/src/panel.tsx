import type { HTMLAttributes } from 'react';
import { cn } from './cn.js';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Renders the panel with a slimmer dense layout (used in the workspace sidebar). */
  dense?: boolean;
}

export function Panel({ className, dense, ...rest }: PanelProps): React.JSX.Element {
  return (
    <div
      {...rest}
      className={cn('border border-neutral-800 bg-neutral-950', dense ? 'p-2' : 'p-4', className)}
    />
  );
}
