import { parseIsoDateParts } from "./date-format.js";

/**
 * Упрощённая привязка к григорианскому году: животное по году даты без сдвига
 * на китайский Новый год (достаточно для MVP).
 *
 * Цикл синхронизирован так, что **2024** — год **Дракона** (как в распространённой
 * таблице «год − 4» mod 12, 1984 — Крыса).
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

/** Животное по дате `YYYY-MM-DD` (берётся календарный год даты). */
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
