import { parseIsoDateParts } from "./date-format.js";

/**
 * Simplified Gregorian-year mapping: animal from the calendar year of the date,
 * without shifting for Chinese New Year (MVP).
 *
 * Cycle aligned so **2024** is **Dragon** (common “year − 4” mod 12 table; 1984 — Rat).
 */
export const CHINESE_ZODIAC_ANIMALS_RU = [
  "Крыса",
  "Бык",
  "Тигр",
  "Кролик",
  "Дракон",
  "Змея",
  "Лошадь",
  "Коза",
  "Обезьяна",
  "Петух",
  "Собака",
  "Свинья",
] as const;

export type ChineseZodiacAnimalRu =
  (typeof CHINESE_ZODIAC_ANIMALS_RU)[number];

export function chineseZodiacAnimalFromYear(
  year: number,
): ChineseZodiacAnimalRu {
  if (!Number.isFinite(year)) {
    return CHINESE_ZODIAC_ANIMALS_RU[0]!;
  }
  const y = Math.trunc(year);
  const i = ((y - 4) % 12) + 12;
  return CHINESE_ZODIAC_ANIMALS_RU[i % 12]!;
}

/** Animal from `YYYY-MM-DD` (uses the calendar year of the date). */
export function chineseZodiacAnimalFromIso(
  isoDate: string | null | undefined,
): ChineseZodiacAnimalRu | null {
  if (isoDate == null || String(isoDate).trim() === "") {
    return null;
  }
  const p = parseIsoDateParts(String(isoDate));
  if (!p) {
    return null;
  }
  return chineseZodiacAnimalFromYear(p.year);
}
