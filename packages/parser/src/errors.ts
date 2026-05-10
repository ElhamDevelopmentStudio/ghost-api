export class SchemaParseError extends Error {
  override readonly name = 'SchemaParseError';
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}

export class SchemaValidationError extends Error {
  override readonly name = 'SchemaValidationError';
  readonly issues: string[];

  constructor(message: string, issues: string[]) {
    super(message);
    this.issues = issues;
  }
}
