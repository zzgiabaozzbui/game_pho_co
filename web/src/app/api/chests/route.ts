import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chestOpenSchema, playerIdSchema } from "@/lib/validators";
import { totalPointsFromSnapshot, type LootRow } from "@/lib/chests";
import { clientIp, rateLimit } from "@/lib/rate-limit";

function parseSnapshot(s: string): LootRow[] {
  try {
    const rows = JSON.parse(s) as LootRow[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function snapshotPoints(s: string): number {
  try {
    return totalPointsFromSnapshot(s);
  } catch {
    return 0;
  }
}

async function tierViewById(id: number) {
  const t = await db.chestTier.findUnique({ where: { id } });
  if (!t) return null;
  return { key: t.key, nameVi: t.nameVi, nameEn: t.nameEn, colorHex: t.colorHex };
}

export async function GET(req: Request) {
  const rl = rateLimit(`chests-read:${clientIp(req)}`, {
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rl.ok)
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );

  const url = new URL(req.url);
  const parsed = playerIdSchema.safeParse(url.searchParams.get("playerId"));
  if (!parsed.success)
    return NextResponse.json({ error: "bad player" }, { status: 400 });

  const grants = await db.chestGrant.findMany({
    where: { playerId: parsed.data },
    orderBy: { createdAt: "asc" },
  });

  const tierIds = [...new Set(grants.map((g) => g.tierId))];
  const tiers = await db.chestTier.findMany({
    where: { id: { in: tierIds } },
  });
  const tierById = new Map(tiers.map((t) => [t.id, t]));

  const view = (g: (typeof grants)[number]) => {
    const t = tierById.get(g.tierId);
    return {
      grantId: g.id,
      source: g.source,
      sourceRef: g.source === "PARTNER" ? null : g.sourceRef,
      createdAt: g.createdAt,
      tier: t
        ? {
            key: t.key,
            nameVi: t.nameVi,
            nameEn: t.nameEn,
            colorHex: t.colorHex,
            modelGlbPath: t.modelGlbPath,
            modelUsdzPath: t.modelUsdzPath,
          }
        : null,
      loot: parseSnapshot(g.lootSnapshotJson),
    };
  };

  const unopened = grants
    .filter((g) => g.openedAt === null)
    .map((g) => view(g));
  const collection = grants
    .filter((g) => g.openedAt !== null)
    .map((g) => ({ ...view(g), openedAt: g.openedAt }));

  return NextResponse.json({
    unopened,
    collection,
    unopenedCount: unopened.length,
  });
}

export async function POST(req: Request) {
  const rl = rateLimit(`chests-open:${clientIp(req)}`, {
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!rl.ok)
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );

  const body = await req.json().catch(() => null);
  const parsed = chestOpenSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const grant = await db.chestGrant.findUnique({
    where: { id: parsed.data.grantId },
  });
  if (!grant || grant.playerId !== parsed.data.playerId)
    return NextResponse.json({ error: "unknown grant" }, { status: 404 });

  const claimed = await db.chestGrant.updateMany({
    where: { id: grant.id, openedAt: null },
    data: { openedAt: new Date() },
  });

  if (claimed.count > 0) {
    const points = snapshotPoints(grant.lootSnapshotJson);
    if (points > 0) {
      await db.player.update({
        where: { id: grant.playerId },
        data: { score: { increment: points } },
      });
    }
  }

  return NextResponse.json({
    alreadyOpened: claimed.count === 0,
    loot: parseSnapshot(grant.lootSnapshotJson),
    tier: await tierViewById(grant.tierId),
  });
}
