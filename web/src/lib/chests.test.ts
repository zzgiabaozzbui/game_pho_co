import { describe, expect, it } from "vitest";
import {
  evaluateAchievements,
  nextPityCount,
  rollDrop,
  snapshotLoot,
  totalPointsFromSnapshot,
  PITY_THRESHOLD,
} from "./chests";

function makeSeq(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("rollDrop", () => {
  it("misses when first roll above chance boundary", () => {
    expect(rollDrop(30, { common: 70 }, 0, () => 0.3)).toEqual({ won: false, tierKey: null });
  });

  it("wins and picks weighted tier", () => {
    const r = rollDrop(30, { common: 70, gold: 25, epic: 5 }, 0, makeSeq([0.25, 0.98]));
    expect(r.won).toBe(true);
    expect(r.tierKey).toBe("common");
  });

  it("forces epic+ when pity reached threshold", () => {
    const r = rollDrop(30, { common: 70, gold: 25, epic: 5 }, PITY_THRESHOLD, makeSeq([0.99, 0.99]));
    expect(r.won).toBe(true);
    expect(r.tierKey).toBe("epic");
  });

  it("empty weights never wins", () => {
    expect(rollDrop(30, {}, 0)).toEqual({ won: false, tierKey: null });
  });
});

describe("nextPityCount", () => {
  it("resets on epic or grand win", () => {
    expect(nextPityCount(9, "epic")).toBe(0);
    expect(nextPityCount(9, "grand")).toBe(0);
  });
  it("increments otherwise", () => {
    expect(nextPityCount(3, "gold")).toBe(4);
    expect(nextPityCount(3, null)).toBe(4);
  });
});

describe("evaluateAchievements", () => {
  it("returns crossed thresholds only", () => {
    expect(evaluateAchievements({ solvedCount: 0, perfectStreak: 0, score: 0 })).toEqual([]);
    expect(evaluateAchievements({ solvedCount: 7, perfectStreak: 0, score: 0 })).toEqual(["stations_6"]);
    expect(
      evaluateAchievements({ solvedCount: 20, perfectStreak: 5, score: 2500 }).sort()
    ).toEqual(["perfect_5", "score_2000", "stations_18", "stations_6"].sort());
  });
});

describe("snapshotLoot / totalPointsFromSnapshot", () => {
  it("round-trips sorted and sums POINTS", () => {
    const snap = snapshotLoot([
      { type: "STORY", storyVi: "a", storyEn: "b", sortOrder: 2 },
      { type: "POINTS", pointsAmount: 40, sortOrder: 1 },
    ]);
    expect(totalPointsFromSnapshot(snap)).toBe(40);
    const parsed = JSON.parse(snap) as Array<Record<string, unknown>>;
    expect(parsed[0].type).toBe("POINTS");
    expect(parsed[0]).not.toHaveProperty("sortOrder");
  });
});
