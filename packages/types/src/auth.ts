import { z } from 'zod';

import { successSchema } from './common.js';

export const CSRF_HEADER = 'x-csrf-token';

export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  emailVerifiedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const authSessionSchema = z.object({
  id: z.string().uuid(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime(),
});
export type AuthSession = z.infer<typeof authSessionSchema>;

export const authResponseSchema = z.object({
  success: z.literal(true),
  user: authUserSchema,
  session: authSessionSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export const registerResponseSchema = z.object({
  success: z.literal(true),
  user: authUserSchema,
});
export type RegisterResponse = z.infer<typeof registerResponseSchema>;

export const registerBodySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});
export type RegisterInput = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof loginBodySchema>;

export const forgotPasswordBodySchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordBodySchema>;

export const forgotPasswordResponseSchema = successSchema;
export type ForgotPasswordResponse = z.infer<typeof forgotPasswordResponseSchema>;

export const resetPasswordBodySchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8).max(200),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>;

export const verifyEmailBodySchema = z.object({
  token: z.string().min(32),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailBodySchema>;

export const resendVerificationBodySchema = z.object({
  email: z.string().email(),
});
export type ResendVerificationInput = z.infer<typeof resendVerificationBodySchema>;

export const resendVerificationResponseSchema = successSchema;
export type ResendVerificationResponse = z.infer<typeof resendVerificationResponseSchema>;

export const logoutAllResponseSchema = successSchema.extend({
  revokedSessions: z.number().int().min(0),
});
export type LogoutAllResponse = z.infer<typeof logoutAllResponseSchema>;

export const csrfHeaderSchema = z.object({
  [CSRF_HEADER]: z.string().min(32),
});

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
