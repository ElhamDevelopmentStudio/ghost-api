import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RiArrowLeftLine, RiFileList3Line } from '@remixicon/react';

import { Button, Skeleton } from '@ghostapi/ui';

import { getProject, listProjectEndpoints } from '@/features/projects/api/projects-api';
import { ProjectOnboarding } from '@/features/projects/components/project-onboarding';
import { ProjectPlayground } from '@/features/playground/components/project-playground';
import { env } from '@/lib/env';

export function PlaygroundPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const projectQuery = useQuery({
    enabled: Boolean(projectId),
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId ?? ''),
  });
  const endpointsQuery = useQuery({
    enabled: Boolean(projectId) && Boolean(projectQuery.data?.endpointCount),
    queryKey: ['projects', projectId, 'endpoints'],
    queryFn: () => listProjectEndpoints(projectId ?? ''),
  });

  if (projectQuery.data) {
    const needsOnboarding =
      projectQuery.data.schemas.length === 0 || projectQuery.data.endpointCount === 0;

    if (needsOnboarding) {
      return (
        <div className="bg-app-canvas min-h-screen px-6 py-6 text-white lg:px-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Button asChild variant="tertiary" className="h-9 px-3 text-white/70">
              <Link to={`/projects/${projectQuery.data.id}`}>
                <RiArrowLeftLine className="size-4" />
                Back
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="border-white/10 bg-white/[0.035] text-white"
            >
              <a href={`${env.VITE_API_URL}/docs`} target="_blank" rel="noreferrer">
                <RiFileList3Line className="size-4" />
                Docs
              </a>
            </Button>
          </div>
          <ProjectOnboarding
            project={projectQuery.data}
            onContinue={async () => {
              await queryClient.invalidateQueries({ queryKey: ['projects'] });
              await queryClient.invalidateQueries({
                queryKey: ['projects', projectId, 'endpoints'],
              });
              await projectQuery.refetch();
            }}
          />
        </div>
      );
    }

    return (
      <ProjectPlayground
        key={projectQuery.data.id}
        project={projectQuery.data}
        endpoints={endpointsQuery.data ?? []}
        isLoading={endpointsQuery.isLoading}
        isError={endpointsQuery.isError}
        onRetry={() => void endpointsQuery.refetch()}
      />
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
      {projectQuery.isLoading ? <PlaygroundSkeleton /> : null}
      {projectQuery.isError ? (
        <PlaygroundLoadError onRetry={() => void projectQuery.refetch()} />
      ) : null}
    </div>
  );
}

function PlaygroundSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Skeleton className="h-[620px] rounded-lg bg-white/[0.06]" />
      <Skeleton className="h-[620px] rounded-lg bg-white/[0.06]" />
    </div>
  );
}

function PlaygroundLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border-white/12 bg-app-panel/80 rounded-lg border border-dashed px-6 py-12 text-center">
      <p className="text-sm font-medium text-white">Playground could not be loaded.</p>
      <p className="text-white/52 mt-2 text-sm">
        Check that the project exists and you have access.
      </p>
      <Button type="button" variant="secondary" className="mt-6" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
