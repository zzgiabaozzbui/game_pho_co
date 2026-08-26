import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const rl = rateLimit(`partner-config:${clientIp(req)}`, {
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rl.ok)
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );

  const spot = await db.partnerSpot.findFirst();
  if (!spot)
    return NextResponse.json({ error: "not_configured" }, { status: 404 });

  return NextResponse.json({
    key: spot.key,
    mindTargetPath: spot.mindTargetPath,
  });
}
