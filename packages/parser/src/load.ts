import { parse as parseYaml } from 'yaml';
import { SchemaParseError } from './errors.js';

/**
 * Decode raw bytes/string into a JS object. Accepts JSON or YAML transparently.
 *
 * Safety: we never `eval` or `Function`-construct; YAML is parsed by the `yaml`
 * package which does not execute schema content. Per SETUP.md security rules.
 */
export function loadRawSchema(input: string): unknown {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new SchemaParseError('Schema input is empty');
  }

  // JSON if it starts with { or [.
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch (err) {
      throw new SchemaParseError('Failed to parse JSON schema', err);
    }
  }

  try {
    return parseYaml(trimmed, { prettyErrors: true });
  } catch (err) {
    throw new SchemaParseError('Failed to parse YAML schema', err);
  }
}
