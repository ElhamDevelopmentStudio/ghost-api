import { Plus } from 'lucide-react';

import { Button } from '@ghostapi/ui';

import { PageHeader } from '@/components/page-header';

export function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <PageHeader
        title="Projects"
        description="Each project ingests one OpenAPI schema and serves a live mock API."
        action={
          <Button>
            <Plus />
            New project
          </Button>
        }
      />
      <div className="text-muted-foreground border-border rounded-lg border border-dashed p-12 text-center text-sm">
        No projects yet. Create one to upload a schema and start mocking.
      </div>
    </div>
  );
}
