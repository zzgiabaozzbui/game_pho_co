import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { chestPatchSchema } from "@/lib/validators";

export async function GET(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const [tiers, loot, dropRules, partnerSpot] = await Promise.all([
    db.chestTier.findMany({ orderBy: { sortOrder: "asc" } }),
    db.chestLoot.findMany({ orderBy: [{ scopeKey: "asc" }, { sortOrder: "asc" }] }),
    db.dropRule.findMany(),
    db.partnerSpot.findFirst(),
  ]);
  return NextResponse.json({ tiers, loot, dropRules, partnerSpot });
}

export async function PATCH(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = chestPatchSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  const d = parsed.data;

  try {
    switch (d.kind) {
      case "tier":
        await db.chestTier.update({
          where: { id: d.id },
          data: {
            nameVi: d.nameVi,
            nameEn: d.nameEn,
            colorHex: d.colorHex,
            modelGlbPath: d.modelGlbPath,
            modelUsdzPath: d.modelUsdzPath,
          },
        });
        break;
      case "loot-create": {
        const { kind: _k, ...data } = d;
        void _k;
        await db.chestLoot.create({ data });
        break;
      }
      case "loot-delete":
        await db.chestLoot.delete({ where: { id: d.id } });
        break;
      case "drop-rule":
        await db.$transaction([
          db.dropRule.deleteMany(),
          db.dropRule.createMany({
            data: d.rules.map((r) => ({
              chancePct: d.chancePct,
              tierKey: r.tierKey,
              weight: r.weight,
            })),
          }),
        ]);
        break;
      case "regenerate_partner_token": {
        const spot = await db.partnerSpot.findFirstOrThrow();
        await db.partnerSpot.update({
          where: { id: spot.id },
          data: { token: randomBytes(24).toString("hex") },
        });
        break;
      }
    }
  } catch {
    return NextResponse.json({ error: "operation_failed" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
