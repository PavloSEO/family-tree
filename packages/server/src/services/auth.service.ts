import bcrypt from "bcryptjs";
import * as jose from "jose";

const BCRYPT_COST = 12;

export type JwtRole = "admin" | "viewer";

/** Payload доступа после проверки JWT (см. `docs/07-auth.md`). */
export type AppJwtPayload = {
  sub: string;
  role: JwtRole;
  iat: number;
  exp: number;
};

function getJwtSecretKey(): Uint8Array {
  const raw = process.env.JWT_SECRET?.trim();
  if (!raw || raw.length < 32) {
    throw new Error(
      "JWT_SECRET должен быть задан и не короче 32 символов (см. docs/07-auth.md).",
    );
  }
  return new TextEncoder().encode(raw);
}

function getSessionTtlDays(): number {
  const v = Number(process.env.SESSION_TTL_DAYS ?? 30);
  return Number.isFinite(v) && v > 0 ? v : 30;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hashSync(password, BCRYPT_COST);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compareSync(password, passwordHash);
}

function toJwtRole(value: unknown): JwtRole {
  if (value === "admin" || value === "viewer") {
    return value;
  }
  throw new Error("Невалидная роль в токене");
}

function claimToUnixSeconds(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  throw new Error("Невалидные поля iat/exp в токене");
}

/**
 * Подписывает JWT (HS256).
 * TTL: при `remember === true` — `SESSION_TTL_DAYS` (по умолчанию 30 суток), иначе 24 часа.
 */
export async function signToken(params: {
  sub: string;
  role: JwtRole;
  remember?: boolean;
}): Promise<string> {
  const secret = getJwtSecretKey();
  const remember = params.remember ?? false;
  const expiration = remember ? `${getSessionTtlDays()}d` : "24h";

  const jwt = await new jose.SignJWT({ role: params.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(params.sub)
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(secret);

  return jwt;
}

/** Проверяет JWT и возвращает стандартизированный payload. */
export async function verifyToken(token: string): Promise<AppJwtPayload> {
  const secret = getJwtSecretKey();
  const { payload } = await jose.jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  const sub = payload.sub;
  if (!sub) {
    throw new Error("В токене отсутствует sub");
  }

  const role = toJwtRole(payload.role);
  const iat = claimToUnixSeconds(payload.iat);
  const exp = claimToUnixSeconds(payload.exp);

  return { sub, role, iat, exp };
}
