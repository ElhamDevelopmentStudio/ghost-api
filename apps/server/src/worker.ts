import {
  createWorkerPrisma,
  runWithRuntimeContext,
  serverEnvFromBindings,
  type WorkerBindings,
} from './runtime-context.js';
import { createApp } from './server/app.js';

export default {
  async fetch(request, bindings, executionContext) {
    const serverEnv = serverEnvFromBindings(bindings);
    const prisma = createWorkerPrisma(serverEnv.DATABASE_URL);

    try {
      return await runWithRuntimeContext({ env: serverEnv, prisma }, () =>
        createApp().fetch(request, bindings, executionContext),
      );
    } finally {
      executionContext.waitUntil(prisma.$disconnect());
    }
  },
} satisfies ExportedHandler<WorkerBindings>;
