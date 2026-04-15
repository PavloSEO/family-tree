import { describe, expect, it } from "vitest";
import { computeAgeYears } from "./age.js";

describe("computeAgeYears", () => {
  it("counts full years relative to birthday", () => {
    const asOf = new Date(2026, 3, 14);
    expect(computeAgeYears("1990-04-13", { asOf })).toBe(36);
    expect(computeAgeYears("1990-04-14", { asOf })).toBe(36);
    expect(computeAgeYears("1990-04-15", { asOf })).toBe(35);
  });

  it("age as of death date", () => {
    expect(
      computeAgeYears("1980-06-10", { deathIso: "2020-06-09" }),
    ).toBe(39);
    expect(
      computeAgeYears("1980-06-10", { deathIso: "2020-06-10" }),
    ).toBe(40);
  });

  it("returns null when birth is after end date", () => {
    expect(computeAgeYears("2030-01-01", { asOf: new Date(2020, 0, 1) })).toBe(
      null,
    );
    expect(
      computeAgeYears("1980-01-01", { deathIso: "1970-01-01" }),
    ).toBeNull();
  });

  it("returns null for empty or invalid birth date", () => {
    expect(computeAgeYears(null)).toBeNull();
    expect(computeAgeYears("not")).toBeNull();
  });
});
