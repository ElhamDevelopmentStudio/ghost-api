import { PageHeader } from '@/components/page-header';

export function WorkspacePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <PageHeader
        title="Workspace"
        description="Browse endpoints, build requests, inspect responses, and tune mock behavior — all in one screen."
      />
      <div className="text-muted-foreground border-border rounded-lg border border-dashed p-12 text-center text-sm">
        The unified API workspace will live here.
      </div>
    </div>
  );
}
