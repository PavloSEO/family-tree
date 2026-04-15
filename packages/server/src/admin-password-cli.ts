/**
 * Сброс пароля пользователя по логину (по умолчанию — первый admin).
 *
 * Переменная окружения **NEW_ADMIN_PASSWORD** — новый пароль, не короче 8 символов (отдельно от **ADMIN_PASSWORD** seed).
 *
 * Пример:
 * `NEW_ADMIN_PASSWORD='новый-секрет' node dist/admin-password-cli.js`
 * `NEW_ADMIN_PASSWORD='...' node dist/admin-password-cli.js --login viewer1`
 */
import "./bootstrap.js";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "./db/connection.js";
import { users } from "./db/schema.js";

const BCRYPT_COST = 12;

function argLogin(): string | undefined {
  const a = process.argv.find((x) => x.startsWith("--login="));
  return a?.slice("--login=".length)?.trim() || undefined;
}

function newPasswordFromEnv(): string {
  const p = process.env.NEW_ADMIN_PASSWORD?.trim() ?? "";
  if (p.length < 8) {
    throw new Error(
      "Задайте NEW_ADMIN_PASSWORD длиной не менее 8 символов.",
    );
  }
  return p;
}

const loginTarget = argLogin() ?? process.env.ADMIN_LOGIN?.trim() ?? "admin";

const rows = db
  .select()
  .from(users)
  .where(eq(users.login, loginTarget))
  .limit(1)
  .all();

if (rows.length === 0) {
  console.error(`Пользователь с логином «${loginTarget}» не найден.`);
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(newPasswordFromEnv(), BCRYPT_COST);
db.update(users)
  .set({ passwordHash })
  .where(eq(users.login, loginTarget))
  .run();

console.log(`Пароль обновлён для логина «${loginTarget}».`);
