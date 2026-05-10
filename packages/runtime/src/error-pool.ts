/**
 * The synopsis lists 400, 401, 403, 429, 500 as error simulation status codes.
 * Pick one uniformly.
 */
const ERROR_STATUSES = [400, 401, 403, 429, 500] as const;
type ErrorStatus = (typeof ERROR_STATUSES)[number];

export function pickErrorStatus(rand: () => number = Math.random): ErrorStatus {
  const idx = Math.floor(rand() * ERROR_STATUSES.length);
  return ERROR_STATUSES[idx] ?? 500;
}

export function errorBody(status: number): { error: string; status: number } {
  const messages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  };
  return { error: messages[status] ?? 'Error', status };
}
