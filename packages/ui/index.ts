/**
 * Public surface of the GhostAPI design system.
 *
 * As shadcn primitives, layouts, and blocks land in this package they should
 * be re-exported here so apps can do `import { Button } from '@ghostapi/ui'`.
 */
export { cn } from './lib/utils.js';
export { Button, buttonVariants } from './components/button.js';
export { Badge, badgeVariants } from './components/badge.js';
