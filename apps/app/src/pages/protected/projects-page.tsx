import { useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  RiAddLine,
  RiArrowDownSLine,
  RiBox3Line,
  RiDashboardLine,
  RiFlashlightLine,
  RiListCheck,
  RiNotification3Line,
  RiSearchLine,
  RiShareLine,
  RiStarLine,
  RiSunLine,
  RiTeamLine,
  RiTimeLine,
} from '@remixicon/react';

import { Button, cn } from '@ghostapi/ui';

import { FloatingGhost } from '@/features/projects/components/floating-ghost';
import { ProjectCard } from '@/features/projects/components/project-card';
import { listProjects } from '@/features/projects/api/projects-api';

const filters = [
  { label: 'All Projects', icon: RiShareLine, active: true },
  { label: 'Favorites', icon: RiStarLine, active: false },
  { label: 'Recently Opened', icon: RiTimeLine, active: false },
  { label: 'Shared With Me', icon: RiTeamLine, active: false },
] as const;

export function ProjectsPage() {
  const [query, setQuery] = useState('');
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        `${project.name} ${project.description ?? ''}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [projects, query],
  );

  const requestTotal = projects.reduce((sum, project) => sum + project.requestCount, 0);

  return (
    <div className="bg-app-canvas min-h-screen overflow-hidden text-white">
      <ProjectsTopbar query={query} onQueryChange={setQuery} />

      <main className="relative mx-auto max-w-[1390px] px-6 pb-10 pt-6">
        <section className="border-white/6 grid min-h-[228px] grid-cols-1 items-center gap-8 border-b pb-6 lg:grid-cols-[640px_1fr]">
          <div>
            <h1 className="font-mono text-[42px] font-semibold leading-none tracking-[0] text-white md:text-[48px]">
              Your Projects
            </h1>
            <p className="text-white/66 mt-5 text-xl">All your API simulations in one place.</p>

            <div className="mt-8 grid max-w-[540px] grid-cols-1 gap-4 sm:grid-cols-3">
              <Metric
                icon={RiBox3Line}
                label="Projects"
                value={String(projects.length)}
                tone="purple"
              />
              <Metric
                icon={RiFlashlightLine}
                label="Requests"
                value={formatRequests(requestTotal)}
                tone="green"
              />
              <Metric icon={RiTimeLine} label="Uptime" value="99.9%" tone="yellow" />
            </div>
          </div>

          <FloatingGhost />
        </section>

        <section className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-5">
            {filters.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
                className={cn(
                  'flex h-10 items-center gap-2 rounded-lg border px-4 text-sm transition',
                  active
                    ? 'border-purple-500/25 bg-purple-700/35 text-purple-300'
                    : 'text-white/58 bg-app-panel-soft/80 border-white/10 hover:border-white/20 hover:text-white',
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-app-panel-strong flex h-10 rounded-lg border border-white/10 p-1">
              <button
                type="button"
                aria-label="Grid view"
                className="grid size-8 place-items-center rounded-md bg-purple-700/25 text-purple-300"
              >
                <RiDashboardLine className="size-4" />
              </button>
              <button
                type="button"
                aria-label="List view"
                className="text-white/42 grid size-8 place-items-center rounded-md"
              >
                <RiListCheck className="size-4" />
              </button>
            </div>
            <button
              type="button"
              className="bg-app-panel-strong flex h-10 items-center gap-7 rounded-lg border border-white/10 px-4 text-sm text-white"
            >
              Last Modified
              <RiArrowDownSLine className="text-white/48 size-4" />
            </button>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="border-white/8 h-[226px] animate-pulse rounded-xl border bg-white/[0.035]"
                />
              ))
            : filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
        </section>

        {!isLoading && filteredProjects.length === 0 ? (
          <div className="border-white/12 text-white/58 mt-10 rounded-xl border border-dashed bg-white/[0.025] px-6 py-12 text-center">
            No projects found.
          </div>
        ) : null}

        <p className="text-white/58 mt-8 text-center text-base">
          Want a template?{' '}
          <a className="text-purple-400 underline underline-offset-4" href="/projects">
            Browse examples
          </a>{' '}
          <span className="text-purple-400">-&gt;</span>
        </p>
      </main>
    </div>
  );
}

function ProjectsTopbar({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <header className="flex h-[92px] items-center justify-between px-8 md:px-12">
      <GhostLogo />

      <div className="flex items-center gap-6">
        <label className="text-white/48 bg-app-panel-deep/95 shadow-project-search hidden h-10 w-[290px] items-center gap-3 rounded-lg border border-white/10 px-3 md:flex">
          <RiSearchLine className="size-4" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
            placeholder="Search projects..."
          />
          <span className="text-xs text-white/60">⌘K</span>
        </label>

        <button
          type="button"
          aria-label="Command menu"
          className="bg-app-panel-strong hidden h-10 min-w-10 rounded-lg border border-white/10 px-4 text-lg text-white md:block"
        >
          /
        </button>
        <IconButton label="Theme">
          <RiSunLine className="size-5" />
        </IconButton>
        <IconButton label="Notifications" badge="3">
          <RiNotification3Line className="size-5" />
        </IconButton>
        <Button
          asChild
          className="bg-brand-action hover:bg-brand-action-hover h-10 rounded-md px-5 text-sm"
        >
          <Link to="/projects/new">
            <RiAddLine className="size-4" />
            New Project
          </Link>
        </Button>
      </div>
    </header>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: 'purple' | 'green' | 'yellow';
}) {
  const tones = {
    purple: 'bg-purple-500/18 text-purple-300',
    green: 'bg-emerald-500/18 text-emerald-300',
    yellow: 'bg-yellow-500/18 text-yellow-300',
  };

  return (
    <div className="bg-app-panel-soft/86 flex h-[77px] items-center gap-4 rounded-lg border border-white/10 px-5">
      <div className={cn('grid size-11 place-items-center rounded-full', tones[tone])}>
        <Icon className="size-5" />
      </div>
      <div>
        <div className="text-2xl font-bold leading-none text-white">{value}</div>
        <div className="text-white/52 mt-2 text-sm">{label}</div>
      </div>
    </div>
  );
}

function GhostLogo() {
  return (
    <Link to="/projects" className="flex items-center gap-3">
      <div className="bg-brand-ghost relative grid size-8 place-items-center rounded-b-md rounded-t-2xl">
        <span className="bg-brand-ghost-foot absolute bottom-[-3px] left-[5px] size-2 rounded-full" />
        <span className="bg-brand-ghost-foot absolute bottom-[-3px] left-[13px] size-2 rounded-full" />
        <span className="bg-brand-ghost-foot absolute bottom-[-3px] right-[5px] size-2 rounded-full" />
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white" />
        <span className="absolute right-2.5 top-3 h-1.5 w-1.5 rounded-full bg-white" />
      </div>
      <span className="font-mono text-2xl font-bold tracking-[0] text-white">
        GHOST<span className="text-brand-accent">API</span>
      </span>
    </Link>
  );
}

function IconButton({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="bg-app-panel-strong relative hidden size-10 place-items-center rounded-lg border border-white/10 text-white md:grid"
    >
      {children}
      {badge ? (
        <span className="bg-primary-active absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full text-xs font-bold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function formatRequests(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}
