import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectDetail } from '@ghostapi/types';

import { AppSidebar } from '@/components/app-sidebar';

export function ProjectDetailShell({
  project,
  children,
  sectionLabel,
  action,
}: {
  project: ProjectDetail;
  children: ReactNode;
  sectionLabel?: string;
  action?: ReactNode;
}) {
  return (
    <div className="bg-app-canvas flex h-screen overflow-hidden text-white">
      <AppSidebar currentProject={project} />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="flex h-[92px] items-center justify-between px-6 lg:px-12">
          <nav className="flex min-w-0 items-center gap-3 text-sm">
            <Link to="/projects" className="text-white/58 transition-colors hover:text-white">
              Projects
            </Link>
            <span className="text-white/42">/</span>
            <span className="truncate text-white">{project.name}</span>
            {sectionLabel ? (
              <>
                <span className="text-white/42">/</span>
                <span className="truncate text-white">{sectionLabel}</span>
              </>
            ) : null}
          </nav>

          {action ?? (
            <Link
              to="/projects"
              className="text-white/58 text-sm transition-colors hover:text-white"
            >
              All projects
            </Link>
          )}
        </header>

        <div className="px-6 pb-10 pt-4 lg:px-12">{children}</div>
      </main>
    </div>
  );
}
