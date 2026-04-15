import { and, desc, eq, ne, sql } from "drizzle-orm";
import type { User } from "@family-tree/shared";
import {
  userCreateSchema,
  userPublicSchema,
  userUpdateSchema,
} from "@family-tree/shared";
import { z } from "zod";
import { db } from "../db/connection.js";
import { persons, users } from "../db/schema.js";
import { hashPassword } from "./auth.service.js";

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`Пользователь не найден: ${id}`);
    this.name = "UserNotFoundError";
  }
}

export class DuplicateLoginError extends Error {
  constructor(login: string) {
    super(`Логин уже занят: ${login}`);
    this.name = "DuplicateLoginError";
  }
}

export class SecondAdminError extends Error {
  constructor() {
    super("В системе может быть только один администратор");
    this.name = "SecondAdminError";
  }
}

export class LastAdminError extends Error {
  constructor() {
    super("Нельзя удалить или лишить прав последнего администратора");
    this.name = "LastAdminError";
  }
}

export class SelfActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SelfActionError";
  }
}

type UserRow = typeof users.$inferSelect;

function mapUser(row: UserRow): User {
  return userPublicSchema.parse({
    id: row.id,
    login: row.login,
    role: row.role,
    linkedPersonId: row.linkedPersonId ?? null,
    status: row.status,
    createdAt: row.createdAt,
    lastLoginAt: row.lastLoginAt ?? null,
  });
}

async function countAdmins(excludeUserId?: string): Promise<number> {
  const where =
    excludeUserId === undefined
      ? eq(users.role, "admin")
      : and(eq(users.role, "admin"), ne(users.id, excludeUserId));
  const rows = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(users)
    .where(where);
  return rows[0]?.n ?? 0;
}

async function assertPersonExists(personId: string | null | undefined): Promise<void> {
  if (personId == null) {
    return;
  }
  const p = await db.query.persons.findFirst({
    where: eq(persons.id, personId),
    columns: { id: true },
  });
  if (!p) {
    throw new Error("Указанная карточка не найдена");
  }
}

export async function listUsers(): Promise<User[]> {
  const rows = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });
  return rows.map(mapUser);
}

export async function getUserById(id: string): Promise<User | null> {
  const row = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return row ? mapUser(row) : null;
}

export async function createUser(raw: unknown): Promise<User> {
  const input = userCreateSchema.parse(raw);
  const login = input.login.trim();
  if (login.length === 0) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        message: "Пустой логин",
        path: ["login"],
      },
    ]);
  }

  if (input.role === "admin" && (await countAdmins()) >= 1) {
    throw new SecondAdminError();
  }

  await assertPersonExists(input.linkedPersonId ?? null);

  const dup = await db.query.users.findFirst({
    where: eq(users.login, login),
    columns: { id: true },
  });
  if (dup) {
    throw new DuplicateLoginError(login);
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(input.password);
  const status = input.status ?? "active";
  const now = sql`(datetime('now'))`;

  try {
    await db.insert(users).values({
      id,
      login,
      passwordHash,
      role: input.role,
      linkedPersonId: input.linkedPersonId ?? null,
      status,
      createdAt: now,
      lastLoginAt: null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("unique")) {
      throw new DuplicateLoginError(login);
    }
    throw e;
  }

  const created = await getUserById(id);
  if (!created) {
    throw new Error("Не удалось создать пользователя");
  }
  return created;
}

export async function updateUser(
  id: string,
  raw: unknown,
  actorUserId: string,
): Promise<User> {
  const existing = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  if (!existing) {
    throw new UserNotFoundError(id);
  }

  const patch = userUpdateSchema.parse(raw);
  if (Object.keys(patch).length === 0) {
    return mapUser(existing);
  }

  if (patch.linkedPersonId !== undefined) {
    await assertPersonExists(patch.linkedPersonId);
  }

  const nextLogin = patch.login !== undefined ? patch.login.trim() : existing.login;
  if (nextLogin.length === 0) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        message: "Пустой логин",
        path: ["login"],
      },
    ]);
  }

  if (patch.login !== undefined && patch.login.trim() !== existing.login) {
    const dup = await db.query.users.findFirst({
      where: eq(users.login, nextLogin),
      columns: { id: true },
    });
    if (dup && dup.id !== id) {
      throw new DuplicateLoginError(nextLogin);
    }
  }

  const nextRole = patch.role ?? existing.role;
  const nextStatus = patch.status ?? existing.status;

  if (nextRole === "admin" && existing.role !== "admin") {
    if ((await countAdmins()) >= 1) {
      throw new SecondAdminError();
    }
  }

  if (existing.role === "admin" && nextRole !== "admin") {
    if ((await countAdmins(id)) < 1) {
      throw new LastAdminError();
    }
  }

  if (existing.role === "admin" && nextStatus === "disabled") {
    if ((await countAdmins(id)) < 1) {
      throw new LastAdminError();
    }
  }

  if (id === actorUserId) {
    if (patch.status === "disabled") {
      throw new SelfActionError("Нельзя деактивировать свою учётную запись");
    }
    if (patch.role === "viewer" && existing.role === "admin") {
      throw new SelfActionError("Нельзя снять с себя роль администратора");
    }
  }

  const passwordHash =
    patch.password !== undefined
      ? await hashPassword(patch.password)
      : undefined;

  await db
    .update(users)
    .set({
      ...(patch.login !== undefined ? { login: nextLogin } : {}),
      ...(passwordHash !== undefined ? { passwordHash } : {}),
      ...(patch.role !== undefined ? { role: patch.role } : {}),
      ...(patch.linkedPersonId !== undefined
        ? { linkedPersonId: patch.linkedPersonId }
        : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    })
    .where(eq(users.id, id));

  const updated = await getUserById(id);
  if (!updated) {
    throw new UserNotFoundError(id);
  }
  return updated;
}

export async function deleteUser(id: string, actorUserId: string): Promise<void> {
  if (id === actorUserId) {
    throw new SelfActionError("Нельзя удалить свою учётную запись");
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  if (!existing) {
    throw new UserNotFoundError(id);
  }

  if (existing.role === "admin" && (await countAdmins(id)) < 1) {
    throw new LastAdminError();
  }

  await db.delete(users).where(eq(users.id, id));
}
