import { PageHeader } from '@/components/page-header';
import { ProtectedPageContent } from '@/components/protected-page-frame';

export function SettingsPage() {
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
