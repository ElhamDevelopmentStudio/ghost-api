import { describe, expect, it } from 'vitest';
import type { NormalizedEndpoint } from '@ghostapi/types';
import { buildMockRouter } from './index.js';

const endpoint: NormalizedEndpoint = {
  id: 'GET /users',
  method: 'GET',
  path: '/users',
  group: 'users',
  parameters: [],
  authRequired: false,
  responses: [
    {
      status: 200,
      contentType: 'application/json',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
          },
        },
      },
    },
  ],
};

describe('buildMockRouter', () => {
  it('serves a generated 200 response', async () => {
    const app = buildMockRouter([
      {
        endpoint,
        config: { latencyMs: 0, statusCode: null, authRequired: false, errorChance: 0 },
        seed: 'fixed',
      },
    ]);
    const res = await app.request('/users');
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<{ id: string; email: string }>;
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]?.email).toMatch(/@/);
  });

  it('returns 401 when auth is required and missing', async () => {
    const app = buildMockRouter([
      {
        endpoint,
        config: { latencyMs: 0, statusCode: null, authRequired: true, errorChance: 0 },
      },
    ]);
    const res = await app.request('/users');
    expect(res.status).toBe(401);
  });

  it('forces a randomized error when errorChance is 1', async () => {
    const app = buildMockRouter(
      [
        {
          endpoint,
          config: { latencyMs: 0, statusCode: null, authRequired: false, errorChance: 1 },
        },
      ],
      { random: () => 0 },
    );
    const res = await app.request('/users');
    expect([400, 401, 403, 429, 500]).toContain(res.status);
  });

  it('returns saved body verbatim when provided', async () => {
    const app = buildMockRouter([
      {
        endpoint,
        config: { latencyMs: 0, statusCode: null, authRequired: false, errorChance: 0 },
        savedBody: [{ id: 'x', email: 'a@b.c' }],
      },
    ]);
    const res = await app.request('/users');
    expect(await res.json()).toEqual([{ id: 'x', email: 'a@b.c' }]);
  });

  it('mounts HEAD endpoints without a response body', async () => {
    const app = buildMockRouter([
      {
        endpoint: {
          ...endpoint,
          id: 'HEAD /users/{id}',
          method: 'HEAD',
          path: '/users/{id}',
          responses: [{ status: 204, contentType: 'application/json' }],
        },
        config: { latencyMs: 0, statusCode: null, authRequired: false, errorChance: 0 },
        savedBody: { should: 'not be sent' },
      },
    ]);

    const res = await app.request('/users/123', { method: 'HEAD' });

    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
  });

  it('mounts OPTIONS endpoints with generated responses', async () => {
    const app = buildMockRouter([
      {
        endpoint: {
          ...endpoint,
          id: 'OPTIONS /users',
          method: 'OPTIONS',
          responses: [
            {
              status: 200,
              contentType: 'application/json',
              schema: {
                type: 'object',
                properties: {
                  methods: {
                    type: 'array',
                    items: { type: 'string', enum: ['GET'] },
                  },
                },
              },
            },
          ],
        },
        config: { latencyMs: 0, statusCode: null, authRequired: false, errorChance: 0 },
      },
    ]);

    const res = await app.request('/users', { method: 'OPTIONS' });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ methods: ['GET', 'GET', 'GET'] });
  });
});
