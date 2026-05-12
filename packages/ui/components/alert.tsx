import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  RiAlertLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiCloseLine,
  RiInformationLine,
} from '@remixicon/react';

import { cn } from '../lib/utils';

const alertVariants = cva(
  [
    'relative w-full rounded-md border px-4 py-3 text-sm',
    'grid grid-cols-[auto_1fr_auto] items-start gap-x-3',
    '[&>svg]:size-4 [&>svg]:translate-y-0.5',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-elevated text-foreground [&>svg]:text-muted-foreground',
        success:
          'border-success/30 bg-success/10 text-success-foreground [&>svg]:text-success [*[data-slot=alert-title]]:text-success',
        warning:
          'border-warning/30 bg-warning/10 text-warning-foreground [&>svg]:text-warning [*[data-slot=alert-title]]:text-warning',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive-foreground [&>svg]:text-destructive [*[data-slot=alert-title]]:text-destructive',
        info: 'border-info/30 bg-info/10 text-info-foreground [&>svg]:text-info [*[data-slot=alert-title]]:text-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const DEFAULT_ICON: Record<
  NonNullable<VariantProps<typeof alertVariants>['variant']>,
  React.ComponentType<{ className?: string }> | null
> = {
  default: RiInformationLine,
  success: RiCheckboxCircleLine,
  warning: RiAlertLine,
  destructive: RiCloseCircleLine,
  info: RiInformationLine,
};

type AlertProps = React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants> & {
    /** Override the auto-picked status icon. Pass `null` to render no icon. */
    icon?: React.ReactNode | null;
    /** Render a close button that fires this callback. */
    onDismiss?: () => void;
  };

function Alert({
  className,
  variant = 'default',
  icon,
  onDismiss,
  children,
  ...props
}: AlertProps): React.JSX.Element {
  const variantKey = variant ?? 'default';
  const DefaultIcon = icon === null ? null : DEFAULT_ICON[variantKey];
  const renderedIcon = icon === undefined ? DefaultIcon ? <DefaultIcon /> : null : icon;

  return (
    <div
      data-slot="alert"
      data-variant={variantKey}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {renderedIcon ?? <span aria-hidden className="hidden" />}
      <div className="grid gap-1">{children}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring -mr-1 -mt-0.5 rounded-sm p-1 transition-colors focus-visible:outline-none focus-visible:ring-2"
        >
          <RiCloseLine className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      data-slot="alert-title"
      className={cn('text-sm font-medium leading-none', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-muted-foreground text-sm leading-relaxed', className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
export type { AlertProps };
