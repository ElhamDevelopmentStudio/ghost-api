import * as React from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine, RiMoreLine } from '@remixicon/react';

import { cn } from '../lib/utils';
import { buttonVariants } from './button';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>): React.JSX.Element {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>): React.JSX.Element {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}

function PaginationItem(props: React.ComponentProps<'li'>): React.JSX.Element {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon' | 'icon-lg';
} & React.ComponentProps<'a'>;

/** A link that visually matches our Button — `tertiary` by default, `primary` when active. */
function PaginationLink({
  className,
  isActive = false,
  size = 'icon',
  ...props
}: PaginationLinkProps): React.JSX.Element {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive || undefined}
      className={cn(
        buttonVariants({ variant: isActive ? 'primary' : 'tertiary', size }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>): React.JSX.Element {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="md"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <RiArrowLeftSLine />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>): React.JSX.Element {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="md"
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <RiArrowRightSLine />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>): React.JSX.Element {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('text-muted-foreground flex size-9 items-center justify-center', className)}
      {...props}
    >
      <RiMoreLine className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
export type { PaginationLinkProps };
