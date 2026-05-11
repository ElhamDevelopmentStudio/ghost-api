import { Link } from 'react-router-dom';

import { Button } from '@ghostapi/ui';

/** Placeholder. Real form lands when /auth/register exists. */
export function RegisterPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-foreground text-base font-semibold">Create account</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Spin up your first mock API in under a minute.
        </p>
      </div>
      <p className="text-muted-foreground border-border rounded-md border border-dashed p-3 text-xs">
        Registration UI will land alongside the auth API.
      </p>
      <Button variant="tertiary" asChild className="w-full">
        <Link to="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
