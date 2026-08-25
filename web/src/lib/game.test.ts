import { describe, expect, it } from "vitest";
import {
  computeStatuses,
  hintDeduction,
  stationPoints,
  type StationRef,
} from "./game";

const stations: StationRef[] = [
  { slug: "a", orderIndex: 1 },
  { slug: "b", orderIndex: 2 },
  { slug: "c", orderIndex: 3 },
];

function flags(
  approved: string[] = [],
  solved: string[] = []
) {
  return {
    approvedSlugs: new Set(approved),
    solvedSlugs: new Set(solved),
  };
}

describe("computeStatuses", () => {
  it("fresh player: every station is current (free order)", () => {
    const m = computeStatuses(stations, flags());
    for (const s of ["a", "b", "c"]) expect(m.get(s)).toBe("current");
  });

  it("checked-in but unsolved -> checked_in, others stay current", () => {
    const m = computeStatuses(stations, flags(["b"]));
    expect(m.get("b")).toBe("checked_in");
    expect(m.get("a")).toBe("current");
    expect(m.get("c")).toBe("current");
  });

  it("any station can be completed independently of order", () => {
    const m = computeStatuses(stations, flags(["c"], ["c"]));
    expect(m.get("c")).toBe("completed");
    expect(m.get("a")).toBe("current");
    expect(m.get("b")).toBe("current");
  });

  it("mixed progress: each station gets its own status", () => {
    const m = computeStatuses(
      stations,
      flags(["a", "b"], ["a"])
    );
    expect(m.get("a")).toBe("completed");
    expect(m.get("b")).toBe("checked_in");
    expect(m.get("c")).toBe("current");
  });

  it("solved without check-in does NOT complete", () => {
    const m = computeStatuses(stations, flags([], ["b"]));
    expect(m.get("b")).toBe("current");
  });

  it("all completed", () => {
    const all = ["a", "b", "c"];
    const m = computeStatuses(stations, flags(all, all));
    for (const s of ["a", "b", "c"]) expect(m.get(s)).toBe("completed");
  });

  it("never produces locked", () => {
    const m = computeStatuses(stations, flags(["b"]));
    for (const v of m.values()) expect(v).not.toBe("locked");
  });
});

describe("stationPoints", () => {
  it("base 100", () => {
    expect(stationPoints(0, 0)).toBe(100);
  });

  it("penalizes wrong attempts by 10", () => {
    expect(stationPoints(2, 0)).toBe(80);
  });

  it("hint costs 20 once", () => {
    expect(stationPoints(0, 1)).toBe(80);
    expect(stationPoints(0, 3)).toBe(80);
  });

  it("floors at 50", () => {
    expect(stationPoints(9, 3)).toBe(50);
  });
});

describe("hintDeduction", () => {
  it("full penalty while station is far above the floor", () => {
    expect(hintDeduction(0)).toBe(20);
    expect(hintDeduction(3)).toBe(20);
  });

  it("clamps so the station keeps at least MIN_POINTS", () => {
    expect(hintDeduction(4)).toBe(10);
  });

  it("zero once wrong attempts already reached the floor", () => {
    expect(hintDeduction(5)).toBe(0);
    expect(hintDeduction(9)).toBe(0);
  });
});
