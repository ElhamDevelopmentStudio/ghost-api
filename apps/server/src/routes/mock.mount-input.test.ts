import { describe, expect, it } from 'vitest';

import { toMountInput, type DbEndpoint } from './mock.mount-input';

describe('toMountInput', () => {
  it('maps persisted endpoint JSON into runtime mount input', () => {
    const row: DbEndpoint = {
      id: 'endpoint-1',
      method: 'GET',
      path: '/users/{id}',
      group: 'Users',
      requestSchema: {
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
      },
      responseSchema: {
        responses: [
          {
            status: 200,
            contentType: 'application/json',
            schema: { type: 'object', properties: { id: { type: 'string' } } },
          },
        ],
      },
      config: {
        latencyMs: 120,
        statusCode: 200,
        authRequired: true,
        errorChance: 0.25,
      },
      responses: [
        { status: 404, contentType: 'application/json', body: { error: 'Missing' } },
        { status: 200, contentType: 'application/json', body: { id: 'saved-user' } },
      ],
    };

    expect(toMountInput(row)).toEqual({
      endpoint: {
        id: 'endpoint-1',
        method: 'GET',
        path: '/users/{id}',
        group: 'Users',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: undefined,
        responses: [
          {
            status: 200,
            contentType: 'application/json',
            schema: { type: 'object', properties: { id: { type: 'string' } } },
          },
        ],
        authRequired: true,
      },
      config: {
        latencyMs: 120,
        statusCode: 200,
        authRequired: true,
        errorChance: 0.25,
      },
      savedBody: { id: 'saved-user' },
      savedResponses: [
        { status: 404, contentType: 'application/json', body: { error: 'Missing' } },
        { status: 200, contentType: 'application/json', body: { id: 'saved-user' } },
      ],
      seed: 'endpoint-1',
    });
  });

  it('keeps runtime-safe defaults when optional persisted shapes are absent', () => {
    const row: DbEndpoint = {
      id: 'endpoint-2',
      method: 'POST',
      path: '/users',
      group: 'default',
      requestSchema: null,
      responseSchema: null,
      config: null,
      responses: [],
    };

    expect(toMountInput(row)).toEqual({
      endpoint: {
        id: 'endpoint-2',
        method: 'POST',
        path: '/users',
        group: 'default',
        parameters: [],
        requestBody: undefined,
        responses: [],
        authRequired: false,
      },
      config: {
        latencyMs: 0,
        statusCode: null,
        authRequired: false,
        errorChance: 0,
      },
      savedBody: undefined,
      savedResponses: [],
      seed: 'endpoint-2',
    });
  });

  it('uses the saved body that matches the configured status override', () => {
    const row: DbEndpoint = {
      id: 'endpoint-3',
      method: 'GET',
      path: '/users/{id}',
      group: 'Users',
      requestSchema: {},
      responseSchema: {},
      config: {
        latencyMs: 0,
        statusCode: 404,
        authRequired: false,
        errorChance: 0,
      },
      responses: [
        { status: 200, contentType: 'application/json', body: { id: 'saved-user' } },
        { status: 404, contentType: 'application/json', body: { error: 'Not found' } },
      ],
    };

    expect(toMountInput(row).savedBody).toEqual({ error: 'Not found' });
  });
});
