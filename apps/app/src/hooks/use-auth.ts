import { useAuthStore } from '@/stores/auth-store';

/** Convenience selector hook so components don't import the store directly. */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  return {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    signIn,
    signOut,
  };
}
