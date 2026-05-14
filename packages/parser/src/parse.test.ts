import { describe, expect, it } from 'vitest';
import { parseSchema, SchemaParseError } from './index.js';

const minimalYaml = `
openapi: 3.0.3
info:
  title: Test API
  version: 1.0.0
paths:
  /users:
    get:
      tags: [users]
      summary: List users
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id: { type: string, format: uuid }
                    email: { type: string, format: email }
                  required: [id, email]
  /users/{id}:
    get:
      tags: [users]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200':
          description: OK
        '404':
          description: Not found
`;

describe('parseSchema', () => {
  it('rejects empty input', async () => {
    await expect(parseSchema('')).rejects.toBeInstanceOf(SchemaParseError);
  });

  it('normalizes a minimal YAML document', async () => {
    const out = await parseSchema(minimalYaml);
    expect(out.title).toBe('Test API');
    expect(out.endpoints).toHaveLength(2);

    const list = out.endpoints.find((e) => e.path === '/users' && e.method === 'GET');
    expect(list).toBeDefined();
    expect(list?.group).toBe('users');
    expect(list?.responses[0]?.status).toBe(200);
    expect(list?.responses[0]?.schema?.type).toBe('array');
    expect(list?.responses[0]?.schema?.items?.properties?.id?.format).toBe('uuid');

    const detail = out.endpoints.find((e) => e.path === '/users/{id}');
    expect(detail?.parameters[0]?.name).toBe('id');
    expect(detail?.parameters[0]?.in).toBe('path');
    expect(detail?.parameters[0]?.required).toBe(true);
    expect(detail?.responses.map((r) => r.status).sort()).toEqual([200, 404]);
  });

  it('parses JSON input transparently', async () => {
    const json = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'JSON API', version: '0.1.0' },
      paths: {
        '/ping': { get: { responses: { '200': { description: 'OK' } } } },
      },
    });
    const out = await parseSchema(json);
    expect(out.title).toBe('JSON API');
    expect(out.endpoints[0]?.path).toBe('/ping');
  });

  it('preserves multiple request and response media types while preferring JSON defaults', async () => {
    const out = await parseSchema(`
openapi: 3.0.3
info:
  title: Media API
  version: 1.0.0
paths:
  /messages:
    post:
      requestBody:
        content:
          text/plain:
            schema:
              type: string
              example: hello
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: hello
      responses:
        '200':
          description: OK
          content:
            text/plain:
              schema:
                type: string
                example: accepted
            application/json:
              schema:
                type: object
                properties:
                  ok:
                    type: boolean
                    example: true
`);

    const endpoint = out.endpoints[0];
    expect(endpoint).toBeDefined();

    expect(endpoint?.requestBody).toBeDefined();
    expect(endpoint?.requestBody?.contentType).toBe('application/json');
    expect(endpoint?.requestBody?.schema.type).toBe('object');
    expect(endpoint?.requestBody?.mediaTypes?.map((media) => media.contentType)).toEqual([
      'text/plain',
      'application/json',
    ]);

    expect(endpoint?.responses[0]?.contentType).toBe('application/json');
    expect(endpoint?.responses[0]?.schema?.type).toBe('object');
    expect(endpoint?.responses[0]?.mediaTypes?.map((media) => media.contentType)).toEqual([
      'text/plain',
      'application/json',
    ]);
  });
});
