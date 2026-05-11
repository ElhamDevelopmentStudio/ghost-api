/**
 * Public surface of the GhostAPI design system.
 *
 * As shadcn primitives, layouts, and blocks land in this package they should
 * be re-exported here so apps can do `import { Button } from '@ghostapi/ui'`.
 */
export { cn } from './lib/utils.js';

export { Button, buttonVariants } from './components/button.js';
export type { ButtonProps } from './components/button.js';

export { Badge, badgeVariants } from './components/badge.js';

export { Chip, chipVariants } from './components/chip.js';
export type { ChipProps, ChipSize, ChipVariant } from './components/chip.js';

export { Alert, AlertTitle, AlertDescription, alertVariants } from './components/alert.js';
export type { AlertProps } from './components/alert.js';

export { Toaster, toast } from './components/sonner.js';

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './components/pagination.js';
export type { PaginationLinkProps } from './components/pagination.js';

export { Progress } from './components/progress.js';
export type { ProgressProps } from './components/progress.js';

export { CircularProgress } from './components/circular-progress.js';
export type { CircularProgressProps } from './components/circular-progress.js';
