import {
  CSRF_HEADER,
  type AuthResponse,
  type CsrfResponse,
  type ForgotPasswordInput,
  type ForgotPasswordResponse,
  type LoginInput,
  type LogoutAllResponse,
  type RegisterInput,
  type RegisterResponse,
  type ResendVerificationInput,
  type ResendVerificationResponse,
  type ResetPasswordInput,
  type SuccessResponse,
  type VerifyEmailInput,
} from '@ghostapi/types';

import { ApiError, apiRequest } from '@/lib/api-client';
let csrfTokenPromise: Promise<string> | null = null;

export async function getCsrfToken(): Promise<string> {
  csrfTokenPromise ??= apiRequest<CsrfResponse>({ path: '/auth/csrf' })
    .then((response) => response.csrfToken)
    .finally(() => {
      csrfTokenPromise = null;
    });

  return csrfTokenPromise;
}

export async function register(input: RegisterInput): Promise<RegisterResponse> {
  return mutatingAuthRequest<RegisterResponse>('/auth/register', input, 'POST');
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  return mutatingAuthRequest<AuthResponse>('/auth/login', input, 'POST');
}

export async function refreshSession(): Promise<AuthResponse> {
  return mutatingAuthRequest<AuthResponse>('/auth/refresh', undefined, 'POST');
}

export async function getCurrentSession(): Promise<AuthResponse> {
  try {
    return await apiRequest<AuthResponse>({ path: '/auth/me' });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await refreshSession();
      return apiRequest<AuthResponse>({ path: '/auth/me' });
    }
    throw error;
  }
}

export async function logout(): Promise<SuccessResponse> {
  return mutatingAuthRequest<SuccessResponse>('/auth/logout', undefined, 'POST');
}

export async function logoutAll(): Promise<LogoutAllResponse> {
  return mutatingAuthRequest<LogoutAllResponse>('/auth/logout-all', undefined, 'POST');
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
  return mutatingAuthRequest<ForgotPasswordResponse>('/auth/forgot-password', input, 'POST');
}

export async function resetPassword(input: ResetPasswordInput): Promise<SuccessResponse> {
  return mutatingAuthRequest<SuccessResponse>('/auth/reset-password', input, 'POST');
}

export async function verifyEmail(input: VerifyEmailInput): Promise<SuccessResponse> {
  return mutatingAuthRequest<SuccessResponse>('/auth/verify-email', input, 'POST');
}

export async function resendVerification(
  input: ResendVerificationInput,
): Promise<ResendVerificationResponse> {
  return mutatingAuthRequest<ResendVerificationResponse>(
    '/auth/resend-verification',
    input,
    'POST',
  );
}

async function mutatingAuthRequest<T>(path: string, body: unknown, method: 'POST'): Promise<T> {
  const csrfToken = await getCsrfToken();
  return apiRequest<T>({
    path,
    method,
    body,
    headers: {
      [CSRF_HEADER]: csrfToken,
    },
  });
}
