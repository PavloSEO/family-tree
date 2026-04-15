import { parseIsoDateParts } from "./date-format.js";

function partsFromDate(d: Date): { year: number; month: number; day: number } {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

/**
 * Полных лет на дату «как есть» (день рождения ещё не наступил в этом году — минус год).
 * Если указана дата смерти, возраст считается на этот день; иначе — на `asOf` или «сегодня».
 */
export function computeAgeYears(
  birthIso: string | null | undefined,
  options?: {
    deathIso?: string | null;
    /** По умолчанию — локальная дата `new Date()` пользователя/среды. */
    asOf?: Date;
  },
): number | null {
  if (birthIso == null || String(birthIso).trim() === "") {
    return null;
  }
  const birth = parseIsoDateParts(String(birthIso));
  if (!birth) {
    return null;
  }

  let endParts: { year: number; month: number; day: number };
  if (options?.deathIso != null && String(options.deathIso).trim() !== "") {
    const death = parseIsoDateParts(String(options.deathIso));
    if (!death) {
      return null;
    }
    endParts = death;
  } else {
    endParts = partsFromDate(options?.asOf ?? new Date());
  }

  if (
    endParts.year < birth.year ||
    (endParts.year === birth.year &&
      (endParts.month < birth.month ||
        (endParts.month === birth.month && endParts.day < birth.day)))
  ) {
    return null;
  }

  let age = endParts.year - birth.year;
  if (
    endParts.month < birth.month ||
    (endParts.month === birth.month && endParts.day < birth.day)
  ) {
    age -= 1;
  }
  return age;
}
