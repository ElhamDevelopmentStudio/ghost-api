import { describe, expect, it } from 'vitest';

import type { ProjectEndpoint } from '@ghostapi/types';

import { initialPlaygroundState, playgroundReducer } from './playground-reducer';

describe('playgroundReducer request body media types', () => {
  it('updates content-type, regenerates the body, and preserves edits per media type', () => {
    const selected = playgroundReducer(initialPlaygroundState, {
      type: 'endpointSelected',
      endpoint: endpoint(),
      runtimeBase: 'http://localhost:3001/mock/project',
    });
    const jsonEdited = playgroundReducer(selected, {
      type: 'bodyChanged',
      bodyText: '{\n  "email": "edited@example.com"\n}',
    });
    const formSelected = playgroundReducer(jsonEdited, {
      type: 'requestContentTypeChanged',
      endpoint: endpoint(),
      contentType: 'application/x-www-form-urlencoded',
    });
    const jsonSelectedAgain = playgroundReducer(formSelected, {
      type: 'requestContentTypeChanged',
      endpoint: endpoint(),
      contentType: 'application/json',
    });

    expect(formSelected.request.bodyContentType).toBe('application/x-www-form-urlencoded');
    expect(formSelected.request.bodyText).toBe('email=user%40example.com&password=sample-password');
    expect(formSelected.request.headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'Content-Type',
          value: 'application/x-www-form-urlencoded',
          enabled: true,
        }),
      ]),
    );
    expect(jsonSelectedAgain.request.bodyText).toBe('{\n  "email": "edited@example.com"\n}');
  });

  it('refreshes mock draft from an updated endpoint without changing the selected row', () => {
    const selected = playgroundReducer(initialPlaygroundState, {
      type: 'endpointSelected',
      endpoint: endpoint(),
      runtimeBase: 'http://localhost:3001/mock/project',
    });
    const updated = playgroundReducer(selected, {
      type: 'mockEndpointUpdated',
      endpoint: {
        ...endpoint(),
        config: {
          authRequired: true,
          latencyMs: 250,
          statusCode: 422,
          errorChance: 0.25,
        },
        savedResponses: [
          {
            status: 200,
            contentType: 'application/json',
            body: { ok: true },
          },
        ],
      },
    });

    expect(updated.selectedEndpointId).toBe(selected.selectedEndpointId);
    expect(updated.mock.config).toEqual({
      authRequired: true,
      latencyMs: 250,
      statusCode: 422,
      errorChance: 0.25,
    });
    expect(updated.mock.responseText).toBe('{\n  "ok": true\n}');
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
