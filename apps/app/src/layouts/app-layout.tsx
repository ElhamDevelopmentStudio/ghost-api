import { Outlet } from 'react-router-dom';

import { AppSidebar } from '@/components/app-sidebar';
import { AppTopbar } from '@/components/app-topbar';

/**
 * Shell for protected pages. Pages render into the central scroll area next to
 * the shared application sidebar.
 */
export function AppLayout() {
  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <AppSidebar />
      <div className="bg-app-canvas min-w-0 flex-1 overflow-y-auto text-white">
        <AppTopbar />
        <Outlet />
      </div>
    </div>
  );
}
