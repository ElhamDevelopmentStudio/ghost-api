import { Outlet } from 'react-router-dom';

/** Centered card surface for /login and /register. */
export function AuthLayout() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <header className="mb-6 text-center">
          <h1 className="text-foreground font-mono text-xl tracking-tight">GhostAPI</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Mock REST APIs from OpenAPI in seconds.
          </p>
        </header>
        <div className="border-border bg-popover rounded-lg border p-6 shadow-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
