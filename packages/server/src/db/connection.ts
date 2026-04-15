import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveDbFilePath(): string {
  const fromEnv =
    process.env.DATABASE_PATH?.trim() || process.env.DB_PATH?.trim();
  if (fromEnv) {
    return path.isAbsolute(fromEnv)
      ? fromEnv
      : path.resolve(process.cwd(), fromEnv);
  }
  return path.resolve(__dirname, "../../data/db/family-tree.db");
}

const dbFilePath = resolveDbFilePath();

/** Абсолютный путь к файлу SQLite (для бэкапов и диагностики). */
export function getDatabaseFilePath(): string {
  return dbFilePath;
}

fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });

const sqlite = new Database(dbFilePath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");

export const db = drizzle(sqlite, { schema });

export { sqlite };
