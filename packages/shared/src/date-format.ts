/** Парсинг даты `YYYY-MM-DD` (опционально с суффиксом времени после `T`). */
export function parseIsoDateParts(
  iso: string,
): { year: number; month: number; day: number } | null {
  const head = iso.trim().split("T")[0] ?? "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(head);
  if (!m) {
    return null;
  }
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!isValidCalendarDate(year, month, day)) {
    return null;
  }
  return { year, month, day };
}

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function isValidCalendarDate(y: number, mo: number, d: number): boolean {
  if (mo < 1 || mo > 12 || d < 1) {
    return false;
  }
  const dim = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const max =
    mo === 2 && isLeapYear(y) ? 29 : dim[mo - 1] ?? 0;
  return d <= max;
}

/** `DD.MM.YYYY` или `null`, если строка пустая / невалидна. */
export function formatDateRu(
  iso: string | null | undefined,
): string | null {
  if (iso == null || String(iso).trim() === "") {
    return null;
  }
  const p = parseIsoDateParts(String(iso));
  if (!p) {
    return null;
  }
  const dd = String(p.day).padStart(2, "0");
  const mm = String(p.month).padStart(2, "0");
  return `${dd}.${mm}.${p.year}`;
}

/** Для `Intl` — полдень UTC, чтобы не сдвигать календарный день из-за TZ. */
function utcNoonFromParts(p: {
  year: number;
  month: number;
  day: number;
}): Date | null {
  if (!isValidCalendarDate(p.year, p.month, p.day)) {
    return null;
  }
  return new Date(Date.UTC(p.year, p.month - 1, p.day, 12, 0, 0));
}

/** Длинная дата по-русски, например «14 апреля 2026 г.». */
export function formatDateLongRu(
  iso: string | null | undefined,
): string | null {
  if (iso == null || String(iso).trim() === "") {
    return null;
  }
  const p = parseIsoDateParts(String(iso));
  if (!p) {
    return null;
  }
  const d = utcNoonFromParts(p);
  if (!d) {
    return null;
  }
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
