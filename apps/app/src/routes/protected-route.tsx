import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/use-auth';

/**
 * Wraps protected routes. Unauthenticated users are sent to /login with the
 * intended destination preserved in `location.state.from` so the login page
 * can bounce them back after a successful sign-in.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
