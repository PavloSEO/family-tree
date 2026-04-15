import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import { verifyToken, type JwtRole } from "../services/auth.service.js";

/** Пользователь в контексте после успешной проверки JWT и БД (`docs/07-auth.md`). */
export type AuthUser = {
  id: string;
  login: string;
  role: JwtRole;
  linkedPersonId: string | null;
  status: "active";
  createdAt: string;
  lastLoginAt: string | null;
};

/**
 * Проверка `Authorization: Bearer <token>`, JWT, пользователь в БД, статус **active**.
 * Кладёт **`user`** в контекст.
 */
export const requireAuth = createMiddleware<{
  Variables: {
    user: AuthUser;
  };
}>(async (c, next) => {
  const header = c.req.header("Authorization")?.trim();
  if (!header?.toLowerCase().startsWith("bearer ")) {
    return c.json({ error: "Требуется авторизация" }, 401);
  }

  const rawToken = header.slice(7).trim();
  if (!rawToken) {
    return c.json({ error: "Требуется авторизация" }, 401);
  }

  let payload: Awaited<ReturnType<typeof verifyToken>>;
  try {
    payload = await verifyToken(rawToken);
  } catch {
    return c.json({ error: "Невалидный токен" }, 401);
  }

  const [user] = db
    .select({
      id: users.id,
      login: users.login,
      role: users.role,
      linkedPersonId: users.linkedPersonId,
      status: users.status,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1)
    .all();

  if (!user) {
    return c.json({ error: "Невалидный токен" }, 401);
  }

  if (user.role !== payload.role) {
    return c.json({ error: "Невалидный токен" }, 401);
  }

  if (user.status === "disabled") {
    return c.json({ error: "Доступ приостановлен" }, 403);
  }

  c.set("user", {
    id: user.id,
    login: user.login,
    role: user.role as JwtRole,
    linkedPersonId: user.linkedPersonId,
    status: "active",
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  });

  await next();
});

/** Только после `requireAuth`. Роль **admin**, иначе 403. */
export const requireAdmin = createMiddleware<{
  Variables: {
    user: AuthUser;
  };
}>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Требуется авторизация" }, 401);
  }
  if (user.role !== "admin") {
    return c.json({ error: "Доступ запрещён" }, 403);
  }
  await next();
});
