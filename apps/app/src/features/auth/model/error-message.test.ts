import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { getAuthErrorMessage } from './error-message';

describe('getAuthErrorMessage', () => {
  it('preserves ApiError messages', () => {
    expect(getAuthErrorMessage(new ApiError(401, 'Invalid credentials', null), 'Fallback')).toBe(
      'Invalid credentials',
    );
  });

  it('preserves generic Error messages', () => {
    expect(getAuthErrorMessage(new Error('Network unavailable'), 'Fallback')).toBe(
      'Network unavailable',
    );
  });

  it('uses the fallback for non-error values', () => {
    expect(getAuthErrorMessage({ error: 'Unknown shape' }, 'Fallback')).toBe('Fallback');
  });
});
