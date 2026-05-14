import type { ReactNode } from 'react';

import { cn } from '@ghostapi/ui';

import { AppSidebar } from '@/components/app-sidebar';
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
    <div className="bg-background flex min-h-screen text-white">
      <AppSidebar />
      <div className="bg-app-canvas min-w-0 flex-1 overflow-hidden">
        <AppTopbar {...topbar} />
        <ProtectedPageContent className={className}>{children}</ProtectedPageContent>
      </div>
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
