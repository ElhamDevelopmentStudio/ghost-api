import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCurrentSession } from '../api/auth-api';
import { authSessionQueryKey } from '../hooks/use-auth';
import { useAuthStore } from '../model/auth-store';

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const setLoading = useAuthStore((state) => state.setLoading);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  const sessionQuery = useQuery({
    queryKey: authSessionQueryKey,
    queryFn: getCurrentSession,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (sessionQuery.isPending) {
      setLoading();
      return;
    }

    if (sessionQuery.data) {
      setAuthenticated(sessionQuery.data);
      return;
    }

    if (sessionQuery.isError) {
      setUnauthenticated();
    }
  }, [
    sessionQuery.data,
    sessionQuery.isError,
    sessionQuery.isPending,
    setAuthenticated,
    setLoading,
    setUnauthenticated,
  ]);

  return children;
}
