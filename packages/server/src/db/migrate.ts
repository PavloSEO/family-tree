import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./connection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Directory of SQL migrations (next to built `migrate.js` or `serve.js` in `dist/`). */
const migrationsFolder =
  process.env.MIGRATIONS_PATH?.trim() ||
  path.join(__dirname, "migrations");

/** Apply SQL migrations (idempotent). */
export function runMigrate(): void {
  migrate(db, {
    migrationsFolder,
  });
}
