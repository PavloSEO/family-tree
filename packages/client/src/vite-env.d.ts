/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base URL (empty = same origin; in dev, Vite proxies `/api`). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
