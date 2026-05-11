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
  resetPasswordBodySchema,
  successSchema,
} from './auth.schemas.js';
import {
  AuthError,
  createPasswordReset,
  currentSession,
  login,
  refreshSession,
  register,
  resetPassword,
  revokeAllSessions,
  revokeSession,
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
    summary: 'Register a user and create the initial session',
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
        description: 'User, session, access cookie, and refresh cookie created.',
        content: { 'application/json': { schema: authResponseSchema } },
      },
      409: {
        description: 'Email already registered.',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    },
  }),
  async (c) => {
    try {
      const result = await register({
        ...c.req.valid('json'),
        userAgent: c.req.header('user-agent'),
        ipAddress: clientIp(c.req.raw.headers),
      });
      setAuthCookies(c, result);
      ensureCsrfCookie(c);
      return c.json({ success: true as const, user: result.user, session: result.session }, 201);
    } catch (err) {
      if (err instanceof AuthError) {
        return c.json({ success: false as const, error: { message: err.message } }, 409);
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
        return c.json({ success: false as const, error: { message: err.message } }, 401);
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
    summary: 'Create a password reset token',
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
          'Returns success regardless of whether the email exists. Development and test responses include the reset token.',
        content: { 'application/json': { schema: forgotPasswordResponseSchema } },
      },
    },
  }),
  async (c) => {
    const { resetToken } = await createPasswordReset(c.req.valid('json').email);
    return c.json(
      {
        success: true as const,
        ...(env().NODE_ENV === 'production' ? {} : { resetToken }),
      },
      200,
    );
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
