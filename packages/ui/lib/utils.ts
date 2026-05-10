import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard shadcn `cn` helper. Merges class lists and resolves Tailwind
 * conflicts so later utilities win over earlier ones.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
