import { PageHeader } from '@/components/page-header';

export function LogsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Logs"
        description="Operational visibility into every request your mock APIs serve."
      />
      <div className="text-muted-foreground border-border rounded-lg border border-dashed p-12 text-center text-sm">
        Request log table will land here.
      </div>
    </div>
  );
}
