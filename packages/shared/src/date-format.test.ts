import { describe, expect, it } from "vitest";
import {
  formatDateLongRu,
  formatDateRu,
  parseIsoDateParts,
} from "./date-format.js";

describe("parseIsoDateParts", () => {
  it("парсит YYYY-MM-DD", () => {
    expect(parseIsoDateParts("2026-04-14")).toEqual({
      year: 2026,
      month: 4,
      day: 14,
    });
  });

  it("отсекает время после T", () => {
    expect(parseIsoDateParts("1999-12-31T23:59:59Z")).toEqual({
      year: 1999,
      month: 12,
      day: 31,
    });
  });

  it("отклоняет 29 февраля в невисокосный год", () => {
    expect(parseIsoDateParts("2023-02-29")).toBeNull();
  });

  it("принимает 29 февраля в високосный год", () => {
    expect(parseIsoDateParts("2024-02-29")).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });

  it("отклоняет мусор", () => {
    expect(parseIsoDateParts("not-a-date")).toBeNull();
    expect(parseIsoDateParts("2026-13-01")).toBeNull();
  });
});

describe("formatDateRu", () => {
  it("форматирует в DD.MM.YYYY", () => {
    expect(formatDateRu("2026-04-14")).toBe("14.04.2026");
  });

  it("возвращает null для пустых значений", () => {
    expect(formatDateRu(null)).toBeNull();
    expect(formatDateRu("")).toBeNull();
    expect(formatDateRu("   ")).toBeNull();
  });
});

describe("formatDateLongRu", () => {
  it("возвращает строку с месяцем по-русски", () => {
    const s = formatDateLongRu("2026-04-14");
    expect(s).toBeTruthy();
    expect(s).toMatch(/2026/);
    expect(s?.toLowerCase()).toMatch(/апрел/);
  });
});
