import { describe, expect, it } from "vitest";
import {
  chineseZodiacAnimalFromIso,
  chineseZodiacAnimalFromYear,
} from "./chinese-year.js";

describe("chineseZodiacAnimalFromYear", () => {
  it("2024 is Dragon", () => {
    expect(chineseZodiacAnimalFromYear(2024)).toBe("Дракон");
  });

  it("1984 is Rat (cycle anchor)", () => {
    expect(chineseZodiacAnimalFromYear(1984)).toBe("Крыса");
  });

  it("12-year cycle", () => {
    expect(chineseZodiacAnimalFromYear(1985)).toBe("Бык");
    expect(chineseZodiacAnimalFromYear(1986)).toBe("Тигр");
  });
});

describe("chineseZodiacAnimalFromIso", () => {
  it("uses year from date", () => {
    expect(chineseZodiacAnimalFromIso("2024-01-15")).toBe("Дракон");
  });

  it("returns null for invalid date", () => {
    expect(chineseZodiacAnimalFromIso(null)).toBeNull();
    expect(chineseZodiacAnimalFromIso("x")).toBeNull();
  });
});
