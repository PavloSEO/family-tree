import { describe, expect, it } from "vitest";
import { westernZodiacFromIso } from "./zodiac.js";

describe("westernZodiacFromIso", () => {
  it("Aries — spring boundary", () => {
    expect(westernZodiacFromIso("2000-03-21")).toBe("Овен");
    expect(westernZodiacFromIso("2000-04-19")).toBe("Овен");
  });

  it("Capricorn — across new year", () => {
    expect(westernZodiacFromIso("1990-12-25")).toBe("Козерог");
    expect(westernZodiacFromIso("1991-01-10")).toBe("Козерог");
  });

  it("Pisces — end of February", () => {
    expect(westernZodiacFromIso("2015-03-01")).toBe("Рыбы");
  });

  it("returns null for empty or invalid date", () => {
    expect(westernZodiacFromIso(null)).toBeNull();
    expect(westernZodiacFromIso("")).toBeNull();
    expect(westernZodiacFromIso("bad")).toBeNull();
  });
});
