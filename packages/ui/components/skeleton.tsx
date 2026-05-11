import * as React from 'react';

import { cn } from '@ghostapi/ui/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-surface-hover animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
