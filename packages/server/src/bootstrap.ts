import { runMigrate } from "./db/migrate.js";
import { runSeed } from "./db/seed.js";

runMigrate();
console.log("[bootstrap] SQLite migrations applied.");

if (process.env.SKIP_DB_SEED?.trim() === "1") {
  console.log(
    "[bootstrap] SKIP_DB_SEED=1 — runSeed() skipped (admin must already exist in DB).",
  );
} else {
  runSeed();
  console.log(
    "[bootstrap] Seed checked (if no admin in DB, one was created from env).",
  );
}
