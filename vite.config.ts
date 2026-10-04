/**
 * vite.config.ts
 *
 * Configured specifically for Vitest execution with TypeScript path aliases (@/* -> ./src/*).
 * Next.js uses next.config.mjs for application bundling, while Vitest leverages Vite's fast ESM runner.
 */
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
