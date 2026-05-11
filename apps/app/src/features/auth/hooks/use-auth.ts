import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/query-client';

import {
  forgotPassword,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResendVerificationInput,
  type ResetPasswordInput,
  type VerifyEmailInput,
} from '../api/auth-api';
import { useAuthStore } from '../model/auth-store';

export const authSessionQueryKey = ['auth', 'session'] as const;

export function useAuth() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (auth) => {
      setAuthenticated(auth);
      queryClient.setQueryData(authSessionQueryKey, auth);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => register(input),
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      setUnauthenticated();
      queryClient.removeQueries({ queryKey: authSessionQueryKey });
    },
  });

  return {
    status,
    user,
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated' && Boolean(user),
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    signOut: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isSigningOut: logoutMutation.isPending,
  };
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => forgotPassword(input),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => resetPassword(input),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (input: VerifyEmailInput) => verifyEmail(input),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (input: ResendVerificationInput) => resendVerification(input),
  });
}
