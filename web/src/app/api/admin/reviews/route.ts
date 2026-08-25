import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { reviewDecisionSchema } from "@/lib/validators";

export async function GET(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const [pending, totalPending] = await Promise.all([
    db.checkIn.findMany({
      where: { status: "PENDING", method: "PHOTO" },
      orderBy: { createdAt: "asc" },
      include: {
        player: { select: { id: true, score: true } },
        station: {
          select: { slug: true, nameVi: true, nameEn: true, orderIndex: true },
        },
      },
      take: 200,
    }),
    db.checkIn.count({ where: { status: "PENDING", method: "PHOTO" } }),
  ]);
  return NextResponse.json({ items: pending, totalPending });
}

export async function POST(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = reviewDecisionSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const checkIn = await db.checkIn.findUnique({
    where: { id: parsed.data.checkInId },
  });
  if (!checkIn || checkIn.status !== "PENDING")
    return NextResponse.json({ error: "not_pending" }, { status: 409 });

  const updated = await db.checkIn.update({
    where: { id: checkIn.id },
    data: {
      status: parsed.data.approve ? "APPROVED" : "REJECTED",
      reviewedAt: new Date(),
      reviewNote: parsed.data.note ?? null,
    },
  });
  return NextResponse.json({ ok: true, status: updated.status });
}
