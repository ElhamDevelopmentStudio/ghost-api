import type { ReactNode } from 'react';

import { cn } from '@ghostapi/ui';

import { AppTopbar, type AppTopbarProps } from '@/components/app-topbar';

export function ProtectedPageFrame({
  children,
  topbar,
  className,
}: {
  children: ReactNode;
  topbar?: AppTopbarProps;
  className?: string;
}) {
  return (
    <div className="bg-app-canvas min-h-screen overflow-hidden text-white">
      <AppTopbar {...topbar} />
      <ProtectedPageContent className={className}>{children}</ProtectedPageContent>
    </div>
  );
}

export function ProtectedPageContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        'app-shell-container app-shell-x-padding relative mx-auto w-full pb-10 pt-8',
        className,
      )}
    >
      {children}
    </main>
  );
}
