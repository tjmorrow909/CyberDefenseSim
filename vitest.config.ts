import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    environment: 'jsdom', // Ensure jsdom is set for DOM APIs in tests
    globals: true,
    setupFiles: './client/src/setupTests.ts',
    include: ['client/src/**/*.test.ts', 'client/src/**/*.test.tsx'],
    // Fallback: If alias resolution fails, use relative imports in test files.
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client', 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    },
  },
});
// Architectural Note: For robust test execution, prefer relative imports in test files if you encounter alias issues. See README for details.
