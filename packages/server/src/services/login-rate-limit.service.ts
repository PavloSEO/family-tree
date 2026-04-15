import { randomUUID } from "node:crypto";
import type { Context } from "hono";
import { getConnInfo } from "@hono/node-server/conninfo";
import { and, eq, gt, sql } from "drizzle-orm";
import { db, sqlite } from "../db/connection.js";
import { loginAttempts } from "../db/schema.js";

export function getRateLimitMaxAttempts(): number {
  const n = Number(process.env.RATE_LIMIT_MAX_ATTEMPTS ?? 5);
  return Number.isFinite(n) && n > 0 ? Math.min(1000, n) : 5;
}

export function getRateLimitWindowMinutes(): number {
  const n = Number(process.env.RATE_LIMIT_WINDOW_MINUTES ?? 15);
  return Number.isFinite(n) && n > 0 ? Math.min(1440, n) : 15;
}

/** IP клиента (прокси или сокет). */
export function getRequestIp(c: Context): string {
  const xff = c.req.header("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) {
      return first.slice(0, 256);
    }
  }
  const xri = c.req.header("x-real-ip")?.trim();
  if (xri) {
    return xri.slice(0, 256);
  }
  try {
    const addr = getConnInfo(c)?.remote?.address;
    if (addr) {
      return addr.slice(0, 256);
    }
  } catch {
    /* не Node / нет conninfo */
  }
  return "unknown";
}

function sqliteCutoffIso(): string {
  const m = getRateLimitWindowMinutes();
  const row = sqlite
    .prepare("SELECT datetime('now', ?) AS t")
    .get(`-${m} minutes`) as { t: string };
  return row.t;
}

/** Число неудачных попыток с данного IP за окно (`docs/07-auth.md`). */
export function countRecentFailedLogins(ip: string): number {
  const cutoff = sqliteCutoffIso();
  const rows = db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.ip, ip),
        eq(loginAttempts.success, false),
        gt(loginAttempts.attemptedAt, cutoff),
      ),
    )
    .all();
  return rows[0]?.count ?? 0;
}

export function recordLoginAttempt(params: {
  ip: string;
  login: string;
  success: boolean;
}): void {
  const attemptedAt = (
    sqlite.prepare("SELECT datetime('now') AS t").get() as { t: string }
  ).t;
  db.insert(loginAttempts)
    .values({
      id: randomUUID(),
      ip: params.ip.slice(0, 256),
      login: params.login.slice(0, 256),
      attemptedAt,
      success: params.success,
    })
    .run();
}

/** Удаляет записи старше 24 часов (`docs/07-auth.md`). */
export function purgeOldLoginAttempts(): void {
  sqlite
    .prepare(
      "DELETE FROM login_attempts WHERE attempted_at < datetime('now', '-24 hours')",
    )
    .run();
}
