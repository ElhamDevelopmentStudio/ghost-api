import type { Faker } from '@faker-js/faker';
import type { FieldSchema } from '@ghostapi/types';
import { chooseByFieldName, chooseByFormat, makeFaker } from './heuristics.js';

export interface GenerateOptions {
  /** When provided, generation becomes deterministic for this seed. */
  seed?: number | string;
  /** Default array length when the schema has no min/max items. */
  defaultArrayLength?: number;
  /** Hard cap on recursion depth to prevent runaway nested schemas. */
  maxDepth?: number;
  /** Whether explicit schema examples should be returned before generated values. */
  preserveExamples?: boolean;
  /** Whether field-name and format heuristics should use faker-backed values. */
  useFaker?: boolean;
  /** Target length for fallback string values. */
  stringLength?: number;
}

/**
 * Generate a JSON-shaped value that conforms to a NormalizedEndpoint
 * FieldSchema. Tries (in order): explicit `example`, `enum`, name heuristic,
 * format producer, type-based fallback.
 */
export function generateMockValue(schema: FieldSchema, options: GenerateOptions = {}): unknown {
  const faker = makeFaker(options.seed);
  const ctx: Ctx = {
    faker,
    defaultArrayLength: options.defaultArrayLength ?? 3,
    maxDepth: options.maxDepth ?? 8,
    preserveExamples: options.preserveExamples ?? true,
    useFaker: options.useFaker ?? true,
    stringLength: options.stringLength ?? 12,
  };
  return generate(schema, undefined, 0, ctx);
}

interface Ctx {
  faker: Faker;
  defaultArrayLength: number;
  maxDepth: number;
  preserveExamples: boolean;
  useFaker: boolean;
  stringLength: number;
}

function generate(
  schema: FieldSchema,
  fieldName: string | undefined,
  depth: number,
  ctx: Ctx,
): unknown {
  if (depth > ctx.maxDepth) return null;

  if (ctx.preserveExamples && schema.example !== undefined) return schema.example;
  if (schema.enum && schema.enum.length > 0) {
    if (!ctx.useFaker) return schema.enum[0];
    return schema.enum[ctx.faker.number.int({ min: 0, max: schema.enum.length - 1 })];
  }

  if (ctx.useFaker && fieldName) {
    const byName = chooseByFieldName(fieldName, ctx.faker);
    if (byName !== undefined) return coerceToType(byName, schema.type);
  }

  if (ctx.useFaker) {
    const byFormat = chooseByFormat(schema, ctx.faker);
    if (byFormat !== undefined) return byFormat;
  }

  switch (schema.type) {
    case 'string':
      return ctx.useFaker
        ? ctx.faker.string.alpha({ length: ctx.stringLength })
        : 'x'.repeat(ctx.stringLength);
    case 'number':
      return ctx.faker.number.float({ min: 0, max: 1000, fractionDigits: 2 });
    case 'integer':
      return ctx.faker.number.int({ min: 0, max: 10_000 });
    case 'boolean':
      return ctx.faker.datatype.boolean();
    case 'null':
      return null;
    case 'array': {
      if (!schema.items) return [];
      const len = ctx.defaultArrayLength;
      return Array.from({ length: len }, () =>
        generate(schema.items as FieldSchema, undefined, depth + 1, ctx),
      );
    }
    case 'object': {
      const out: Record<string, unknown> = {};
      for (const [name, prop] of Object.entries(schema.properties ?? {})) {
        out[name] = generate(prop, name, depth + 1, ctx);
      }
      return out;
    }
    case 'unknown':
    default:
      return null;
  }
}

function coerceToType(value: unknown, type: FieldSchema['type']): unknown {
  if (value === null || value === undefined) return value;
  switch (type) {
    case 'string':
      return typeof value === 'string' ? value : String(value);
    case 'number':
    case 'integer':
      return typeof value === 'number' ? value : Number(value);
    case 'boolean':
      return Boolean(value);
    default:
      return value;
  }
}
