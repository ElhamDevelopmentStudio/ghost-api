import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIV3 } from 'openapi-types';
import type { NormalizedSchema } from '@ghostapi/types';

import { SchemaValidationError } from './errors.js';
import { loadRawSchema } from './load.js';
import { normalize } from './normalize.js';

/**
 * The top-level entrypoint. Accepts a JSON or YAML string, validates it as
 * OpenAPI 3.x, dereferences `$ref`s, and returns a NormalizedSchema.
 *
 * Throws SchemaParseError on syntax errors and SchemaValidationError if the
 * document doesn't conform to OpenAPI 3.x.
 */
export async function parseSchema(input: string): Promise<NormalizedSchema> {
  const raw = loadRawSchema(input);
  let dereferenced: OpenAPIV3.Document;
  try {
    // SwaggerParser.dereference both validates and resolves $refs in-place.
    // The static overloads include a `void` return for the callback form, which
    // confuses inference — the Promise overload is what runs at runtime.
    const result = (await SwaggerParser.dereference(raw as never)) as unknown;
    dereferenced = result as OpenAPIV3.Document;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new SchemaValidationError('Schema failed OpenAPI validation', [message]);
  }

  if (!dereferenced.openapi?.startsWith('3.')) {
    throw new SchemaValidationError('Only OpenAPI 3.x is supported in Phase 1', [
      `Got openapi=${String(dereferenced.openapi)}`,
    ]);
  }

  return normalize(dereferenced);
}
