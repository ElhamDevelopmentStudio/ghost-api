import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '../lib/utils';

const trackVariants = cva('relative w-full overflow-hidden rounded-full bg-surface-elevated', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const indicatorColor: Record<NonNullable<ProgressProps['variant']>, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-info',
};

type ProgressProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> &
  VariantProps<typeof trackVariants> & {
    /** Current progress, 0–100. Ignored when `indeterminate` is true. */
    value?: number;
    /** Custom max value; defaults to 100. */
    max?: number;
    variant?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
    /** When true, animate an indeterminate sweep instead of using `value`. */
    indeterminate?: boolean;
  };

function Progress({
  className,
  value,
  size,
  variant = 'primary',
  indeterminate = false,
  ...props
}: ProgressProps): React.JSX.Element {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-variant={variant}
      data-indeterminate={indeterminate || undefined}
      className={cn(trackVariants({ size }), className)}
      value={indeterminate ? null : value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'h-full transition-transform duration-500 ease-out',
          indicatorColor[variant],
          indeterminate && 'animate-progress-indeterminate w-1/3',
        )}
        style={
          indeterminate
            ? undefined
            : { transform: `translateX(-${100 - (value ?? 0)}%)`, width: '100%' }
        }
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
export type { ProgressProps };
