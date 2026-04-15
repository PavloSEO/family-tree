import { z } from "zod";
import { sqliteTimestampSchema, uuidSchema } from "./common.js";

export const userRoleSchema = z.enum(["admin", "viewer"]);

export const userStatusSchema = z.enum(["active", "disabled"]);

/** Пользователь в API (без пароля) */
export const userPublicSchema = z.object({
  id: uuidSchema,
  login: z.string().min(1),
  role: userRoleSchema,
  linkedPersonId: uuidSchema.nullable(),
  status: userStatusSchema,
  createdAt: sqliteTimestampSchema,
  lastLoginAt: z.string().nullable(),
});

export type User = z.infer<typeof userPublicSchema>;

/** Хранение в БД / внутренние проверки сервера */
export const userRowSchema = userPublicSchema.extend({
  passwordHash: z.string().min(1),
});

export type UserRow = z.infer<typeof userRowSchema>;

export const userCreateSchema = z.object({
  login: z.string().min(1).max(64),
  password: z.string().min(8).max(256),
  role: userRoleSchema,
  linkedPersonId: uuidSchema.nullable().optional(),
  status: userStatusSchema.optional(),
});

export type UserCreate = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  login: z.string().min(1).max(64).optional(),
  password: z.string().min(8).max(256).optional(),
  role: userRoleSchema.optional(),
  linkedPersonId: uuidSchema.nullable().optional(),
  status: userStatusSchema.optional(),
});

export type UserUpdate = z.infer<typeof userUpdateSchema>;
