import { useMemo, useState, type ComponentType } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RiBox3Line, RiFlashlightLine, RiTimeLine } from '@remixicon/react';

import { cn } from '@ghostapi/ui';

import { PageHeader } from '@/components/page-header';
import { ProtectedPageFrame } from '@/components/protected-page-frame';
import { FloatingGhost } from '@/features/projects/components/floating-ghost';
import { ProjectCard } from '@/features/projects/components/project-card';
import { listProjects } from '@/features/projects/api/projects-api';
import { formatProjectRequests } from '@/features/projects/utils/project-formatters';

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
    <ProtectedPageFrame topbar={{ search: { value: query, onChange: setQuery } }}>
      <PageHeader
        title="Your Projects"
        description="All your API simulations in one place."
        visual={<FloatingGhost />}
        action={
          <ProjectSummary
            projects={projects.length}
            requests={formatProjectRequests(requestTotal)}
            uptime="99.9%"
          />
        }
      />

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="border-white/8 h-[260px] animate-pulse rounded-xl border bg-white/[0.035]"
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
    </ProtectedPageFrame>
  );
}

function ProjectSummary({
  projects,
  requests,
  uptime,
}: {
  projects: number;
  requests: string;
  uptime: string;
}) {
  return (
    <dl className="bg-app-panel-soft/60 flex w-full max-w-[620px] flex-wrap items-center rounded-lg border border-white/10 px-1 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <SummaryMetric icon={RiBox3Line} label="Projects" value={String(projects)} tone="purple" />
      <SummaryMetric icon={RiFlashlightLine} label="Requests" value={requests} tone="green" />
      <SummaryMetric icon={RiTimeLine} label="Uptime" value={uptime} tone="yellow" />
    </dl>
  );
}

function SummaryMetric({
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
    purple: 'text-purple-300 bg-purple-500/12',
    green: 'text-emerald-300 bg-emerald-500/12',
    yellow: 'text-yellow-300 bg-yellow-500/12',
  };

  return (
    <div className="border-white/8 flex min-h-11 min-w-[150px] flex-1 items-center gap-3 border-r px-4 py-2 last:border-r-0">
      <dt className={cn('grid size-8 place-items-center rounded-md', tones[tone])}>
        <Icon className="size-4" />
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="min-w-0">
        <span className="block text-lg font-semibold leading-none text-white">{value}</span>
        <span className="text-white/48 mt-1 block text-xs uppercase tracking-[0.12em]">
          {label}
        </span>
      </dd>
    </div>
  );
}
