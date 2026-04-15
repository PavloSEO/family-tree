import { z } from "zod";

/** Дата в формате YYYY-MM-DD (колонки SQLite `*_date` в ТЗ) */
export const isoDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ожидается дата ISO: YYYY-MM-DD");

export const nullableIsoDateStringSchema = isoDateStringSchema.nullable();

/** ISO 3166-1 alpha-2 */
export const countryCodeSchema = z
  .string()
  .length(2)
  .regex(/^[A-Za-z]{2}$/, "Код страны: две латинские буквы")
  .transform((s) => s.toUpperCase());

export const uuidSchema = z.string().uuid();

/** Метки времени из SQLite (`datetime('now')` и т.п.) — непустая строка */
export const sqliteTimestampSchema = z.string().min(1);
