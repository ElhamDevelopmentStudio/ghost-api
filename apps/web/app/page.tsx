import { MethodPill, Panel } from '@ghostapi/ui';

const sampleEndpoints = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/users/{id}' },
  { method: 'POST', path: '/auth/login' },
  { method: 'DELETE', path: '/projects/{id}' },
] as const;

export default function HomePage(): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
          ghostapi · phase 1
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Turn OpenAPI into a working mock backend.
        </h1>
        <p className="max-w-prose text-sm text-neutral-400">
          Foundations are in place. Run the server, upload a schema, and the runtime mounts a live
          mock API at <span className="font-mono text-neutral-200">/mock/:projectId</span>.
        </p>
      </header>

      <Panel className="flex flex-col">
        <div className="border-b border-neutral-800 pb-2 font-mono text-[11px] uppercase tracking-wider text-neutral-500">
          example endpoints
        </div>
        <ul className="divide-y divide-neutral-900">
          {sampleEndpoints.map((e) => (
            <li
              key={`${e.method} ${e.path}`}
              className="flex items-center gap-4 py-2 font-mono text-sm"
            >
              <MethodPill method={e.method} />
              <span className="text-neutral-200">{e.path}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <footer className="font-mono text-[11px] uppercase tracking-wider text-neutral-600">
        api · {process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}
      </footer>
    </main>
  );
}
