import type { ReactNode } from 'react';

import { cn } from '@ghostapi/ui';

type AuthNoticeProps = {
  children: ReactNode;
  variant: 'error' | 'success';
  className?: string;
};

const noticeStyles = {
  error: 'border-destructive/40 bg-destructive/10 text-destructive-foreground',
  success: 'border-success/35 bg-success/10 text-success-foreground',
} as const;

export function AuthNotice({ children, variant, className }: AuthNoticeProps) {
  return (
    <p className={cn('rounded-md border px-4 py-3 text-sm', noticeStyles[variant], className)}>
      {children}
    </p>
  );
}
