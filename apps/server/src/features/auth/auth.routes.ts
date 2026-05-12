import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { env } from '../../env.js';
import type { AppEnv } from '../../server/types.js';
import {
  clearAuthCookies,
  ensureCsrfCookie,
  readRefreshCookie,
  setAuthCookies,
} from './auth.cookies.js';
import { authContext, requireAuth, requireCsrf } from './auth.middleware.js';
import { clientIp, rateLimit } from './auth.rate-limit.js';
import {
  authResponseSchema,
  csrfHeaderSchema,
  csrfResponseSchema,
  errorResponseSchema,
  forgotPasswordBodySchema,
  forgotPasswordResponseSchema,
  loginBodySchema,
  logoutAllResponseSchema,
  registerBodySchema,
  registerResponseSchema,
  resendVerificationBodySchema,
  resendVerificationResponseSchema,
  resetPasswordBodySchema,
  successSchema,
  verifyEmailBodySchema,
} from './auth.schemas.js';
import {
  EmailDeliveryError,
  ensureEmailDeliveryConfigured,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from './auth.email.js';
import {
  AuthError,
  createEmailVerification,
  createPasswordReset,
  currentSession,
  login,
  refreshSession,
  register,
  resetPassword,
  revokeAllSessions,
  revokeSession,
  verifyEmail,
} from './auth.service.js';

export const authRouter = new OpenAPIHono<AppEnv>();

authRouter.openapi(
  createRoute({
    method: 'get',
    path: '/csrf',
    tags: ['Authentication'],
    summary: 'Issue a CSRF token',
    description:
      'Creates a readable CSRF cookie and returns the same token. Mutating auth requests must echo this value in the x-csrf-token header.',
    responses: {
      200: {
        description: 'CSRF token issued.',
        content: { 'application/json': { schema: csrfResponseSchema } },
      },
    },
  }),
  (c) => c.json({ csrfToken: ensureCsrfCookie(c) }, 200),
);

authRouter.openapi(
  createRoute({
    method: 'post',
    path: '/register',
    tags: ['Authentication'],
    summary: 'Register a user and send an email verification link',
    middleware: [rateLimit('auth:register'), requireCsrf] as const,
    request: {
      headers: csrfHeaderSchema,
      body: {
        required: true,
        content: { 'application/json': { schema: registerBodySchema } },
      },
    },
    responses: {
      201: {
        description: 'User created and verification email sent.',
        content: { 'application/json': { schema: registerResponseSchema } },
      },
      409: {
        description: 'Email already registered.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
      503: {
        description: 'Verification email delivery failed.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    },
  }),
  async (c) => {
    try {
      ensureEmailDeliveryConfigured();
      const result = await register({
        ...c.req.valid('json'),
        userAgent: c.req.header('user-agent'),
        ipAddress: clientIp(c.req.raw.headers),
      });
      ensureCsrfCookie(c);
      await sendVerificationEmail({
        to: result.user.email,
        name: result.user.name,
        verificationUrl: verificationUrl(result.verificationToken),
      });
      return c.json({ success: true as const, user: result.user }, 201);
    } catch (err) {
      if (err instanceof AuthError) {
        return c.json({ success: false as const, error: { message: err.message } }, 409);
      }
      if (err instanceof EmailDeliveryError) {
        return c.json({ success: false as const, error: { message: err.message } }, 503);
      }
      throw err;
    }
  },
);

authRouter.openapi(
  createRoute({
    method: 'post',
    path: '/resend-verification',
    tags: ['Authentication'],
    summary: 'Send a fresh email verification link',
    middleware: [rateLimit('auth:resend-verification'), requireCsrf] as const,
    request: {
      headers: csrfHeaderSchema,
      body: {
        required: true,
        content: { 'application/json': { schema: resendVerificationBodySchema } },
      },
    },
    responses: {
      200: {
        description:
          'Returns success regardless of whether the account exists or is already verified.',
        content: { 'application/json': { schema: resendVerificationResponseSchema } },
      },
      503: {
        description: 'Verification email delivery failed.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    },
  }),
  async (c) => {
    try {
      ensureEmailDeliveryConfigured();
      const result = await createEmailVerification(c.req.valid('json').email);
      if (result.verificationToken) {
        await sendVerificationEmail({
          to: result.email,
          name: result.name,
          verificationUrl: verificationUrl(result.verificationToken),
        });
      }

      return c.json({ success: true as const }, 200);
    } catch (err) {
      if (err instanceof EmailDeliveryError) {
        return c.json({ success: false as const, error: { message: err.message } }, 503);
      }
      throw err;
    }
  },
);

authRouter.openapi(
  createRoute({
    method: 'post',
    path: '/login',
    tags: ['Authentication'],
    summary: 'Create a session for valid credentials',
    middleware: [rateLimit('auth:login'), requireCsrf] as const,
    request: {
      headers: csrfHeaderSchema,
      body: {
        required: true,
        content: { 'application/json': { schema: loginBodySchema } },
      },
    },
    responses: {
      200: {
        description: 'Session, access cookie, and refresh cookie created.',
        content: { 'application/json': { schema: authResponseSchema } },
      },
      401: {
        description: 'Invalid credentials.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
      403: {
        description: 'Email is not verified.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    },
  }),
  async (c) => {
    try {
      const result = await login({
        ...c.req.valid('json'),
        userAgent: c.req.header('user-agent'),
        ipAddress: clientIp(c.req.raw.headers),
      });
      setAuthCookies(c, result);
      ensureCsrfCookie(c);
      return c.json({ success: true as const, user: result.user, session: result.session }, 200);
    } catch (err) {
      if (err instanceof AuthError) {
        const status = err.status === 403 ? 403 : 401;
        return c.json({ success: false as const, error: { message: err.message } }, status);
      }
      throw err;
    }
  },
);

authRouter.openapi(
  createRoute({
    method: 'post',
    path: '/verify-email',
    tags: ['Authentication'],
    summary: 'Verify an email address with a valid verification token',
    middleware: [requireCsrf] as const,
    request: {
      headers: csrfHeaderSchema,
      body: {
        required: true,
        content: { 'application/json': { schema: verifyEmailBodySchema } },
      },
    },
    responses: {
      200: {
        description: 'Email address verified.',
        content: { 'application/json': { schema: successSchema } },
      },
      400: {
        description: 'Invalid or expired verification token.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    },
  }),
  async (c) => {
    try {
      await verifyEmail(c.req.valid('json').token);
      return c.json({ success: true as const }, 200);
    } catch (err) {
      if (err instanceof AuthError) {
        return c.json({ success: false as const, error: { message: err.message } }, 400);
      }
      throw err;
    }
  },
);

authRouter.openapi(
  createRoute({
    method: 'post',
    path: '/refresh',
    tags: ['Authentication'],
    summary: 'Rotate the refresh token and issue a fresh access token',
    middleware: [rateLimit('auth:refresh'), requireCsrf] as const,
    request: { headers: csrfHeaderSchema },
    responses: {
      200: {
        description: 'Session refreshed and cookies rotated.',
        content: { 'application/json': { schema: authResponseSchema } },
      },
      401: {
        description: 'Missing or invalid refresh cookie.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    },
  }),
  async (c) => {
    try {
      const refreshToken = readRefreshCookie(c);
      if (!refreshToken) throw new AuthError(401, 'Invalid session');
      const result = await refreshSession(refreshToken);
      setAuthCookies(c, result);
      ensureCsrfCookie(c);
      return c.json({ success: true as const, user: result.user, session: result.session }, 200);
    } catch (err) {
      clearAuthCookies(c);
      if (err instanceof AuthError) {
        return c.json({ success: false as const, error: { message: err.message } }, 401);
      }
      throw err;
    }
  },
);

function verificationUrl(token: string): string {
  const url = new URL(`/verify-email/${token}`, env().APP_URL);
  return url.toString();
}

function resetPasswordUrl(token: string): string {
  const url = new URL(`/reset-password/${token}`, env().APP_URL);
  return url.toString();
}

authRouter.openapi(
  createRoute({
    method: 'get',
    path: '/me',
    tags: ['Authentication'],
    summary: 'Fetch the authenticated user and active session',
    middleware: [requireAuth] as const,
    responses: {
      200: {
        description: 'Authenticated user and active session.',
        content: { 'application/json': { schema: authResponseSchema } },
      },
      401: {
        description: 'Missing, expired, or revoked session.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    },
  }),
  async (c) => {
    const result = await currentSession(authContext(c));
    return c.json({ success: true as const, user: result.user, session: result.session }, 200);
  },
);

authRouter.openapi(
  createRoute({
    method: 'post',
    path: '/logout',
    tags: ['Authentication'],
    summary: 'Revoke the current session and clear auth cookies',
    middleware: [requireAuth, requireCsrf] as const,
    request: { headers: csrfHeaderSchema },
    responses: {
      200: {
        description: 'Current session revoked.',
        content: { 'application/json': { schema: successSchema } },
      },
      401: {
        description: 'Missing, expired, or revoked session.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    },
  }),
  async (c) => {
    await revokeSession(authContext(c));
    clearAuthCookies(c);
    return c.json({ success: true as const }, 200);
  },
);

authRouter.openapi(
  createRoute({
    method: 'post',
    path: '/logout-all',
    tags: ['Authentication'],
    summary: 'Revoke all sessions for the current user',
    middleware: [requireAuth, requireCsrf] as const,
    request: { headers: csrfHeaderSchema },
    responses: {
      200: {
        description: 'All sessions for this user revoked.',
        content: {
          'application/json': {
            schema: logoutAllResponseSchema,
          },
        },
      },
      401: {
        description: 'Missing, expired, or revoked session.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    },
  }),
  async (c) => {
    const revokedSessions = await revokeAllSessions(authContext(c).userId);
    clearAuthCookies(c);
    return c.json({ success: true as const, revokedSessions }, 200);
  },
);

authRouter.openapi(
  createRoute({
    method: 'post',
    path: '/forgot-password',
    tags: ['Authentication'],
    summary: 'Send password reset instructions',
    middleware: [rateLimit('auth:forgot-password'), requireCsrf] as const,
    request: {
      headers: csrfHeaderSchema,
      body: {
        required: true,
        content: { 'application/json': { schema: forgotPasswordBodySchema } },
      },
    },
    responses: {
      200: {
        description:
          'Returns success regardless of whether the email exists. Sends reset instructions when the account exists.',
        content: { 'application/json': { schema: forgotPasswordResponseSchema } },
      },
      503: {
        description: 'Password reset email delivery failed.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    },
  }),
  async (c) => {
    try {
      ensureEmailDeliveryConfigured();
      const result = await createPasswordReset(c.req.valid('json').email);
      if (result.resetToken) {
        await sendPasswordResetEmail({
          to: result.email,
          name: result.name,
          resetUrl: resetPasswordUrl(result.resetToken),
        });
      }
      return c.json({ success: true as const }, 200);
    } catch (err) {
      if (err instanceof EmailDeliveryError) {
        return c.json({ success: false as const, error: { message: err.message } }, 503);
      }
      throw err;
    }
  },
);

authRouter.openapi(
  createRoute({
    method: 'post',
    path: '/reset-password',
    tags: ['Authentication'],
    summary: 'Reset a password with a valid reset token',
    middleware: [requireCsrf] as const,
    request: {
      headers: csrfHeaderSchema,
      body: {
        required: true,
        content: { 'application/json': { schema: resetPasswordBodySchema } },
      },
    },
    responses: {
      200: {
        description: 'Password updated and existing sessions revoked.',
        content: { 'application/json': { schema: successSchema } },
      },
      400: {
        description: 'Invalid or expired reset token.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    },
  }),
  async (c) => {
    try {
      await resetPassword(c.req.valid('json'));
      clearAuthCookies(c);
      return c.json({ success: true as const }, 200);
    } catch (err) {
      if (err instanceof AuthError) {
        return c.json({ success: false as const, error: { message: err.message } }, 400);
      }
      throw err;
    }
  },
);
