import { PageHeader } from '@/pages/_page-header';

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <PageHeader
        title="Settings"
        description="Project metadata, environments, mock behavior, schema, members, and the danger zone."
      />
      <div className="text-muted-foreground border-border rounded-lg border border-dashed p-12 text-center text-sm">
        Settings tabs will land here.
      </div>
    </div>
  );
}
