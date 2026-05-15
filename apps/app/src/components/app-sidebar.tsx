import { Link, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  RiArrowDownSLine,
  RiFileList3Line,
  RiHome5Line,
  RiLogoutBoxRLine,
  RiSettings3Line,
  RiTerminalBoxLine,
} from '@remixicon/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
  cn,
} from '@ghostapi/ui';

import { Logo } from '@/components/logo';
import { useAuth } from '@/features/auth';
import { listProjects, type ProjectDetail } from '@/features/projects/api/projects-api';

type AppSidebarProps = {
  currentProject?: ProjectDetail | null;
};

const MAIN_NAV = [
  {
    label: 'Overview',
    icon: RiHome5Line,
    getTo: (projectId?: string) => (projectId ? `/projects/${projectId}` : '/projects'),
  },
  { label: 'Logs', icon: RiFileList3Line, getTo: () => '/logs' },
  { label: 'Settings', icon: RiSettings3Line, getTo: () => '/settings' },
] as const;

const PROJECT_DETAIL_NAV = [
  { label: 'Overview', icon: RiHome5Line, getTo: (projectId: string) => `/projects/${projectId}` },
  {
    label: 'Playground',
    icon: RiTerminalBoxLine,
    getTo: (projectId: string) => `/projects/${projectId}/playground`,
  },
  {
    label: 'Activity',
    icon: RiFileList3Line,
    getTo: (projectId: string) => `/projects/${projectId}/activity`,
  },
  {
    label: 'Settings',
    icon: RiSettings3Line,
    getTo: (projectId: string) => `/projects/${projectId}/settings`,
  },
] as const;

const dropdownSurfaceClass =
  'border-white/16 bg-sidebar-dropdown text-white shadow-sidebar-dropdown backdrop-blur-2xl supports-[backdrop-filter]:bg-sidebar-dropdown-blur';

export function AppSidebar({ currentProject }: AppSidebarProps) {
  const location = useLocation();
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });
  const { user, isLoading: isAuthLoading, signOut, isSigningOut } = useAuth();
  const workspaceLabel = currentProject?.name ?? 'My Workspace';
  const projectCount = projectsQuery.data?.length ?? 0;

  return (
    <aside className="relative hidden h-screen w-[286px] shrink-0 overflow-hidden border-r border-white/10 bg-black/20 text-white lg:flex lg:flex-col">
      <div className="px-6 pb-6 pt-9">
        <Logo imageClassName="h-11" />
      </div>

      <div className="px-6">
        <WorkspaceSelector
          label={workspaceLabel}
          isLoading={projectsQuery.isLoading}
          isError={projectsQuery.isError}
          projectCount={projectCount}
        />
      </div>

      <nav className="mt-9 flex flex-1 flex-col px-6">
        <div className="text-white/46 mb-4 text-xs uppercase tracking-[0.12em]">Main</div>
        <div className="space-y-4">
          {currentProject
            ? PROJECT_DETAIL_NAV.map(({ label, icon: Icon, ...item }) => {
                const to = item.getTo(currentProject.id);
                const isActive = location.pathname === to;

                return (
                  <Link
                    key={label}
                    to={to}
                    className={cn(
                      'flex h-12 items-center gap-4 rounded-xl px-3 text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-nav-active shadow-sidebar-nav-active text-white'
                        : 'text-white/72 hover:bg-white/[0.04] hover:text-white',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-8 place-items-center rounded-full',
                        isActive
                          ? 'bg-sidebar-nav-icon-active shadow-sidebar-nav-icon-active text-white'
                          : 'text-white/76',
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    {label}
                  </Link>
                );
              })
            : MAIN_NAV.map(({ label, icon: Icon, getTo }) => (
                <NavLink
                  key={label}
                  to={getTo()}
                  className={({ isActive }) =>
                    cn(
                      'flex h-12 items-center gap-4 rounded-xl px-3 text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-nav-active shadow-sidebar-nav-active text-white'
                        : 'text-white/72 hover:bg-white/[0.04] hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          'grid size-8 place-items-center rounded-full',
                          isActive
                            ? 'bg-sidebar-nav-icon-active shadow-sidebar-nav-icon-active text-white'
                            : 'text-white/76',
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
        </div>
      </nav>

      <SidebarBlob />

      <div className="border-white/12 shadow-sidebar-dropdown supports-[backdrop-filter]:bg-[#090c16]/28 relative z-10 border-t bg-[#090c16]/35 px-6 py-5 backdrop-blur-2xl">
        {isAuthLoading ? (
          <UserSkeleton />
        ) : (
          <UserMenu
            name={user?.name ?? 'Signed in'}
            email={user?.email ?? 'No email available'}
            onSignOut={() => void signOut()}
            isSigningOut={isSigningOut}
          />
        )}
      </div>
    </aside>
  );
}

function WorkspaceSelector({
  label,
  isLoading,
  isError,
  projectCount,
}: {
  label: string;
  isLoading: boolean;
  isError: boolean;
  projectCount: number;
}) {
  if (isLoading) {
    return <Skeleton className="h-11 flex-1 rounded-lg bg-white/[0.06]" />;
  }

  const text = isError ? 'Workspace unavailable' : label;
  const detail = isError
    ? 'Could not load projects'
    : `${projectCount} project${projectCount === 1 ? '' : 's'}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-4 text-left text-sm text-white transition-colors hover:bg-white/[0.06]"
        >
          <span className={cn('size-2 rounded-full', isError ? 'bg-red-400' : 'bg-emerald-400')} />
          <span className="min-w-0 flex-1">
            <span className="block truncate">{text}</span>
            <span className="sr-only">{detail}</span>
          </span>
          <RiArrowDownSLine className="text-white/58 size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className={cn('w-[238px]', dropdownSurfaceClass)}
      >
        <DropdownMenuItem disabled className="text-white/62">
          {detail}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild>
          <Link to="/projects">View projects</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({
  name,
  email,
  onSignOut,
  isSigningOut,
}: {
  name: string;
  email: string;
  onSignOut: () => void;
  isSigningOut: boolean;
}) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
        >
          <span className="bg-brand-action shadow-sidebar-avatar grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-white">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">{name}</span>
            <span className="text-white/52 mt-1 block truncate text-xs">{email}</span>
          </span>
          <RiArrowDownSLine className="text-white/62 size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={cn('w-[220px]', dropdownSurfaceClass)}
      >
        <DropdownMenuItem disabled className="text-white/62">
          {email}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onSelect={onSignOut} disabled={isSigningOut} variant="destructive">
          <RiLogoutBoxRLine className="size-4" />
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-11 rounded-full bg-white/[0.06]" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-24 bg-white/[0.06]" />
        <Skeleton className="h-3 w-36 bg-white/[0.06]" />
      </div>
    </div>
  );
}

function SidebarBlob() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[260px] overflow-hidden"
    >
      <div className="bg-sidebar-blob border-sidebar-blob shadow-sidebar-blob animate-sidebar-blob absolute bottom-[-28px] left-[-4px] h-[172px] w-[190px] border">
        <span className="bg-sidebar-blob-highlight absolute left-8 top-8 h-24 w-16 rounded-[55%_45%_68%_32%/42%_62%_38%_58%] blur-2xl" />
        <span className="bg-sidebar-blob-accent absolute bottom-6 right-4 h-14 w-20 rounded-[35%_65%_48%_52%/63%_36%_64%_37%] blur-xl" />
      </div>
    </div>
  );
}
