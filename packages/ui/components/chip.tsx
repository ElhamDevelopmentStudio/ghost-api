import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { RiCloseLine } from '@remixicon/react';

import { cn } from '../lib/utils';

const chipVariants = cva(
  [
    'inline-flex shrink-0 select-none items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
    'transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    "[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-3.5",
    'data-[interactive=true]:cursor-pointer',
  ].join(' '),
  {
    variants: {
      variant: {
        neutral:
          'border-border bg-surface-elevated text-foreground data-[interactive=true]:hover:bg-surface-hover',
        primary:
          'border-primary/30 bg-primary/10 text-primary data-[interactive=true]:hover:bg-primary/20',
        success:
          'border-success/30 bg-success/10 text-success data-[interactive=true]:hover:bg-success/20',
        warning:
          'border-warning/30 bg-warning/10 text-warning data-[interactive=true]:hover:bg-warning/20',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive data-[interactive=true]:hover:bg-destructive/20',
        info: 'border-info/30 bg-info/10 text-info data-[interactive=true]:hover:bg-info/20',
      },
      size: {
        sm: "h-5 px-2 text-[11px] gap-1 [&>svg:not([class*='size-'])]:size-3",
        md: 'h-6 px-2.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  },
);

type ChipVariant = NonNullable<VariantProps<typeof chipVariants>['variant']>;
type ChipSize = NonNullable<VariantProps<typeof chipVariants>['size']>;

type ChipProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  variant?: ChipVariant;
  size?: ChipSize;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  /** When provided, renders a trailing close button that fires this callback. */
  onDismiss?: () => void;
  /** Fires when the chip body is clicked; presence makes the chip interactive. */
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
};

function Chip({
  className,
  variant,
  size,
  icon,
  children,
  onDismiss,
  onClick,
  ...props
}: ChipProps): React.JSX.Element {
  const interactive = Boolean(onClick);
  return (
    <span
      data-slot="chip"
      data-variant={variant ?? 'neutral'}
      data-size={size ?? 'md'}
      data-interactive={interactive || undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.(event as unknown as React.MouseEvent<HTMLSpanElement>);
              }
            }
          : undefined
      }
      className={cn(chipVariants({ variant, size }), className)}
      {...props}
    >
      {icon}
      {children}
      {onDismiss ? (
        <button
          type="button"
          aria-label="Remove"
          onClick={(event) => {
            event.stopPropagation();
            onDismiss();
          }}
          className="text-current/60 -mr-1 inline-flex size-4 shrink-0 items-center justify-center rounded-full transition-colors hover:text-current focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
        >
          <RiCloseLine className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

export { Chip, chipVariants };
export type { ChipProps, ChipVariant, ChipSize };
