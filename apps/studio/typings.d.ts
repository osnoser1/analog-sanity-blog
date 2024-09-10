declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      SANITY_STUDIO_PREVIEW_URL: string;
      SANITY_API_READ_TOKEN: string;
      VITE_SANITY_DATASET: string;
      VITE_SANITY_PROJECT_ID: string;
      VITE_SANITY_API_VERSION: string;
    }
  }
}

export {};
