// Re-export auth schemas from @ghostapi/types with OpenAPI registration so the
// docs route picks them up. Importing `z` from `@hono/zod-openapi` triggers the
// prototype patch that makes `.openapi()` available on every zod schema.
import 'zod';
import '@hono/zod-openapi';

import {
  authResponseSchema as sharedAuthResponseSchema,
  authSessionSchema as sharedAuthSessionSchema,
  authUserSchema as sharedAuthUserSchema,
  csrfHeaderSchema as sharedCsrfHeaderSchema,
  forgotPasswordBodySchema as sharedForgotPasswordBodySchema,
  forgotPasswordResponseSchema as sharedForgotPasswordResponseSchema,
  loginBodySchema as sharedLoginBodySchema,
  logoutAllResponseSchema as sharedLogoutAllResponseSchema,
  projectInvitationContextResponseSchema as sharedProjectInvitationContextResponseSchema,
  acceptProjectInvitationResponseSchema as sharedAcceptProjectInvitationResponseSchema,
  registerBodySchema as sharedRegisterBodySchema,
  registerResponseSchema as sharedRegisterResponseSchema,
  resendVerificationBodySchema as sharedResendVerificationBodySchema,
  resendVerificationResponseSchema as sharedResendVerificationResponseSchema,
  resetPasswordBodySchema as sharedResetPasswordBodySchema,
  successSchema as sharedSuccessSchema,
  errorResponseSchema as sharedErrorResponseSchema,
  csrfResponseSchema as sharedCsrfResponseSchema,
  verifyEmailBodySchema as sharedVerifyEmailBodySchema,
} from '@ghostapi/types';

import { CSRF_HEADER } from './auth.constants.js';

export const userSchema = sharedAuthUserSchema.openapi('AuthUser');
export const sessionSchema = sharedAuthSessionSchema.openapi('AuthSession');
export const authResponseSchema = sharedAuthResponseSchema.openapi('AuthResponse');
export const registerResponseSchema = sharedRegisterResponseSchema.openapi('RegisterResponse');

export const csrfResponseSchema = sharedCsrfResponseSchema
  .describe(`Send this value in the ${CSRF_HEADER} header for mutating auth requests.`)
  .openapi('CsrfResponse');

export const errorResponseSchema = sharedErrorResponseSchema.openapi('ErrorResponse');

export const registerBodySchema = sharedRegisterBodySchema.openapi('RegisterRequest');
export const loginBodySchema = sharedLoginBodySchema.openapi('LoginRequest');
export const forgotPasswordBodySchema =
  sharedForgotPasswordBodySchema.openapi('ForgotPasswordRequest');
export const resetPasswordBodySchema =
  sharedResetPasswordBodySchema.openapi('ResetPasswordRequest');
export const verifyEmailBodySchema = sharedVerifyEmailBodySchema.openapi('VerifyEmailRequest');
export const resendVerificationBodySchema = sharedResendVerificationBodySchema.openapi(
  'ResendVerificationRequest',
);
export const resendVerificationResponseSchema = sharedResendVerificationResponseSchema.openapi(
  'ResendVerificationResponse',
);
export const successSchema = sharedSuccessSchema.openapi('SuccessResponse');
export const logoutAllResponseSchema = sharedLogoutAllResponseSchema.openapi('LogoutAllResponse');
export const forgotPasswordResponseSchema =
  sharedForgotPasswordResponseSchema.openapi('ForgotPasswordResponse');
export const projectInvitationContextResponseSchema =
  sharedProjectInvitationContextResponseSchema.openapi('ProjectInvitationContextResponse');
export const acceptProjectInvitationResponseSchema =
  sharedAcceptProjectInvitationResponseSchema.openapi('AcceptProjectInvitationResponse');

export const csrfHeaderSchema = sharedCsrfHeaderSchema;
