/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VERCEL_BYPASS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
