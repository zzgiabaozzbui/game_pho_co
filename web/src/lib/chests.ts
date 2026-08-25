export const PITY_THRESHOLD = 10;

export interface DropRollResult {
  won: boolean;
  tierKey: string | null;
}

function pickWeighted(weights: Record<string, number>, roll: number): string {
  const keys = Object.keys(weights).sort().reverse();
  const total = keys.reduce((sum, k) => sum + weights[k], 0) || 1;
  let acc = roll * total;
  for (const k of keys) {
    acc -= weights[k];
    if (acc < 0) return k;
  }
  return keys[keys.length - 1];
}

export function rollDrop(
  chancePct: number,
  weights: Record<string, number>,
  pityCount: number,
  rand: () => number = Math.random
): DropRollResult {
  const keys = Object.keys(weights).sort().reverse();
  if (keys.length === 0) return { won: false, tierKey: null };
  if (pityCount >= PITY_THRESHOLD) {
    const rarest = keys.filter((k) => k === "epic" || k === "grand").pop();
    return { won: true, tierKey: rarest ?? keys[keys.length - 1] };
  }
  if (rand() >= chancePct / 100) return { won: false, tierKey: null };
  return { won: true, tierKey: pickWeighted(weights, rand()) };
}

export function nextPityCount(current: number, tierKey: string | null): number {
  return tierKey === "epic" || tierKey === "grand" ? 0 : current + 1;
}

export interface PlayerStats {
  solvedCount: number;
  perfectStreak: number;
  score: number;
}

export const ACHIEVEMENT_RULES: ReadonlyArray<{
  key: string;
  tierKey: string;
  minSolved?: number;
  minPerfectStreak?: number;
  minScore?: number;
}> = [
  { key: "stations_6", tierKey: "common", minSolved: 6 },
  { key: "stations_18", tierKey: "gold", minSolved: 18 },
  { key: "perfect_5", tierKey: "gold", minPerfectStreak: 5 },
  { key: "score_2000", tierKey: "epic", minScore: 2000 },
];

export function evaluateAchievements(stats: PlayerStats): string[] {
  return ACHIEVEMENT_RULES.filter(
    (r) =>
      (r.minSolved === undefined || stats.solvedCount >= r.minSolved) &&
      (r.minPerfectStreak === undefined ||
        stats.perfectStreak >= r.minPerfectStreak) &&
      (r.minScore === undefined || stats.score >= r.minScore)
  ).map((r) => r.key);
}

export interface LootRow {
  type: string;
  pointsAmount?: number | null;
  storyVi?: string | null;
  storyEn?: string | null;
  imagePath?: string | null;
  youtubeUrl?: string | null;
  sortOrder?: number | null;
}

export function snapshotLoot(rows: LootRow[]): string {
  const ordered = [...rows].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)
  );
  return JSON.stringify(
    ordered.map((row) =>
      Object.fromEntries(
        Object.entries(row).filter(([k, v]) => k !== "sortOrder" && v != null)
      )
    )
  );
}

export function totalPointsFromSnapshot(snapshotJson: string): number {
  const rows = JSON.parse(snapshotJson) as LootRow[];
  return rows.reduce(
    (sum, r) => sum + (r.type === "POINTS" ? r.pointsAmount ?? 0 : 0),
    0
  );
}
