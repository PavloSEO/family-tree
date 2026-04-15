/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL API (пусто = тот же origin, в dev — proxy `/api`). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
