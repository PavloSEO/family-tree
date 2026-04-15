import { defineConfig } from "drizzle-kit";

/** Paths relative to `packages/server` (cwd for `pnpm exec drizzle-kit`). */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./data/db/family-tree.db",
  },
});
