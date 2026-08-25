import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partnerClaimSchema } from "@/lib/validators";
import { grantOnce } from "@/lib/chest-grants";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit(`partner-claim:${clientIp(req)}`, {
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!rl.ok)
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );

  const body = await req.json().catch(() => null);
  const parsed = partnerClaimSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const spot = await db.partnerSpot.findUnique({
    where: { token: parsed.data.token },
  });
  if (!spot)
    return NextResponse.json({ error: "invalid_token" }, { status: 404 });

  const tier = await db.chestTier.findUnique({ where: { key: "epic" } });
  if (!tier)
    return NextResponse.json(
      { error: "server_misconfigured" },
      { status: 503 }
    );

  const grantId = await grantOnce({
    playerId: parsed.data.playerId,
    source: "PARTNER",
    sourceRef: spot.token,
    tierId: tier.id,
    lootScopeKey: "partner",
  });

  return NextResponse.json({
    ok: true,
    grantId,
    alreadyClaimed: grantId === null,
  });
}
