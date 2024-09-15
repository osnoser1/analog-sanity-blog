/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BYPASS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
