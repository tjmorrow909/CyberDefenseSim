import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './client/src/setupTests.ts',
    include: ['client/src/**/*.test.ts', 'client/src/**/*.test.tsx', 'server/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client', 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
});
// Architectural Note: For robust test execution, prefer relative imports in test files if you encounter alias issues. See README for details.
