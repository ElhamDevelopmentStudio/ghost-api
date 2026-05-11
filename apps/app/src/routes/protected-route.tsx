import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth';

/**
 * Wraps protected routes. Unauthenticated users are sent to /login with the
 * intended destination preserved in `location.state.from` so the login page
 * can bounce them back after a successful sign-in.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
        <div className="border-border bg-surface/70 text-muted-foreground rounded-lg border px-5 py-4 text-sm">
          Checking your session…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
