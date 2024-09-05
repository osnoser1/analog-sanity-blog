/// <reference types="vitest" />

import analog from '@analogjs/platform';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import webfontDownload from 'vite-plugin-webfont-dl';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { generateToken } from './src/server/utils/generate-token';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env['VERCEL_BYPASS_TOKEN'] = generateToken();

  return {
    root: __dirname,
    cacheDir: `../node_modules/.vite`,

    build: {
      outDir: '../dist/./blog/client',
      reportCompressedSize: true,
      target: ['es2020'],
    },
    server: {
      fs: {
        allow: ['.'],
      },
    },
    plugins: [
      analog({
        nitro: {
          static: false,
          routeRules: {
            '/': { prerender: false },
            '/api/sitemap.xml': { isr: 3600 * 24 },
          },
          vercel: {
            config: {
              bypassToken: process.env['VERCEL_BYPASS_TOKEN'],
            },
          },
        },
      }),
      nxViteTsPaths(),
      splitVendorChunkPlugin(),
      webfontDownload(),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['**/*.spec.ts'],
      reporters: ['default'],
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
