import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const sizes = {
  sm: { box: 32, stroke: 3 },
  md: { box: 48, stroke: 4 },
  lg: { box: 64, stroke: 5 },
} as const;

const wrapperVariants = cva('relative inline-flex shrink-0 items-center justify-center', {
  variants: {
    size: {
      sm: 'size-8 text-[10px]',
      md: 'size-12 text-xs',
      lg: 'size-16 text-sm',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const indicatorColor: Record<NonNullable<CircularProgressProps['variant']>, string> = {
  primary: 'stroke-primary',
  success: 'stroke-success',
  warning: 'stroke-warning',
  destructive: 'stroke-destructive',
  info: 'stroke-info',
};

type CircularProgressProps = Omit<React.ComponentProps<'div'>, 'children'> &
  VariantProps<typeof wrapperVariants> & {
    /** 0 to 100. Ignored when `indeterminate` is true. */
    value?: number;
    variant?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
    /** Show a continuous spin instead of `value`. */
    indeterminate?: boolean;
    /** Render the percentage in the center. */
    showLabel?: boolean;
    /** Custom label override; takes precedence over `showLabel`. */
    label?: React.ReactNode;
  };

function CircularProgress({
  className,
  size = 'md',
  value = 0,
  variant = 'primary',
  indeterminate = false,
  showLabel = false,
  label,
  ...props
}: CircularProgressProps): React.JSX.Element {
  const sizeKey = size ?? 'md';
  const { box, stroke } = sizes[sizeKey];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(100, value));
  const dashOffset = circumference - (clampedValue / 100) * circumference;
  const center = box / 2;

  return (
    <div
      data-slot="circular-progress"
      data-variant={variant}
      data-indeterminate={indeterminate || undefined}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(wrapperVariants({ size }), className)}
      {...props}
    >
      <svg
        viewBox={`0 0 ${box} ${box}`}
        className={cn('size-full -rotate-90', indeterminate && 'animate-spin')}
        aria-hidden
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          className="stroke-surface-elevated"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.75 : dashOffset}
          className={cn(
            'transition-[stroke-dashoffset] duration-500 ease-out',
            indicatorColor[variant],
          )}
        />
      </svg>
      {(label !== undefined || showLabel) && !indeterminate ? (
        <span className="text-foreground absolute font-mono font-medium tabular-nums">
          {label ?? `${Math.round(clampedValue)}%`}
        </span>
      ) : null}
    </div>
  );
}

export { CircularProgress };
export type { CircularProgressProps };
