import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import type { AuthUser } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import {
  countRecentFailedLogins,
  getRateLimitMaxAttempts,
  getRateLimitWindowMinutes,
  getRequestIp,
  purgeOldLoginAttempts,
  recordLoginAttempt,
} from "../services/login-rate-limit.service.js";
import {
  signToken,
  verifyPassword,
  type JwtRole,
} from "../services/auth.service.js";

const loginBodySchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
  remember: z.boolean().default(false),
});

type UserRow = typeof users.$inferSelect;

function toPublicUser(row: UserRow) {
  return {
    id: row.id,
    login: row.login,
    role: row.role,
    linkedPersonId: row.linkedPersonId,
    status: row.status,
    createdAt: row.createdAt,
    lastLoginAt: row.lastLoginAt,
  };
}

export const authRoutes = new Hono<{ Variables: { user: AuthUser } }>();

/** POST /api/auth/login — ROADMAP 08, `docs/06-api.md` (response `{ token, user }`). */
authRoutes.post("/login", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Некорректное тело запроса" }, 400);
  }

  const parsed = loginBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Некорректное тело запроса" }, 400);
  }

  const { login, password, remember } = parsed.data;
  const ip = getRequestIp(c);

  purgeOldLoginAttempts();

  const maxAttempts = getRateLimitMaxAttempts();
  const windowMinutes = getRateLimitWindowMinutes();
  if (countRecentFailedLogins(ip) >= maxAttempts) {
    recordLoginAttempt({ ip, login, success: false });
    return c.json(
      {
        error: `Слишком много попыток. Попробуйте через ${windowMinutes} минут.`,
      },
      429,
    );
  }

  const [user] = db
    .select()
    .from(users)
    .where(eq(users.login, login))
    .limit(1)
    .all();

  const okPassword =
    user && (await verifyPassword(password, user.passwordHash));

  if (!user || !okPassword) {
    recordLoginAttempt({ ip, login, success: false });
    return c.json({ error: "Неверный логин или пароль" }, 401);
  }

  if (user.status === "disabled") {
    recordLoginAttempt({ ip, login, success: false });
    return c.json({ error: "Доступ приостановлен" }, 403);
  }

  const role = user.role as JwtRole;
  let token: string;
  try {
    token = await signToken({
      sub: user.id,
      role,
      remember,
    });
  } catch {
    recordLoginAttempt({ ip, login, success: false });
    return c.json({ error: "Сервер не настроен для выдачи токенов" }, 500);
  }

  db.update(users)
    .set({ lastLoginAt: sql`(datetime('now'))` })
    .where(eq(users.id, user.id))
    .run();

  recordLoginAttempt({ ip, login, success: true });

  return c.json({
    token,
    user: toPublicUser(user),
  });
});

/** GET /api/auth/me — via `requireAuth`, response `{ user }`. */
authRoutes.get("/me", requireAuth, (c) => {
  return c.json({ user: c.get("user") });
});
