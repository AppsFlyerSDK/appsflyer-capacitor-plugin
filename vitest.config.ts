import { defineConfig } from 'vitest/config';

// Scoped to the plugin's own src/ — examples/ has its own package.json,
// deps, and test setup and is not part of this workspace.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
