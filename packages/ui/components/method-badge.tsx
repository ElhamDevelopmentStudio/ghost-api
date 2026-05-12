import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

/** HTTP methods we visually distinguish across the product. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

const methodBadgeVariants = cva(
  [
    'inline-flex shrink-0 select-none items-center justify-center rounded-md border font-mono font-semibold tracking-wider uppercase',
    'transition-colors',
  ].join(' '),
  {
    variants: {
      method: {
        GET: 'border-method-get/30 bg-method-get/10 text-method-get',
        POST: 'border-method-post/30 bg-method-post/10 text-method-post',
        PUT: 'border-method-put/30 bg-method-put/10 text-method-put',
        PATCH: 'border-method-patch/30 bg-method-patch/10 text-method-patch',
        DELETE: 'border-method-delete/30 bg-method-delete/10 text-method-delete',
        HEAD: 'border-method-head/30 bg-method-head/10 text-method-head',
        OPTIONS: 'border-method-options/30 bg-method-options/10 text-method-options',
      },
      size: {
        sm: 'h-5 px-1.5 text-[10px]',
        md: 'h-6 px-2 text-[11px]',
        lg: 'h-7 px-2.5 text-xs',
      },
    },
    defaultVariants: {
      method: 'GET',
      size: 'md',
    },
  },
);

type MethodBadgeProps = Omit<React.ComponentProps<'span'>, 'children'> &
  VariantProps<typeof methodBadgeVariants> & {
    method: HttpMethod;
  };

/**
 * Method-colored pill used wherever an HTTP method needs a visual marker —
 * endpoint sidebar, request log rows, the live activity panel on the landing
 * page, etc. Backed by the `--method-*` tokens in the design system so the
 * color of "GET" stays consistent everywhere.
 */
function MethodBadge({ className, method, size, ...props }: MethodBadgeProps): React.JSX.Element {
  return (
    <span
      data-slot="method-badge"
      data-method={method}
      className={cn(methodBadgeVariants({ method, size }), className)}
      {...props}
    >
      {method}
    </span>
  );
}

export { MethodBadge, methodBadgeVariants };
export type { MethodBadgeProps };
