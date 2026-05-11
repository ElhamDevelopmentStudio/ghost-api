import * as React from 'react';

import { cn } from '@ghostapi/ui/lib/utils';

type InputProps = React.ComponentProps<'input'>;

function Input({ className, type, ...props }: InputProps): React.JSX.Element {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        'border-input bg-input text-foreground placeholder:text-muted h-11 w-full rounded-md border px-3 text-sm outline-none transition',
        'hover:bg-input/90 focus:border-ring focus:ring-ring/25 focus:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
