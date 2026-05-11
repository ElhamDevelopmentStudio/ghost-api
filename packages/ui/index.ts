/**
 * Public surface of the GhostAPI design system.
 *
 * As shadcn primitives, layouts, and blocks land in this package they should
 * be re-exported here so apps can do `import { Button } from '@ghostapi/ui'`.
 */
export { cn } from './lib/utils.js';

/* ---- Inline / inline-flow primitives ---------------------------------- */

export { Button, buttonVariants } from './components/button.js';
export type { ButtonProps } from './components/button.js';

export { Input } from './components/input.js';
export type { InputProps } from './components/input.js';

export { Checkbox } from './components/checkbox.js';
export type { CheckboxProps } from './components/checkbox.js';

export { Badge, badgeVariants } from './components/badge.js';

export { Chip, chipVariants } from './components/chip.js';
export type { ChipProps, ChipSize, ChipVariant } from './components/chip.js';

export { MethodBadge, methodBadgeVariants } from './components/method-badge.js';
export type { HttpMethod, MethodBadgeProps } from './components/method-badge.js';

export { Separator } from './components/separator.js';

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from './components/avatar.js';

export { Skeleton } from './components/skeleton.js';

/* ---- Feedback / status ----------------------------------------------- */

export { Alert, AlertTitle, AlertDescription, alertVariants } from './components/alert.js';
export type { AlertProps } from './components/alert.js';

export { Toaster, toast } from './components/sonner.js';

export { Progress } from './components/progress.js';
export type { ProgressProps } from './components/progress.js';

export { CircularProgress } from './components/circular-progress.js';
export type { CircularProgressProps } from './components/circular-progress.js';

/* ---- Navigation ------------------------------------------------------- */

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

/* ---- Surfaces / containers ------------------------------------------- */

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './components/card.js';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './components/table.js';

/* ---- Overlays --------------------------------------------------------- */

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/dialog.js';
export type { DialogContentProps } from './components/dialog.js';

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './components/sheet.js';
export type { SheetSide, SheetContentProps } from './components/sheet.js';

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from './components/drawer.js';

/* ---- Blocks ----------------------------------------------------------
 * GhostAPI-specific composed UI. These build on top of primitives + tokens
 * and ship animations; consumers should treat them as "the canonical way"
 * to render the live activity feed, the glowing orb, etc. */

export { GlowOrb } from './blocks/glow-orb.js';
export { AmbientParticles } from './blocks/ambient-particles.js';
export { DataFlowCanvas } from './blocks/data-flow-canvas.js';
export type { SourceBeam, SinkBeam, DataFlowCanvasProps } from './blocks/data-flow-canvas.js';
export { TerminalWindow } from './blocks/terminal-window.js';
export type { TerminalLine } from './blocks/terminal-window.js';
export { ApiLogRow } from './blocks/api-log-row.js';
export type { ApiLogEntry } from './blocks/api-log-row.js';
