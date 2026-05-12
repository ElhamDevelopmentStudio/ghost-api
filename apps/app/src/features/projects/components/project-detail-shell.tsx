import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RiNotification3Line } from '@remixicon/react';
import type { ProjectDetail } from '@ghostapi/types';

import { Button } from '@ghostapi/ui';

import { AppSidebar } from '@/components/app-sidebar';

export function ProjectDetailShell({
  project,
  children,
}: {
  project: ProjectDetail;
  children: ReactNode;
}) {
  return (
    <div className="bg-app-canvas flex min-h-screen text-white">
      <AppSidebar currentProject={project} />

      <main className="min-w-0 flex-1">
        <header className="flex h-[92px] items-center justify-between px-6 lg:px-12">
          <nav className="flex min-w-0 items-center gap-3 text-sm">
            <Link to="/projects" className="text-white/58 transition-colors hover:text-white">
              Projects
            </Link>
            <span className="text-white/42">/</span>
            <span className="truncate text-white">{project.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              disabled
              className="hidden border-white/10 bg-white/[0.035] px-4 text-white md:inline-flex"
            >
              View Docs
            </Button>
            <button
              type="button"
              aria-label="Notifications"
              className="relative hidden size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white md:grid"
            >
              <RiNotification3Line className="size-5" />
            </button>
            <Button
              type="button"
              disabled
              className="bg-brand-action hover:bg-brand-action-hover h-11 rounded-lg px-5 text-white"
            >
              Test Endpoint
            </Button>
          </div>
        </header>

        <div className="px-6 pb-10 pt-4 lg:px-12">{children}</div>
      </main>
    </div>
  );
}
