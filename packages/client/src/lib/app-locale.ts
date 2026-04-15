import i18n from "../i18n.js";

function isRuUi(): boolean {
  return (i18n.language ?? "").toLowerCase().startsWith("ru");
}

/** BCP 47 for `Date#toLocaleString` / `Intl.*` (UI ru → ru-RU, en → en-US). */
export function getAppDateLocale(): string {
  return isRuUi() ? "ru-RU" : "en-US";
}

/**
 * Short tag for `String#localeCompare` (ru / en) — follows UI language (§17).
 * Not for person first/last name ordering; use {@link getFamilyNameSortLocale} / {@link comparePersonNames} (§18).
 */
export function getAppCollatorLocale(): string {
  return isRuUi() ? "ru" : "en";
}

/**
 * §18: Person names in the DB stay as stored; sort order for **family** names uses Russian collation even when
 * the UI is English, so relatives see the same ordering as in a Russian-only app.
 */
export function getFamilyNameSortLocale(): "ru" {
  return "ru";
}

/** Deterministic order: last name, then first name (tree search, simple rank layout, etc.). */
export function comparePersonNames(
  a: { firstName: string; lastName: string },
  b: { firstName: string; lastName: string },
): number {
  const loc = getFamilyNameSortLocale();
  const byLast = a.lastName.localeCompare(b.lastName, loc);
  return byLast !== 0 ? byLast : a.firstName.localeCompare(b.firstName, loc);
}
