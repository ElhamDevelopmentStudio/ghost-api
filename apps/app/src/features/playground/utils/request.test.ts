import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ProjectEndpoint } from '@ghostapi/types';

import {
  executePlaygroundRequest,
  endpointRequestDraft,
  requestContentTypesForEndpoint,
  requestHeadersForContentType,
  sampleRequestBodyText,
} from './request';
import type { RequestDraft } from '../types';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('request body media types', () => {
  it('lists schema request content types without duplicates', () => {
    expect(requestContentTypesForEndpoint(endpoint())).toEqual([
      'application/json',
      'application/x-www-form-urlencoded',
      'text/plain',
    ]);
  });

  it('builds starter bodies for the selected media type', () => {
    expect(sampleRequestBodyText(endpoint(), 'application/x-www-form-urlencoded')).toBe(
      'email=user%40example.com&password=sample-password',
    );
    expect(sampleRequestBodyText(endpoint(), 'text/plain')).toBe('raw-token');
  });

  it('stores the selected request content type in the draft and header', () => {
    const draft = endpointRequestDraft(endpoint(), 'http://localhost:3001/mock/project');

    expect(draft.bodyContentType).toBe('application/json');
    expect(draft.headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'Content-Type', value: 'application/json', enabled: true }),
      ]),
    );
    expect(draft.bodyByContentType['application/json']).toContain('"email"');
  });

  it('updates an existing content-type header instead of duplicating it', () => {
    const headers = requestHeadersForContentType(
      [
        { id: 'content', key: 'content-type', value: 'application/json', enabled: false },
        { id: 'trace', key: 'x-trace-id', value: 'abc', enabled: true },
      ],
      'text/plain',
    );

    expect(headers).toEqual([
      { id: 'content', key: 'content-type', value: 'text/plain', enabled: true },
      { id: 'trace', key: 'x-trace-id', value: 'abc', enabled: true },
    ]);
  });
});

describe('executePlaygroundRequest', () => {
  it('sends JSON, auth, shared headers, and returns request/response metadata', async () => {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({ input, init });
        return new Response(JSON.stringify({ ok: true }), {
          status: 201,
          headers: { 'content-type': 'application/json; charset=utf-8', 'x-runtime': 'mock' },
        });
      }),
    );

    const response = await executePlaygroundRequest({
      request: {
        ...requestDraft(),
        auth: { mode: 'bearer', token: 'secret-token' },
      },
      sharedHeaders: [{ id: 'shared', key: 'x-shared', value: 'enabled', enabled: true }],
    });

    const init = calls[0]?.init;
    const headers = init?.headers as Headers;

    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"email":"user@example.com"}');
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('authorization')).toBe('Bearer secret-token');
    expect(headers.get('x-shared')).toBe('enabled');
    expect(response.status).toBe(201);
    expect(response.parsedBody).toEqual({ ok: true });
    expect(response.requestBodyText).toBe('{"email":"user@example.com"}');
    expect(response.requestContentType).toBe('application/json');
    expect(response.responseContentType).toBe('application/json; charset=utf-8');
    expect(response.headers).toEqual(expect.arrayContaining([{ key: 'x-runtime', value: 'mock' }]));
  });

  it.each([
    ['application/x-www-form-urlencoded', 'email=user%40example.com&password=secret'],
    ['text/plain', 'raw-token'],
  ])('sends %s bodies as text payloads', async (contentType, bodyText) => {
    const calls: Array<{ init?: RequestInit }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({ init });
        return new Response('ok', { status: 200, headers: { 'content-type': 'text/plain' } });
      }),
    );

    await executePlaygroundRequest({
      request: {
        ...requestDraft(),
        headers: [{ id: 'content', key: 'Content-Type', value: contentType, enabled: true }],
        bodyContentType: contentType,
        bodyText,
      },
      sharedHeaders: [],
    });

    expect(calls[0]?.init?.body).toBe(bodyText);
    expect((calls[0]?.init?.headers as Headers).get('content-type')).toBe(contentType);
  });

  it.each(['GET', 'HEAD'] as const)('does not send a body for %s requests', async (method) => {
    const calls: Array<{ init?: RequestInit }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({ init });
        return new Response(null, { status: 204 });
      }),
    );

    const response = await executePlaygroundRequest({
      request: { ...requestDraft(), method, bodyText: '{"ignored":true}' },
      sharedHeaders: [],
    });

    expect(calls[0]?.init?.body).toBeUndefined();
    expect(response.requestBodyText).toBe('');
  });
});

function endpoint(): ProjectEndpoint {
  return {
    id: '00000000-0000-4000-8000-000000000000',
    method: 'POST',
    path: '/auth/login',
    group: 'Auth',
    parameters: [],
    requestBody: {
      contentType: 'application/json',
      schema: loginSchema(),
      mediaTypes: [
        { contentType: 'application/json', schema: loginSchema() },
        { contentType: 'application/x-www-form-urlencoded', schema: loginSchema() },
        { contentType: 'text/plain', schema: { type: 'string', example: 'raw-token' } },
      ],
      required: true,
    },
    responses: [],
    config: {
      authRequired: false,
      latencyMs: 0,
      statusCode: 200,
      errorChance: 0,
    },
    savedResponses: [],
    createdAt: '2026-05-14T00:00:00.000Z',
    updatedAt: '2026-05-14T00:00:00.000Z',
  };
}

function requestDraft(): RequestDraft {
  return {
    method: 'POST',
    url: 'http://localhost:3001/mock/project/auth/login',
    params: [],
    headers: [{ id: 'content', key: 'Content-Type', value: 'application/json', enabled: true }],
    bodyContentType: 'application/json',
    bodyText: '{"email":"user@example.com"}',
    bodyByContentType: {},
    auth: { mode: 'none', token: '' },
  };
}

function loginSchema() {
  return {
    type: 'object' as const,
    properties: {
      email: { type: 'string' as const, format: 'email' },
      password: { type: 'string' as const },
    },
    required: ['email', 'password'],
  };
}
