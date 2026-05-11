import * as React from 'react';
import {
  RiAlertLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiInformationLine,
  RiLoader4Line,
} from '@remixicon/react';
import { Toaster as Sonner, toast, type ToasterProps } from 'sonner';

/**
 * Sonner-backed toaster wired to the GhostAPI design system.
 *
 * Mount `<Toaster />` once near the root (e.g. in the app layout). Trigger
 * toasts from anywhere by importing the re-exported `toast` helper.
 *
 * The CSS custom properties below map Sonner's internal slots onto our
 * semantic tokens. Per-variant colors are wired by Sonner via the icon set
 * and the `richColors` prop — we keep the surface neutral and let the icon
 * carry the meaning, matching the design spec.
 */
function Toaster({ ...props }: ToasterProps): React.JSX.Element {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <RiCheckboxCircleLine className="size-4" />,
        info: <RiInformationLine className="size-4" />,
        warning: <RiAlertLine className="size-4" />,
        error: <RiCloseCircleLine className="size-4" />,
        loading: <RiLoader4Line className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-surface-hover group-[.toast]:text-foreground',
          success: '!border-success/30 [&_[data-icon]]:text-success',
          warning: '!border-warning/30 [&_[data-icon]]:text-warning',
          error: '!border-destructive/30 [&_[data-icon]]:text-destructive',
          info: '!border-info/30 [&_[data-icon]]:text-info',
          loading: '[&_[data-icon]]:text-primary',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
          '--font-family': 'var(--font-sans)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster, toast };
