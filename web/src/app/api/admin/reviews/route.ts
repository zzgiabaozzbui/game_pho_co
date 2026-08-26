import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { reviewDecisionSchema } from "@/lib/validators";

export async function GET(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const [existingPending, totalPending] = await Promise.all([
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

  // Workshop photos pending review
  const pendingWorkshop = await db.guestAssignment.findMany({
    where: { status: "COMPLETED", photoPath: { not: null } },
    include: {
      partner: { select: { name: true } },
      workshopTask: { select: { instructionVi: true, instructionEn: true } },
      station: { select: { nameVi: true, nameEn: true, slug: true } },
    },
    orderBy: { assignedAt: "asc" },
  });

  // Merge both into response
  const allPending = [
    ...existingPending.map((c) => ({ ...c, type: "checkin" as const })),
    ...pendingWorkshop.map((a) => ({ ...a, type: "workshop" as const })),
  ];

  return NextResponse.json({ items: allPending, totalPending });
}

export async function POST(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);

  // Workshop review decisions
  if (body?.type === "workshop") {
    if (!body.assignmentId || typeof body.approve !== "boolean")
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });

    const assignment = await db.guestAssignment.findUnique({
      where: { id: body.assignmentId },
    });
    if (!assignment || assignment.status !== "COMPLETED" || !assignment.photoPath)
      return NextResponse.json({ error: "not_pending" }, { status: 409 });

    const updated = await db.guestAssignment.update({
      where: { id: body.assignmentId },
      data: {
        status: body.approve ? "COMPLETED" : "REJECTED",
        reviewNote: body.note ?? null,
        reviewedAt: new Date(),
      },
    });

    // If approved, award points
    if (body.approve && updated.workshopTaskId) {
      const task = await db.workshopTask.findUnique({
        where: { id: updated.workshopTaskId },
      });
      if (task) {
        await db.player.update({
          where: { id: updated.guestId },
          data: { score: { increment: task.rewardPoints } },
        });
      }
    }

    return NextResponse.json({ ok: true });
  }

  // Check-in review decisions
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
