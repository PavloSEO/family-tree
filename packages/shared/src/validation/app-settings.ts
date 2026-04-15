import { z } from "zod";
import { uuidSchema } from "./common.js";

export const SETTINGS_KEYS = [
  "siteName",
  "defaultRootPersonId",
  "defaultDepthUp",
  "defaultDepthDown",
  "showExternalBranches",
  "externalBranchDepth",
  "accentColor",
  "sessionTtlDays",
] as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[number];

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Цвет: формат #RRGGBB");

/** Полный объект настроек (ответ GET и внутренняя модель). */
export const appSettingsSchema = z.object({
  siteName: z.string().min(1).max(200),
  defaultRootPersonId: uuidSchema.nullable(),
  defaultDepthUp: z.number().int().min(0).max(20),
  defaultDepthDown: z.number().int().min(0).max(20),
  showExternalBranches: z.boolean(),
  externalBranchDepth: z.number().int().min(0).max(20),
  accentColor: hexColorSchema,
  sessionTtlDays: z.number().int().min(1).max(365),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

/** Тело PUT: только известные поля, все опциональны. */
export const appSettingsPatchSchema = z
  .object({
    siteName: z.string().min(1).max(200).optional(),
    defaultRootPersonId: uuidSchema.nullable().optional(),
    defaultDepthUp: z.coerce.number().int().min(0).max(20).optional(),
    defaultDepthDown: z.coerce.number().int().min(0).max(20).optional(),
    showExternalBranches: z.boolean().optional(),
    externalBranchDepth: z.coerce.number().int().min(0).max(20).optional(),
    accentColor: hexColorSchema.optional(),
    sessionTtlDays: z.coerce.number().int().min(1).max(365).optional(),
  })
  .strict();

export type AppSettingsPatch = z.infer<typeof appSettingsPatchSchema>;
