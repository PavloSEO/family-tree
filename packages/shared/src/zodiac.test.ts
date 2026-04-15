import { describe, expect, it } from "vitest";
import { westernZodiacFromIso } from "./zodiac.js";

describe("westernZodiacFromIso", () => {
  it("Овен — граница весны", () => {
    expect(westernZodiacFromIso("2000-03-21")).toBe("Овен");
    expect(westernZodiacFromIso("2000-04-19")).toBe("Овен");
  });

  it("Козерог — через новый год", () => {
    expect(westernZodiacFromIso("1990-12-25")).toBe("Козерог");
    expect(westernZodiacFromIso("1991-01-10")).toBe("Козерог");
  });

  it("Рыбы — конец февраля", () => {
    expect(westernZodiacFromIso("2015-03-01")).toBe("Рыбы");
  });

  it("null при пустой или невалидной дате", () => {
    expect(westernZodiacFromIso(null)).toBeNull();
    expect(westernZodiacFromIso("")).toBeNull();
    expect(westernZodiacFromIso("bad")).toBeNull();
  });
});
