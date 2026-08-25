import { randomUUID } from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  ACHIEVEMENT_RULES,
  evaluateAchievements,
  nextPityCount,
  rollDrop,
  snapshotLoot,
} from "@/lib/chests";

async function tierIdByKey(key: string): Promise<number> {
  const tier = await db.chestTier.findUnique({ where: { key } });
  if (!tier) throw new Error(`missing chest tier: ${key}`);
  return tier.id;
}

export async function grantOnce(p: {
  playerId: string;
  source: string;
  sourceRef: string;
  tierId: number;
  lootScopeKey: string;
}): Promise<number | null> {
  const existing = await db.chestGrant.findFirst({
    where: { playerId: p.playerId, source: p.source, sourceRef: p.sourceRef },
    select: { id: true },
  });
  if (existing) return null;

  const loot = await db.chestLoot.findMany({
    where: { scopeKey: p.lootScopeKey },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      type: true,
      pointsAmount: true,
      storyVi: true,
      storyEn: true,
      imagePath: true,
      youtubeUrl: true,
      sortOrder: true,
    },
  });

  try {
    const grant = await db.chestGrant.create({
      data: {
        playerId: p.playerId,
        source: p.source,
        sourceRef: p.sourceRef,
        tierId: p.tierId,
        lootSnapshotJson: snapshotLoot(loot),
      },
    });
    return grant.id;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return null;
    throw e;
  }
}

function computePerfectStreak(
  answers: ReadonlyArray<{ solved: boolean; attempts: number }>
): number {
  let best = 0;
  let current = 0;
  for (const a of answers) {
    if (!a.solved) continue;
    if (a.attempts === 1) {
      current += 1;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

export async function grantsForAnswer(p: {
  playerId: string;
  stationSlug: string;
}): Promise<{ created: number }> {
  const player = await db.player.findUnique({ where: { id: p.playerId } });
  if (!player) return { created: 0 };

  let created = 0;

  const station = await db.station.findUnique({
    where: { slug: p.stationSlug },
  });
  if (station?.chestTierId != null) {
    const id = await grantOnce({
      playerId: p.playerId,
      source: "STATION",
      sourceRef: p.stationSlug,
      tierId: station.chestTierId,
      lootScopeKey: `station:${p.stationSlug}`,
    });
    if (id !== null) created += 1;
  }

  const rules = await db.dropRule.findMany();
  if (rules.length > 0) {
    const weights: Record<string, number> = {};
    for (const r of rules)
      weights[r.tierKey] = (weights[r.tierKey] ?? 0) + r.weight;
    const roll = rollDrop(rules[0].chancePct, weights, player.chestPityCount);
    if (roll.won && roll.tierKey !== null) {
      const tierId = await tierIdByKey(roll.tierKey);
      const id = await grantOnce({
        playerId: p.playerId,
        source: "DROP",
        sourceRef: `drop:${randomUUID()}`,
        tierId,
        lootScopeKey: "drop",
      });
      if (id !== null) created += 1;
      await db.player.update({
        where: { id: p.playerId },
        data: {
          chestPityCount: nextPityCount(player.chestPityCount, roll.tierKey),
        },
      });
    } else {
      await db.player.update({
        where: { id: p.playerId },
        data: { chestPityCount: nextPityCount(player.chestPityCount, null) },
      });
    }
  }

  const [solvedCount, answers] = await Promise.all([
    db.answer.count({ where: { playerId: p.playerId, solved: true } }),
    db.answer.findMany({
      where: { playerId: p.playerId },
      select: { attempts: true, solved: true },
      orderBy: { id: "asc" },
    }),
  ]);
  const perfectStreak = computePerfectStreak(answers);
  const achievementKeys = evaluateAchievements({
    solvedCount,
    perfectStreak,
    score: player.score,
  });
  for (const key of achievementKeys) {
    const rule = ACHIEVEMENT_RULES.find((r) => r.key === key);
    if (!rule) continue;
    const tierId = await tierIdByKey(rule.tierKey);
    const id = await grantOnce({
      playerId: p.playerId,
      source: "ACHIEVEMENT",
      sourceRef: key,
      tierId,
      lootScopeKey: `achievement:${key}`,
    });
    if (id !== null) created += 1;
  }

  const activeStations = await db.station.count({ where: { isActive: true } });
  if (activeStations > 0 && solvedCount >= activeStations) {
    const grandTierId = await tierIdByKey("grand");
    const id = await grantOnce({
      playerId: p.playerId,
      source: "FINAL",
      sourceRef: "final",
      tierId: grandTierId,
      lootScopeKey: "final",
    });
    if (id !== null) created += 1;
  }

  return { created };
}
