import { parseIsoDateParts } from "./date-format.js";

function partsFromDate(d: Date): { year: number; month: number; day: number } {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

/**
 * Full years on a calendar date (if birthday has not occurred yet this year, subtract one).
 * If death date is set, age is as of that day; otherwise as of `asOf` or “today”.
 */
export function computeAgeYears(
  birthIso: string | null | undefined,
  options?: {
    deathIso?: string | null;
    /** Defaults to local calendar date from `new Date()`. */
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
