import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RiArrowLeftLine } from '@remixicon/react';

import { Button, Skeleton } from '@ghostapi/ui';

import { ProjectActivity } from '@/features/activity/components/project-activity';
import { getProject } from '@/features/projects/api/projects-api';
import { ProjectDetailShell } from '@/features/projects/components/project-detail-shell';

export function ProjectActivityPage() {
  const { projectId } = useParams();
  const query = useQuery({
    enabled: Boolean(projectId),
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId ?? ''),
  });

  if (query.data) {
    return (
      <ProjectDetailShell project={query.data} sectionLabel="Activity">
        <ProjectActivity project={query.data} />
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
      {query.isLoading ? <Skeleton className="h-[620px] rounded-lg bg-white/[0.06]" /> : null}
      {query.isError ? <ProjectActivityLoadError onRetry={() => void query.refetch()} /> : null}
    </div>
  );
}

function ProjectActivityLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border-white/12 bg-app-panel/80 rounded-lg border border-dashed px-6 py-12 text-center">
      <p className="text-sm font-medium text-white">Project activity could not be loaded.</p>
      <p className="text-white/52 mt-2 text-sm">
        Check that the project exists and you have access.
      </p>
      <Button type="button" variant="secondary" className="mt-6" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
