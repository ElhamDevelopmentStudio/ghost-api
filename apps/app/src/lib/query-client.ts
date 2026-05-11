import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api-client';

/**
 * App-wide TanStack Query client.
 *
 * - retry: don't retry on 4xx — those are caller errors and won't fix themselves.
 * - refetchOnWindowFocus: off; this is a developer tool, not a feed. Refetch
 *   intentionally via `invalidateQueries` after mutations.
 * - staleTime: 30s default so navigating between pages doesn't trigger immediate
 *   refetches; per-query overrides for hot data.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
});
