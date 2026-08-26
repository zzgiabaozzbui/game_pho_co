import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { partnerUpdateSchema } from "@/lib/validators";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rl = rateLimit(`admin-partner-update:${clientIp(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = partnerUpdateSchema.safeParse({ ...body, id: Number(id) });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id: _id, ...data } = parsed.data;
  void _id;
  const partner = await db.partner.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json(partner);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rl = rateLimit(`admin-partner-delete:${clientIp(req)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const { id } = await params;
  const numId = Number(id);

  const relatedCount = await db.stationPartner.count({
    where: { partnerId: numId },
  });
  const taskCount = await db.workshopTask.count({
    where: { partnerId: numId },
  });
  if (relatedCount > 0 || taskCount > 0) {
    await db.partner.update({
      where: { id: numId },
      data: { isActive: 0 },
    });
    return NextResponse.json({ deactivated: true, relatedCount, taskCount });
  }

  await db.partner.delete({ where: { id: numId } });
  return NextResponse.json({ deleted: true });
}
