import { beforeEach, describe, expect, it } from 'vitest';

beforeEach(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://ghostapi:ghostapi@localhost:5432/ghostapi';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-32';
  process.env.CORS_ORIGINS = 'http://localhost:3000,http://localhost:3002';
  process.env.MAIL_USERNAME = 'resend';
  process.env.MAIL_PASSWORD = '';
  process.env.MAIL_FROM = 'noreply@example.com';
  process.env.R2_ACCOUNT_ID = 'test-account';
  process.env.R2_ACCESS_KEY_ID = 'test-access-key';
  process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
  process.env.R2_BUCKET = 'ghostapi-test';
  process.env.R2_REGION = 'auto';
  process.env.R2_ENDPOINT_URL = 'https://test.r2.cloudflarestorage.com';
});

describe('GET /mock/demo — canned docs playground fixture', () => {
  it('returns the seeded user list without touching the database', async () => {
    const { createApp } = await import('../server/app.js');
    const app = createApp();
    const response = await app.request('/mock/demo/users');

    expect(response.status).toBe(200);
    const body = (await response.json()) as Array<{ id: number; name: string }>;
    expect(body).toHaveLength(3);
    expect(body[0]).toMatchObject({ id: 1, name: 'Ada Lovelace' });
  });

  it('returns a single user by id and 404 for unknown ids', async () => {
    const { createApp } = await import('../server/app.js');
    const app = createApp();

    const hit = await app.request('/mock/demo/users/2');
    expect(hit.status).toBe(200);
    await expect(hit.json()).resolves.toMatchObject({ id: 2, name: 'Alan Turing' });

    const miss = await app.request('/mock/demo/users/999');
    expect(miss.status).toBe(404);
  });

  it('delays the response by approximately the requested _latency', async () => {
    const { createApp } = await import('../server/app.js');
    const app = createApp();

    const started = Date.now();
    const response = await app.request('/mock/demo/users/1?_latency=150');
    const elapsed = Date.now() - started;

    expect(response.status).toBe(200);
    expect(elapsed).toBeGreaterThanOrEqual(140);
  });

  it('always returns 500 when _error=1', async () => {
    const { createApp } = await import('../server/app.js');
    const app = createApp();
    const response = await app.request('/mock/demo/users/1?_error=1');

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({ simulated: true });
  });

  it('returns 401 when _auth=1 and no authorization header is sent', async () => {
    const { createApp } = await import('../server/app.js');
    const app = createApp();
    const response = await app.request('/mock/demo/users/1?_auth=1');

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ simulated: true });
  });

  it('returns 200 when _auth=1 and a valid bearer token is sent', async () => {
    const { createApp } = await import('../server/app.js');
    const app = createApp();
    const response = await app.request('/mock/demo/users/1?_auth=1', {
      headers: { Authorization: 'Bearer demo' },
    });

    expect(response.status).toBe(200);
  });
});

describe('POST /mock/demo/users — canned echo create', () => {
  it('echoes the submitted user with a fresh id', async () => {
    const { createApp } = await import('../server/app.js');
    const app = createApp();
    const response = await app.request('/mock/demo/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hedy Lamarr', email: 'hedy@example.com', role: 'editor' }),
    });

    expect(response.status).toBe(201);
    const body = (await response.json()) as { id: number; name: string; role: string };
    expect(body).toMatchObject({ name: 'Hedy Lamarr', role: 'editor' });
    expect(body.id).toBeGreaterThan(3);
  });
});

describe('DELETE /mock/demo/users/:id', () => {
  it('responds with 204 and no body', async () => {
    const { createApp } = await import('../server/app.js');
    const app = createApp();
    const response = await app.request('/mock/demo/users/1', { method: 'DELETE' });

    expect(response.status).toBe(204);
  });
});
