/**
 * Convert OpenAPI-style `/users/{id}` into Hono-style `/users/:id`.
 *
 * We deliberately don't try to handle nested braces or escapes — OpenAPI
 * doesn't allow them in path templates.
 */
export function toHonoPath(openapiPath: string): string {
  return openapiPath.replace(/\{([^}]+)\}/g, ':$1');
}
