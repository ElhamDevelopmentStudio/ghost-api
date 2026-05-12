import { PageHeader } from '@/components/page-header';
import { ProtectedPageContent } from '@/components/protected-page-frame';

export function WorkspacePage() {
  return (
    <ProtectedPageContent>
      <PageHeader
        title="Workspace"
        description="Browse endpoints, build requests, inspect responses, and tune mock behavior — all in one screen."
      />
      <div className="text-muted-foreground border-border rounded-lg border border-dashed p-12 text-center text-sm">
        The unified API workspace will live here.
      </div>
    </ProtectedPageContent>
  );
}
