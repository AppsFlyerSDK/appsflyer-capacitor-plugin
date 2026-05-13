import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    rollupOptions: {
      input: 'index.html',
    },
  },
  envPrefix: ['VITE_', 'DEV_KEY', 'APP_ID'],
});
