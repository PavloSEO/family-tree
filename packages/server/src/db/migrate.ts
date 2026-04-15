import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./connection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Каталог SQL-миграций (рядом с собранным `migrate.js` или `serve.js` в `dist/`). */
const migrationsFolder =
  process.env.MIGRATIONS_PATH?.trim() ||
  path.join(__dirname, "migrations");

/** Применяет SQL-миграции (идемпотентно). */
export function runMigrate(): void {
  migrate(db, {
    migrationsFolder,
  });
}
