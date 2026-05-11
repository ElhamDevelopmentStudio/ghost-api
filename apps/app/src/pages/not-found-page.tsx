import { Link } from 'react-router-dom';

import { Button } from '@ghostapi/ui';

export function NotFoundPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-muted-foreground font-mono text-xs uppercase tracking-wider">404</span>
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">
        That route doesn&apos;t exist.
      </h1>
      <Button variant="tertiary" asChild>
        <Link to="/projects">Back to projects</Link>
      </Button>
    </div>
  );
}
