import {
  RiCalendarLine,
  RiExternalLinkLine,
  RiFilter3Line,
  RiFlashlightLine,
  RiGlobalLine,
  RiPencilLine,
} from '@remixicon/react';
import type { ProjectDetail } from '@ghostapi/types';

import { Badge, Button } from '@ghostapi/ui';

import { ProjectHeroVisual } from '@/features/projects/components/project-hero-visual';
import { formatProjectRequests } from '@/features/projects/utils/project-formatters';

export function ProjectOverview({ project }: { project: ProjectDetail }) {
  const environment = project.environment ?? project.environments[0] ?? null;
  const updatedAt = new Date(project.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,0.78fr)_minmax(620px,1fr)]">
        <div className="min-w-0 pt-6">
          <Badge className="border-emerald-400/10 bg-emerald-500/10 px-3 py-2 text-emerald-300">
            <span className="size-2 rounded-full bg-emerald-400" />
            {project.status}
          </Badge>

          <div className="mt-7 flex items-center gap-3">
            <h1 className="truncate text-4xl font-semibold tracking-normal text-white">
              {project.name}
            </h1>
            <RiPencilLine className="size-5 text-purple-300" />
          </div>

          <p className="text-white/62 mt-5 max-w-2xl text-base leading-7">
            {project.description ||
              'Mock API project ready for schema uploads and simulated traffic.'}
          </p>

          <div className="text-white/58 mt-10 flex flex-wrap items-center gap-5 text-sm">
            <span className="inline-flex items-center gap-2">
              <RiFlashlightLine className="size-4 text-purple-300" />
              {environment?.name ?? 'No environment'}
            </span>
            <span className="text-white/28">•</span>
            <span className="inline-flex min-w-0 items-center gap-2">
              <span className="max-w-[240px] truncate">
                {environment?.baseUrl || 'No base URL'}
              </span>
              {environment?.baseUrl ? (
                <RiExternalLinkLine className="size-4 text-purple-300" />
              ) : null}
            </span>
            <span className="text-white/28">•</span>
            <span className="inline-flex items-center gap-2">
              <RiCalendarLine className="text-white/48 size-4" />
              {updatedAt}
            </span>
          </div>
        </div>

        <ProjectHeroVisual
          requestsToday={formatProjectRequests(project.requestCount)}
          errorRate="0.00%"
          averageLatency="0ms"
        />
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.025] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-purple-400" />
              <h2 className="text-base font-semibold text-white">Live Activity</h2>
            </div>
            <p className="mt-2 text-sm text-white/50">Recent API requests</p>
          </div>
          <Button type="button" variant="tertiary" disabled className="text-white/56">
            <RiFilter3Line className="size-4" />
            Filter
          </Button>
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-black/10">
          {project.requestCount > 0 ? <ActivitySummary project={project} /> : <EmptyActivity />}
        </div>
      </section>
    </div>
  );
}

function ActivitySummary({ project }: { project: ProjectDetail }) {
  return (
    <div className="grid gap-0 md:grid-cols-3">
      <ActivityCell label="Total requests" value={formatProjectRequests(project.requestCount)} />
      <ActivityCell label="Known endpoints" value={String(project.endpointCount)} />
      <ActivityCell
        label="Latest schema"
        value={project.schemas[0] ? `v${project.schemas[0].version}` : 'None'}
      />
    </div>
  );
}

function ActivityCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-white/8 border-b p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="text-white/48 text-sm">{label}</div>
      <div className="mt-2 font-mono text-lg text-white">{value}</div>
    </div>
  );
}

function EmptyActivity() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
      <RiGlobalLine className="text-white/32 size-8" />
      <p className="mt-4 text-sm font-medium text-white">No requests recorded yet</p>
      <p className="text-white/48 mt-2 max-w-md text-sm leading-6">
        Activity will appear here after this project starts serving mock API traffic.
      </p>
    </div>
  );
}
