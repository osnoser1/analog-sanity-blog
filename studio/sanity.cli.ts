import { defineCliConfig } from 'sanity/cli';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { loadEnv } from 'vite';
import * as process from 'node:process';
import * as path from 'node:path';

Object.entries(
  loadEnv(
    process.env.NODE_ENV === 'production' ? 'production' : 'development',
    path.join(process.cwd(), '../'),
  ),
).forEach(([key, value]) => {
  process.env[key] = value;
});

export default defineCliConfig({
  api: {
    dataset: process.env.VITE_SANITY_DATASET,
    projectId: process.env.VITE_SANITY_PROJECT_ID,
  },
  vite: {
    root: __dirname,
    cacheDir: '../node_modules/.vite/studio',
    build: {
      outDir: '../dist/studio',
    },
    plugins: [nxViteTsPaths()],
    envPrefix: 'VITE_',
  },
});
