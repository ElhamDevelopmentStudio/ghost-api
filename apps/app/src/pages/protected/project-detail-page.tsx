import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RiArrowLeftLine } from '@remixicon/react';

import { Button, Skeleton } from '@ghostapi/ui';

import { getProject } from '@/features/projects/api/projects-api';
import { ProjectDetailShell } from '@/features/projects/components/project-detail-shell';
import { ProjectOverview } from '@/features/projects/components/project-overview';

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const query = useQuery({
    enabled: Boolean(projectId),
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId ?? ''),
  });

  if (query.data) {
    return (
      <ProjectDetailShell project={query.data}>
        <ProjectOverview project={query.data} />
      </ProjectDetailShell>
    );
  }

  return (
    <div className="bg-app-canvas min-h-screen px-6 py-8 text-white lg:px-12">
      <Button asChild variant="tertiary" className="mb-8 h-9 px-3 text-white/70">
        <Link to="/projects">
          <RiArrowLeftLine className="size-4" />
          Projects
        </Link>
      </Button>
      {query.isLoading ? <ProjectDetailSkeleton /> : null}
      {query.isError ? <ProjectLoadError /> : null}
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-lg bg-white/[0.06]" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="h-52 rounded-lg bg-white/[0.06]" />
        <Skeleton className="h-52 rounded-lg bg-white/[0.06]" />
      </div>
    </div>
  );
}

function ProjectLoadError() {
  return (
    <div className="border-white/12 bg-app-panel/80 rounded-lg border border-dashed px-6 py-12 text-center">
      <p className="text-sm font-medium text-white">Project could not be loaded.</p>
      <p className="text-white/52 mt-2 text-sm">
        Check that the project exists and you have access.
      </p>
    </div>
  );
}
