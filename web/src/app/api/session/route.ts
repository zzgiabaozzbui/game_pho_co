import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playerIdSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit(`session:${clientIp(req)}`, {
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });
  if (!rl.ok)
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );

  const body = (await req.json().catch(() => null)) as {
    playerId?: string;
  } | null;

  const requestedId =
    typeof body?.playerId === "string" && body.playerId.length > 0
      ? body.playerId
      : null;

  if (requestedId !== null) {
    const parsed = playerIdSchema.safeParse(requestedId);
    if (!parsed.success)
      return NextResponse.json(
        { error: "invalid_player_id" },
        { status: 400 }
      );
    const player = await db.player.findUnique({ where: { id: parsed.data } });
    if (!player)
      return NextResponse.json({ error: "unknown_player" }, { status: 404 });
    await db.player.update({
      where: { id: player.id },
      data: { lastSeenAt: new Date() },
    });
    return NextResponse.json({ playerId: player.id, resumed: true });
  }

  const player = await db.player.create({
    data: { id: randomUUID() },
  });
  return NextResponse.json({ playerId: player.id, resumed: false });
}
