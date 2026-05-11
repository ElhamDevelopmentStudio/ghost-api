import { beforeEach, describe, expect, it } from 'vitest';

import { clearRateLimitBuckets } from './features/auth/auth.rate-limit.js';

beforeEach(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://ghostapi:ghostapi@localhost:5432/ghostapi';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-32';
  process.env.CORS_ORIGINS = 'http://localhost:3002';
  clearRateLimitBuckets();
});

describe('auth backend surface', () => {
  it('issues a CSRF token and matching double-submit cookie', async () => {
    const { createApp } = await import('./server/app.js');
    const app = createApp();
    const response = await app.request('/auth/csrf', {
      headers: { Origin: 'http://localhost:3002' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:3002');
    expect(response.headers.get('access-control-allow-credentials')).toBe('true');

    const body = (await response.json()) as { csrfToken: string };
    expect(body.csrfToken.length).toBeGreaterThanOrEqual(32);
    expect(response.headers.get('set-cookie')).toContain(`ghostapi_csrf=${body.csrfToken}`);
  });

  it('rejects mutating auth requests without a CSRF header before touching credentials', async () => {
    const { createApp } = await import('./server/app.js');
    const app = createApp();
    const response = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dev@example.com', password: 'password123' }),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: { message: 'Invalid CSRF token' },
    });
  });

  it('protects project routes with backend session auth', async () => {
    const { createApp } = await import('./server/app.js');
    const app = createApp();
    const response = await app.request('/projects');

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: { message: 'Unauthorized' },
    });
  });

  it('serves Scalar-backed OpenAPI metadata with documented auth endpoints', async () => {
    const { createApp } = await import('./server/app.js');
    const app = createApp();
    const response = await app.request('/openapi.json');
    const body = (await response.json()) as {
      openapi: string;
      paths: Record<string, unknown>;
      components?: { securitySchemes?: Record<string, unknown> };
    };

    expect(response.status).toBe(200);
    expect(body.openapi).toBe('3.1.0');
    expect(body.paths['/auth/register']).toBeTruthy();
    expect(body.paths['/auth/login']).toBeTruthy();
    expect(body.paths['/auth/refresh']).toBeTruthy();
    expect(body.paths['/auth/me']).toBeTruthy();
    expect(body.components?.securitySchemes?.accessCookie).toBeTruthy();
    expect(body.components?.securitySchemes?.csrfHeader).toBeTruthy();
  });

  it('does not document confidential auth tokens in frontend-facing responses', async () => {
    const { createApp } = await import('./server/app.js');
    const app = createApp();
    const response = await app.request('/openapi.json');
    const body = (await response.json()) as {
      components?: {
        schemas?: Record<
          string,
          {
            properties?: Record<string, unknown>;
          }
        >;
      };
    };

    expect(response.status).toBe(200);
    expect(body.components?.schemas?.RegisterResponse?.properties).not.toHaveProperty(
      'verificationToken',
    );
    expect(body.components?.schemas?.ResendVerificationResponse?.properties).not.toHaveProperty(
      'verificationToken',
    );
    expect(body.components?.schemas?.ForgotPasswordResponse?.properties).not.toHaveProperty(
      'resetToken',
    );
  });
});
