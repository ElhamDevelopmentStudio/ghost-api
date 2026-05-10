import { Badge, Button } from '@ghostapi/ui';

export default function HomePage(): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="font-mono">
          phase 1
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Turn OpenAPI into a working mock backend.
        </h1>
        <p className="text-muted-foreground max-w-prose text-sm">
          Foundations are in place. Run the server, upload a schema, and the runtime mounts a live
          mock API at <span className="text-foreground font-mono">/mock/:projectId</span>.
        </p>
        <div className="flex gap-2 pt-2">
          <Button>Upload schema</Button>
          <Button variant="outline">View docs</Button>
        </div>
      </header>

      <footer className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
        api · {process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}
      </footer>
    </main>
  );
}
