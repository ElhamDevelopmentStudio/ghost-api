import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RiBookOpenLine } from '@remixicon/react';

import { Button, Skeleton } from '@ghostapi/ui';

import { PageHeader } from '@/components/page-header';
import { ProtectedPageContent } from '@/components/protected-page-frame';
import { getProject } from '@/features/projects/api/projects-api';
import { ProjectDetailShell } from '@/features/projects/components/project-detail-shell';
import { ProjectSettingsGeneral } from '@/features/project-settings/components/project-settings-general';
import { env } from '@/lib/env';

export function SettingsPage() {
  const { projectId } = useParams();
  const projectQuery = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId ?? ''),
    enabled: Boolean(projectId),
  });

  if (projectId) {
    if (projectQuery.isLoading) {
      return (
        <div className="bg-app-canvas flex h-screen overflow-hidden text-white">
          <main className="min-w-0 flex-1 overflow-y-auto px-6 py-10 lg:px-12">
            <Skeleton className="h-8 w-80 bg-white/[0.06]" />
            <Skeleton className="mt-8 h-[680px] w-full rounded-xl bg-white/[0.04]" />
          </main>
        </div>
      );
    }

    if (projectQuery.isError || !projectQuery.data) {
      return (
        <ProtectedPageContent>
          <PageHeader title="Project unavailable" description="The settings could not be loaded." />
          <Link className="text-sm text-white/70 hover:text-white" to="/projects">
            Back to projects
          </Link>
        </ProtectedPageContent>
      );
    }

    return (
      <ProjectDetailShell
        project={projectQuery.data}
        sectionLabel="Settings"
        action={
          <Button
            asChild
            variant="secondary"
            className="border-white/10 bg-white/[0.04] text-white"
          >
            <a href={`${env.VITE_API_URL}/docs`} target="_blank" rel="noreferrer">
              <RiBookOpenLine className="size-4" />
              Docs
            </a>
          </Button>
        }
      >
        <ProjectSettingsGeneral project={projectQuery.data} />
      </ProjectDetailShell>
    );
  }

  return (
    <ProtectedPageContent>
      <PageHeader
        title="Settings"
        description="Project metadata, environments, mock behavior, schema, members, and the danger zone."
      />
      <div className="text-muted-foreground border-border rounded-lg border border-dashed p-12 text-center text-sm">
        Settings tabs will land here.
      </div>
    </ProtectedPageContent>
  );
}
