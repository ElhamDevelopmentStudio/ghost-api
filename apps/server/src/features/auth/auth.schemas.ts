import { z } from '@hono/zod-openapi';

import { CSRF_HEADER } from './auth.constants.js';

export const userSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '4c21fd53-4e38-4a0e-856b-82aa8361825f' }),
    email: z.string().email().openapi({ example: 'dev@example.com' }),
    name: z.string().nullable().openapi({ example: 'Ada Developer' }),
    emailVerifiedAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime().openapi({ example: '2026-05-11T10:00:00.000Z' }),
  })
  .openapi('AuthUser');

export const sessionSchema = z
  .object({
    id: z.string().uuid().openapi({ example: 'c1f65e31-1c2f-4d8a-b162-bbaab2fb75c3' }),
    expiresAt: z.string().datetime(),
    createdAt: z.string().datetime(),
    lastUsedAt: z.string().datetime(),
  })
  .openapi('AuthSession');

export const authResponseSchema = z
  .object({
    success: z.literal(true),
    user: userSchema,
    session: sessionSchema,
  })
  .openapi('AuthResponse');

export const registerResponseSchema = z
  .object({
    success: z.literal(true),
    user: userSchema,
  })
  .openapi('RegisterResponse');

export const csrfResponseSchema = z
  .object({
    csrfToken: z
      .string()
      .min(32)
      .openapi({
        description: `Send this value in the ${CSRF_HEADER} header for mutating auth requests.`,
      }),
  })
  .openapi('CsrfResponse');

export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      message: z.string().openapi({ example: 'Unauthorized' }),
    }),
  })
  .openapi('ErrorResponse');

export const registerBodySchema = z
  .object({
    name: z.string().min(1).max(120).optional().openapi({ example: 'Ada Developer' }),
    email: z.string().email().openapi({ example: 'dev@example.com' }),
    password: z.string().min(8).max(200).openapi({ example: 'correct-horse-battery-staple' }),
  })
  .openapi('RegisterRequest');

export const loginBodySchema = z
  .object({
    email: z.string().email().openapi({ example: 'dev@example.com' }),
    password: z.string().min(1).max(200).openapi({ example: 'correct-horse-battery-staple' }),
  })
  .openapi('LoginRequest');

export const forgotPasswordBodySchema = z
  .object({
    email: z.string().email().openapi({ example: 'dev@example.com' }),
  })
  .openapi('ForgotPasswordRequest');

export const resetPasswordBodySchema = z
  .object({
    token: z.string().min(32),
    password: z.string().min(8).max(200).openapi({ example: 'new-correct-horse-battery-staple' }),
  })
  .openapi('ResetPasswordRequest');

export const verifyEmailBodySchema = z
  .object({
    token: z.string().min(32),
  })
  .openapi('VerifyEmailRequest');

export const resendVerificationBodySchema = z
  .object({
    email: z.string().email().openapi({ example: 'dev@example.com' }),
  })
  .openapi('ResendVerificationRequest');

export const resendVerificationResponseSchema = z
  .object({
    success: z.literal(true),
  })
  .openapi('ResendVerificationResponse');

export const successSchema = z.object({ success: z.literal(true) }).openapi('SuccessResponse');

export const logoutAllResponseSchema = successSchema
  .extend({
    revokedSessions: z.number().int().min(0),
  })
  .openapi('LogoutAllResponse');

export const forgotPasswordResponseSchema = z
  .object({
    success: z.literal(true),
  })
  .openapi('ForgotPasswordResponse');

export const csrfHeaderSchema = z.object({
  [CSRF_HEADER]: z
    .string()
    .min(32)
    .openapi({ description: 'Double-submit CSRF token returned by GET /auth/csrf.' }),
});
