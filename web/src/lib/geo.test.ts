import { describe, expect, it } from "vitest";
import { haversineM, isWithinRadius } from "./geo";

describe("haversineM", () => {
  it("returns ~0 for identical points", () => {
    expect(haversineM(21.0285, 105.8342, 21.0285, 105.8342)).toBeCloseTo(0, 6);
  });

  it("measures one degree of latitude as ~111.2 km", () => {
    expect(haversineM(0, 0, 1, 0)).toBeCloseTo(111_195, -3);
  });

  it("is symmetric", () => {
    const ab = haversineM(21.0285, 105.8342, 21.0328, 105.8524);
    const ba = haversineM(21.0328, 105.8524, 21.0285, 105.8342);
    expect(ab).toBeCloseTo(ba, 6);
  });
});

describe("isWithinRadius", () => {
  it("includes the exact boundary", () => {
    const d = haversineM(10, 10, 10.001, 10);
    expect(isWithinRadius(10, 10, 10.001, 10, d)).toBe(true);
  });

  it("excludes points beyond the radius", () => {
    expect(isWithinRadius(10, 10, 10.01, 10, 100)).toBe(false);
  });
});
