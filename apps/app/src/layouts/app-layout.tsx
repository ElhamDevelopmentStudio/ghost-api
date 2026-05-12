import { NavLink, Outlet } from 'react-router-dom';
import {
  RiFileList3Line,
  RiFlowChart,
  RiFolderLine,
  RiLogoutBoxRLine,
  RiSettings3Line,
} from '@remixicon/react';

import { Button, cn } from '@ghostapi/ui';

import { AppTopbar } from '@/components/app-topbar';
import { Logo } from '@/components/logo';
import { useAuth } from '@/features/auth';

const NAV = [
  { to: '/projects', label: 'Projects', icon: RiFolderLine },
  { to: '/workspace', label: 'Workspace', icon: RiFlowChart },
  { to: '/logs', label: 'Logs', icon: RiFileList3Line },
  { to: '/settings', label: 'Settings', icon: RiSettings3Line },
] as const;

/**
 * Shell for protected pages. Sidebar with primary nav + a topbar slot for the
 * current page's controls. Pages render into the central scroll area.
 */
export function AppLayout() {
  const { user, signOut, isSigningOut } = useAuth();

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <aside className="bg-sidebar border-border flex w-[var(--sidebar-width)] shrink-0 flex-col border-r">
        <div className="border-border border-b px-5 py-4">
          <Logo imageClassName="h-7" />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'text-muted-foreground hover:bg-surface-hover hover:text-foreground flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                  isActive && 'bg-surface-hover text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-border flex items-center justify-between gap-2 border-t px-3 py-3">
          <div className="min-w-0 text-xs">
            <div className="text-foreground truncate">{user?.name ?? 'Signed in'}</div>
            <div className="text-muted-foreground truncate">{user?.email}</div>
          </div>
          <Button
            variant="tertiary"
            size="icon-sm"
            aria-label="Sign out"
            loading={isSigningOut}
            onClick={() => void signOut()}
          >
            <RiLogoutBoxRLine />
          </Button>
        </div>
      </aside>

      <div className="bg-app-canvas min-w-0 flex-1 overflow-y-auto text-white">
        <AppTopbar />
        <Outlet />
      </div>
    </div>
  );
}
