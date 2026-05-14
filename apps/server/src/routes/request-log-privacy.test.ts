import { describe, expect, it } from 'vitest';
import type { RequestLogEntry } from '@ghostapi/runtime';

import {
  REDACTED_VALUE,
  REQUEST_LOG_RETENTION_DAYS,
  requestLogRetentionCutoff,
  sanitizeRequestLogEntry,
} from './request-log-privacy.js';

describe('request log privacy', () => {
  it('redacts sensitive headers and body fields before persistence', () => {
    const sanitized = sanitizeRequestLogEntry({
      ...entry(),
      requestHeaders: {
        authorization: 'Bearer secret',
        cookie: 'ghostapi_access=secret',
        'x-trace-id': 'trace-1',
      },
      requestBody: {
        email: 'dev@example.com',
        password: 'password123',
        profile: {
          apiKey: 'sk_secret',
          displayName: 'Dev',
        },
      },
      responseHeaders: {
        'set-cookie': 'session=secret',
        'content-type': 'application/json',
      },
      responseBody: {
        accessToken: 'token-value',
        user: { id: 'user_1' },
      },
    });

    expect(sanitized.headers).toEqual({
      authorization: REDACTED_VALUE,
      cookie: REDACTED_VALUE,
      'x-trace-id': 'trace-1',
    });
    expect(sanitized.body).toEqual({
      email: 'dev@example.com',
      password: REDACTED_VALUE,
      profile: {
        apiKey: REDACTED_VALUE,
        displayName: 'Dev',
      },
    });
    expect(sanitized.responseHeaders).toEqual({
      'set-cookie': REDACTED_VALUE,
      'content-type': 'application/json',
    });
    expect(sanitized.responseBody).toEqual({
      accessToken: REDACTED_VALUE,
      user: { id: 'user_1' },
    });
  });

  it('computes the default retention cutoff', () => {
    const now = new Date('2026-05-15T00:00:00.000Z');

    expect(requestLogRetentionCutoff(REQUEST_LOG_RETENTION_DAYS, now)?.toISOString()).toBe(
      '2026-04-15T00:00:00.000Z',
    );
    expect(REQUEST_LOG_RETENTION_DAYS).toBe(30);
  });

  it('does not compute a cutoff when retention is disabled', () => {
    expect(requestLogRetentionCutoff(0, new Date('2026-05-15T00:00:00.000Z'))).toBeNull();
  });
});

function entry(): RequestLogEntry {
  return {
    id: '00000000-0000-4000-8000-000000000123',
    endpointId: '00000000-0000-4000-8000-000000000456',
    method: 'POST',
    path: '/auth/login',
    status: 200,
    durationMs: 14,
    requestHeaders: {},
    requestBody: null,
    responseHeaders: {},
    responseContentType: 'application/json',
    responseBody: null,
    receivedAt: new Date('2026-05-15T00:00:00.000Z'),
  };
}
