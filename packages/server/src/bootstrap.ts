import { runMigrate } from "./db/migrate.js";
import { runSeed } from "./db/seed.js";

runMigrate();
console.log("[bootstrap] Миграции SQLite применены.");

if (process.env.SKIP_DB_SEED?.trim() === "1") {
  console.log("[bootstrap] SKIP_DB_SEED=1 — runSeed() пропущен (admin нужен в БД заранее).");
} else {
  runSeed();
  console.log("[bootstrap] Сид проверен (при отсутствии admin в БД — создан из env).");
}
