import { parseIsoDateParts } from "./date-format.js";

/** Tropical zodiac sign names (Russian product default; see `to-do/english-migration-notes.md`). */
export const WESTERN_ZODIAC_SIGNS_RU = [
  "Овен",
  "Телец",
  "Близнецы",
  "Рак",
  "Лев",
  "Дева",
  "Весы",
  "Скорпион",
  "Стрелец",
  "Козерог",
  "Водолей",
  "Рыбы",
] as const;

export type WesternZodiacSignRu = (typeof WESTERN_ZODIAC_SIGNS_RU)[number];

type Span = { fromM: number; fromD: number; toM: number; toD: number };

/** Inclusive [from, to] month/day spans; array order = sign index. */
const SPANS: Span[] = [
  { fromM: 3, fromD: 21, toM: 4, toD: 19 },
  { fromM: 4, fromD: 20, toM: 5, toD: 20 },
  { fromM: 5, fromD: 21, toM: 6, toD: 20 },
  { fromM: 6, fromD: 21, toM: 7, toD: 22 },
  { fromM: 7, fromD: 23, toM: 8, toD: 22 },
  { fromM: 8, fromD: 23, toM: 9, toD: 22 },
  { fromM: 9, fromD: 23, toM: 10, toD: 22 },
  { fromM: 10, fromD: 23, toM: 11, toD: 21 },
  { fromM: 11, fromD: 22, toM: 12, toD: 21 },
  { fromM: 12, fromD: 22, toM: 1, toD: 19 },
  { fromM: 1, fromD: 20, toM: 2, toD: 18 },
  { fromM: 2, fromD: 19, toM: 3, toD: 20 },
];

function dayKey(m: number, d: number): number {
  return m * 100 + d;
}

function inSpan(m: number, d: number, s: Span): boolean {
  const key = dayKey(m, d);
  const from = dayKey(s.fromM, s.fromD);
  const to = dayKey(s.toM, s.toD);
  if (from <= to) {
    return key >= from && key <= to;
  }
  return key >= from || key <= to;
}

/** Western (tropical) sign from birth date `YYYY-MM-DD`. */
export function westernZodiacFromIso(
  isoDate: string | null | undefined,
): WesternZodiacSignRu | null {
  if (isoDate == null || String(isoDate).trim() === "") {
    return null;
  }
  const p = parseIsoDateParts(String(isoDate));
  if (!p) {
    return null;
  }
  for (let i = 0; i < SPANS.length; i++) {
    if (inSpan(p.month, p.day, SPANS[i]!)) {
      return WESTERN_ZODIAC_SIGNS_RU[i]!;
    }
  }
  return null;
}
