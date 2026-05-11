import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { RiLoader4Line } from '@remixicon/react';
import { Slot } from 'radix-ui';

import { cn } from '@ghostapi/ui/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap',
    'transition-colors outline-hidden',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
        secondary:
          'border border-border bg-surface-elevated text-foreground hover:bg-surface-hover active:bg-surface-elevated',
        tertiary:
          'bg-transparent text-foreground hover:bg-surface-hover active:bg-surface-elevated',
        destructive: 'bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80',
      },
      size: {
        sm: "h-8 gap-1.5 px-3 text-xs has-[>svg:only-child]:px-2 [&_svg:not([class*='size-'])]:size-3.5",
        md: 'h-9 px-4 text-sm has-[>svg:only-child]:px-2.5',
        lg: 'h-11 px-6 text-sm has-[>svg:only-child]:px-3',
        'icon-sm': 'size-8',
        icon: 'size-9',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : 'button';
  const isDisabled = disabled || loading;

  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? 'primary'}
      data-size={size ?? 'md'}
      data-loading={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <RiLoader4Line className="animate-spin" aria-hidden /> : null}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
