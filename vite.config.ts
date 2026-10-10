import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { distributionPlugin, PAGES_BASE } from './scripts/distribution.mjs';

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? PAGES_BASE : '/',
  plugins: [react(), distributionPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
}));
