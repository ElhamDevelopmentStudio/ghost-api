# Server Source Layout

The backend is organized by responsibility so contributors can find the right
entry point quickly.

```txt
src/
  server/      App composition, Hono environment types, server-level wiring.
  features/    Product or domain modules with their own routes, schemas,
               services, middleware, and internal helpers.
  routes/      Thin resource routes that are not yet large enough to justify
               a full feature module.
  docs/        OpenAPI and Scalar documentation registration.
  db.ts        Prisma client singleton.
  env.ts       Validated server env accessor.
  logger.ts    Structured logger.
  index.ts     Process entry point. Keep this thin.
```

Feature modules should expose a small public surface from `index.ts`. Other
features or routes should import from that public surface instead of reaching
into module internals.

Auth is intentionally a full feature module:

```txt
features/auth/
  auth.routes.ts       HTTP route handlers and route-level middleware wiring.
  auth.schemas.ts      Zod/OpenAPI request and response schemas.
  auth.service.ts      Business logic and Prisma persistence orchestration.
  auth.middleware.ts   Session and CSRF guards used by other routes.
  auth.cookies.ts      Cookie read/write helpers.
  auth.crypto.ts       Password hashing, JWTs, and token hashing.
  auth.constants.ts    Cookie names and token lifetimes.
  auth.rate-limit.ts   In-memory auth endpoint rate limiter.
  index.ts             Public exports for the module.
```
