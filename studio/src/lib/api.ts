/**
 * As this file is reused in several other files, try to keep it lean and small.
 * Importing other npm packages here could lead to needlessly increasing the client bundle size, or end up in a server-only function that don't need it.
 */
import * as process from 'node:process';

// Sanity typegen do a 'require' import of the sanity.config.ts, and because of that import.meta.env is not available

export const dataset =
  process.env?.VITE_SANITY_DATASET ?? import.meta.env?.['VITE_SANITY_DATASET'];

export const projectId =
  process.env?.VITE_SANITY_PROJECT_ID ??
  import.meta.env?.['VITE_SANITY_PROJECT_ID'];

/**
 * see https://www.sanity.io/docs/api-versioning for how versioning works
 */
export const apiVersion =
  process.env?.['VITE_SANITY_API_VERSION'] || '2024-02-28';

/**
 * Used to configure edit intent links, for Presentation Mode, as well as to configure where the Studio is mounted in the router.
 */
export const studioUrl = '';
