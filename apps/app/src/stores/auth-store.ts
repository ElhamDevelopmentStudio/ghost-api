import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Auth state stub. Real session wiring (token refresh, /me bootstrapping)
 * lands when the auth API is built — this just gives the router something to
 * key its protected/public branching off of.
 */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: () => boolean;
  signIn: (user: AuthUser, token: string) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: () => Boolean(get().token && get().user),
      signIn: (user, token) => set({ user, token }),
      signOut: () => set({ user: null, token: null }),
    }),
    {
      name: 'ghostapi.auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
