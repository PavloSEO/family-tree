/** M3 elevation-2 для корневой ноды (`docs/08-tree-visualization.md`). */
export const treeRootNodeBoxShadow =
  "0px 1px 2px 0px color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent), 0px 2px 6px 2px color-mix(in srgb, var(--md-sys-color-shadow) 15%, transparent)";

/** Год из ISO-даты или префикса `YYYY-MM-DD`. */
function yearPart(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  const s = String(value).trim();
  if (s.length < 4) {
    return null;
  }
  const y = s.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : null;
}

export function formatYearsLabel(
  dateOfBirth: string | null,
  dateOfDeath: string | null,
): string {
  const by = yearPart(dateOfBirth);
  const dy = yearPart(dateOfDeath);
  if (by && dy) {
    return `(${by}–${dy})`;
  }
  if (by) {
    return `(${by}–)`;
  }
  return "(—)";
}

/** Флаг-эмодзи по ISO 3166-1 alpha-2 (если известен). */
export function countryFlagEmoji(country: string | null): string {
  if (country == null || country.length !== 2) {
    return "";
  }
  const upper = country.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) {
    return "";
  }
  const base = 0x1f1e6;
  const a = upper.codePointAt(0);
  const b = upper.codePointAt(1);
  if (a == null || b == null) {
    return "";
  }
  return String.fromCodePoint(base + (a - 65), base + (b - 65));
}
