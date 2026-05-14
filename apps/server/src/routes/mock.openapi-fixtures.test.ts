import { describe, expect, it } from 'vitest';
import type { EndpointMockConfig, NormalizedEndpoint } from '@ghostapi/types';
import { parseSchema } from '@ghostapi/parser';
import { buildMockRouter, type MountInput, type RequestLogEntry } from '@ghostapi/runtime';

const bookstoreSchema = `
openapi: 3.0.3
info:
  title: Bookstore Fixture API
  version: 2.1.0
servers:
  - url: https://books.example.test
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
paths:
  /books/{bookId}:
    head:
      tags: [catalog]
      parameters:
        - name: bookId
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Book exists
    get:
      tags: [catalog]
      security:
        - bearerAuth: []
      parameters:
        - name: bookId
          in: path
          required: true
          schema:
            type: string
            example: book_123
        - name: includeReviews
          in: query
          schema:
            type: boolean
        - name: x-client-version
          in: header
          schema:
            type: string
      responses:
        '200':
          description: Book found
          content:
            application/json:
              schema:
                type: object
                required: [id, title, price]
                properties:
                  id:
                    type: string
                    example: book_123
                  title:
                    type: string
                    example: The Testable API
                  price:
                    type: number
                    example: 24.5
                  tags:
                    type: array
                    items:
                      type: string
        '404':
          description: Book not found
          content:
            application/json:
              schema:
                type: object
                required: [code]
                properties:
                  code:
                    type: string
                    enum: [BOOK_NOT_FOUND]
  /orders:
    options:
      tags: [orders]
      responses:
        '200':
          description: Supported order methods
          content:
            application/json:
              schema:
                type: object
                properties:
                  methods:
                    type: array
                    items:
                      type: string
                      enum: [POST]
    post:
      tags: [orders]
      parameters:
        - name: x-client-version
          in: header
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [bookId, quantity]
              properties:
                bookId:
                  type: string
                quantity:
                  type: integer
      responses:
        '201':
          description: Order created
          content:
            application/json:
              schema:
                type: object
                required: [orderId, status]
                properties:
                  orderId:
                    type: string
                    example: order_123
                  status:
                    type: string
                    enum: [created]
`;

describe('OpenAPI fixture coverage for mock routes', () => {
  it('normalizes a non-sample schema with params, body, auth, and multiple responses', async () => {
    const normalized = await parseSchema(bookstoreSchema);

    expect(normalized.title).toBe('Bookstore Fixture API');
    expect(normalized.servers).toEqual(['https://books.example.test']);
    expect(normalized.endpoints).toHaveLength(4);

    const headBook = endpoint(normalized.endpoints, 'HEAD', '/books/{bookId}');
    expect(headBook.responses[0]?.status).toBe(204);

    const getBook = endpoint(normalized.endpoints, 'GET', '/books/{bookId}');
    expect(getBook.group).toBe('catalog');
    expect(getBook.authRequired).toBe(true);
    expect(
      getBook.parameters.map((param) => `${param.in}:${param.name}:${param.required}`),
    ).toEqual(['path:bookId:true', 'query:includeReviews:false', 'header:x-client-version:false']);
    expect(getBook.responses.map((response) => response.status)).toEqual([200, 404]);
    expect(getBook.responses[0]?.schema?.properties?.title?.example).toBe('The Testable API');

    const createOrder = endpoint(normalized.endpoints, 'POST', '/orders');
    expect(createOrder.group).toBe('orders');
    expect(createOrder.requestBody?.required).toBe(true);
    expect(createOrder.requestBody?.schema.properties?.quantity?.type).toBe('integer');
    expect(createOrder.parameters[0]).toMatchObject({
      name: 'x-client-version',
      in: 'header',
      required: true,
    });
    expect(createOrder.responses[0]?.status).toBe(201);

    const orderOptions = endpoint(normalized.endpoints, 'OPTIONS', '/orders');
    expect(orderOptions.responses[0]?.schema?.properties?.methods?.items?.enum).toEqual(['POST']);
  });

  it('builds working mock routes from the fixture without relying on api.json', async () => {
    const normalized = await parseSchema(bookstoreSchema);
    const logs: RequestLogEntry[] = [];
    const app = buildMockRouter(
      normalized.endpoints.map((item) => mountInput(item)),
      {
        onLog: (entry) => {
          logs.push(entry);
        },
      },
    );

    const missingAuth = await app.request('/books/book_123?includeReviews=true', {
      headers: { 'x-client-version': 'web-1' },
    });
    expect(missingAuth.status).toBe(401);

    const getBook = await app.request('/books/book_123?includeReviews=true', {
      headers: {
        Authorization: 'Bearer fixture-token',
        'x-client-version': 'web-1',
      },
    });
    expect(getBook.status).toBe(200);
    await expect(getBook.json()).resolves.toMatchObject({
      id: 'book_123',
      title: 'The Testable API',
      price: 24.5,
    });

    const headBook = await app.request('/books/book_123', { method: 'HEAD' });
    expect(headBook.status).toBe(204);
    await expect(headBook.text()).resolves.toBe('');

    const orderOptions = await app.request('/orders', { method: 'OPTIONS' });
    expect(orderOptions.status).toBe(200);
    await expect(orderOptions.json()).resolves.toEqual({ methods: ['POST', 'POST', 'POST'] });

    const createOrder = await app.request('/orders', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-client-version': 'web-1',
      },
      body: JSON.stringify({ bookId: 'book_123', quantity: 2 }),
    });
    expect(createOrder.status).toBe(201);
    await expect(createOrder.json()).resolves.toEqual({
      orderId: 'order_123',
      status: 'created',
    });

    expect(logs).toHaveLength(5);
    expect(logs[0]).toMatchObject({
      method: 'GET',
      path: '/books/{bookId}',
      status: 401,
    });
    expect(logs[1]).toMatchObject({
      method: 'GET',
      path: '/books/{bookId}',
      status: 200,
    });
    expect(logs[1]?.requestHeaders.authorization).toBe('Bearer fixture-token');
    expect(logs[2]).toMatchObject({
      method: 'HEAD',
      path: '/books/{bookId}',
      status: 204,
      responseBody: null,
    });
    expect(logs[3]).toMatchObject({
      method: 'OPTIONS',
      path: '/orders',
      status: 200,
    });
    expect(logs[4]).toMatchObject({
      method: 'POST',
      path: '/orders',
      status: 201,
      requestBody: { bookId: 'book_123', quantity: 2 },
    });
  });

  it('serves the saved body matching a configured non-2xx status from the fixture', async () => {
    const normalized = await parseSchema(bookstoreSchema);
    const getBook = endpoint(normalized.endpoints, 'GET', '/books/{bookId}');
    const app = buildMockRouter([
      mountInput(getBook, {
        config: { statusCode: 404 },
        savedBody: { code: 'BOOK_NOT_FOUND' },
      }),
    ]);

    const response = await app.request('/books/missing', {
      headers: { Authorization: 'Bearer fixture-token' },
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ code: 'BOOK_NOT_FOUND' });
  });
});

function endpoint(
  endpoints: NormalizedEndpoint[],
  method: string,
  path: string,
): NormalizedEndpoint {
  const found = endpoints.find((item) => item.method === method && item.path === path);
  if (!found) throw new Error(`Missing fixture endpoint: ${method} ${path}`);
  return found;
}

function mountInput(
  endpoint: NormalizedEndpoint,
  overrides: {
    config?: Partial<EndpointMockConfig>;
    savedBody?: unknown;
  } = {},
): MountInput {
  return {
    endpoint,
    config: {
      latencyMs: 0,
      statusCode: null,
      authRequired: endpoint.authRequired,
      errorChance: 0,
      ...overrides.config,
    },
    savedBody: overrides.savedBody,
    seed: endpoint.id,
  };
}
