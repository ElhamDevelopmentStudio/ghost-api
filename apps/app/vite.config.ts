import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Workspace packages (`packages/ui`, etc.) ship TypeScript sources directly,
 * but their internal imports use `.js` extensions for Node-ESM correctness.
 * Vite has no built-in `extensionAlias` (that's a Webpack option), so this
 * tiny resolver maps `./foo.js` → `./foo.ts` / `./foo.tsx` whenever the
 * importer lives under `/packages/`. The mapping is intentionally narrow so
 * we never override a real `.js` file in user code.
 */
function workspaceJsToTs(): Plugin {
  return {
    name: 'ghostapi:workspace-js-to-ts',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!importer || !source.endsWith('.js')) return null;
      if (!importer.includes('/packages/')) return null;
      const base = source.slice(0, -3);
      for (const ext of ['.ts', '.tsx']) {
        const resolved = await this.resolve(base + ext, importer, { skipSelf: true });
        if (resolved) return resolved;
      }
      return null;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [workspaceJsToTs(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3002,
    strictPort: true,
  },
  preview: {
    port: 3002,
  },
});
