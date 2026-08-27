import { readFileSync, writeFileSync } from 'node:fs';

import json from '@rollup/plugin-json';

// tsc emits dist/esm/index.js with the same relative depth to package.json
// that src/index.ts has (one directory up), so a file must exist at
// dist/package.json for that import to resolve when rollup bundles it.
// Only `version` is written (not the full manifest) so scripts,
// devDependencies, and other build-only metadata don't ship to consumers.
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
writeFileSync('dist/package.json', JSON.stringify({ version }));

export default {
  input: 'dist/esm/index.js',
  plugins: [json()],
  output: [
    {
      file: 'dist/plugin.js',
      format: 'iife',
      name: 'AppsFlyerCapacitorPlugin',
      globals: {
        '@capacitor/core': 'capacitorExports',
      },
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  external: ['@capacitor/core'],
};
