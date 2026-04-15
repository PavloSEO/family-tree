import { describe, expect, it } from "vitest";
import {
  chineseZodiacAnimalFromIso,
  chineseZodiacAnimalFromYear,
} from "./chinese-year.js";

describe("chineseZodiacAnimalFromYear", () => {
  it("2024 — Дракон", () => {
    expect(chineseZodiacAnimalFromYear(2024)).toBe("Дракон");
  });

  it("1984 — Крыса (якорь цикла)", () => {
    expect(chineseZodiacAnimalFromYear(1984)).toBe("Крыса");
  });

  it("цикл из 12 лет", () => {
    expect(chineseZodiacAnimalFromYear(1985)).toBe("Бык");
    expect(chineseZodiacAnimalFromYear(1986)).toBe("Тигр");
  });
});

describe("chineseZodiacAnimalFromIso", () => {
  it("берёт год из даты", () => {
    expect(chineseZodiacAnimalFromIso("2024-01-15")).toBe("Дракон");
  });

  it("null при невалидной дате", () => {
    expect(chineseZodiacAnimalFromIso(null)).toBeNull();
    expect(chineseZodiacAnimalFromIso("x")).toBeNull();
  });
});
