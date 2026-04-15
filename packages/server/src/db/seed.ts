import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { userCreateSchema } from "@family-tree/shared";
import { eq } from "drizzle-orm";
import { db } from "./connection.js";
import { users } from "./schema.js";

const BCRYPT_COST = 12;

/**
 * Создаёт первого admin из `ADMIN_LOGIN` / `ADMIN_PASSWORD`, если в БД ещё нет пользователя с ролью `admin`.
 * Если admin уже есть — ничего не делает.
 * Если admin нет и переменные окружения не заданы — выбрасывает ошибку (первый запуск).
 */
export function runSeed(): void {
  const existingAdmin = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1)
    .all();

  if (existingAdmin.length > 0) {
    return;
  }

  const login = process.env.ADMIN_LOGIN?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!login || !password) {
    throw new Error(
      "Нет пользователя admin в БД: задайте ADMIN_LOGIN и ADMIN_PASSWORD в окружении для первого запуска.",
    );
  }

  const parsed = userCreateSchema.safeParse({
    login,
    password,
    role: "admin",
  });
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    throw new Error(
      `ADMIN_LOGIN / ADMIN_PASSWORD не проходят валидацию (как при создании пользователя через API): ${msg}`,
    );
  }

  const passwordHash = bcrypt.hashSync(parsed.data.password, BCRYPT_COST);

  db.insert(users)
    .values({
      id: randomUUID(),
      login: parsed.data.login,
      passwordHash,
      role: "admin",
      linkedPersonId: null,
      status: "active",
      lastLoginAt: null,
    })
    .run();
}
