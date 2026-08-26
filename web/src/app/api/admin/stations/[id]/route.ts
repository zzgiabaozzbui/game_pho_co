import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`admin-station-delete:${clientIp(req)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const { id } = await params;
  const numId = Number(id);

  await db.station.update({ where: { id: numId }, data: { isActive: false } });
  return NextResponse.json({ deactivated: true });
}
