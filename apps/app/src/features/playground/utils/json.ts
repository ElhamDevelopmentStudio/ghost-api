import { toast } from '@ghostapi/ui';

export function validateJsonText(value: string) {
  if (!value.trim()) return null;
  try {
    JSON.parse(value);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Invalid JSON';
  }
}

export function parseEditableJson(value: string): { ok: true; value: unknown } | { ok: false } {
  if (!value.trim()) return { ok: true, value: null };

  try {
    return { ok: true, value: JSON.parse(value) };
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Invalid JSON');
    return { ok: false };
  }
}

export function parseJson(value: string): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function formatResponseBody(parsedBody: unknown, rawBody: string, format: 'pretty' | 'raw') {
  if (format === 'raw') return rawBody;
  return typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody, null, 2);
}

export function beautifyJson(value: string) {
  const parsed = parseEditableJson(value);
  return parsed.ok ? JSON.stringify(parsed.value, null, 2) : null;
}
