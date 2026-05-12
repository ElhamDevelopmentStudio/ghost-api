import { PageHeader } from '@/components/page-header';
import { ProtectedPageContent } from '@/components/protected-page-frame';

export function LogsPage() {
  return (
    <ProtectedPageContent>
      <PageHeader
        title="Logs"
        description="Operational visibility into every request your mock APIs serve."
      />
      <div className="text-muted-foreground border-border rounded-lg border border-dashed p-12 text-center text-sm">
        Request log table will land here.
      </div>
    </ProtectedPageContent>
  );
}
