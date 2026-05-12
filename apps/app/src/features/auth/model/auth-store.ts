import { create } from 'zustand';

import type { AuthResponse, AuthSession, AuthStatus, AuthUser } from '@ghostapi/types';

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  session: AuthSession | null;
  setLoading: () => void;
  setAuthenticated: (auth: AuthResponse) => void;
  setUnauthenticated: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  user: null,
  session: null,
  setLoading: () => set({ status: 'loading' }),
  setAuthenticated: (auth) =>
    set({
      status: 'authenticated',
      user: auth.user,
      session: auth.session,
    }),
  setUnauthenticated: () =>
    set({
      status: 'unauthenticated',
      user: null,
      session: null,
    }),
}));
