import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answerActionSchema } from "@/lib/validators";
import { hintDeduction, stationPoints } from "@/lib/game";
import { grantsForAnswer } from "@/lib/chest-grants";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = answerActionSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  const input = parsed.data;

  const player = await db.player.findUnique({ where: { id: input.playerId } });
  if (!player)
    return NextResponse.json({ error: "unknown player" }, { status: 404 });

  const station = await db.station.findUnique({
    where: { slug: input.slug },
  });
  if (!station || !station.isActive)
    return NextResponse.json({ error: "unknown station" }, { status: 404 });

  const approved = await db.checkIn.findFirst({
    where: {
      playerId: player.id,
      stationId: station.id,
      status: "APPROVED",
    },
  });
  if (!approved)
    return NextResponse.json(
      { error: "checkin_required" },
      { status: 409 }
    );

  let answer = await db.answer.findUnique({
    where: { playerId_stationId: { playerId: player.id, stationId: station.id } },
  });
  if (!answer) {
    answer = await db.answer.create({
      data: { playerId: player.id, stationId: station.id },
    });
  }

  const nextStation = await db.station.findFirst({
    where: { orderIndex: { gt: station.orderIndex }, isActive: true },
    orderBy: { orderIndex: "asc" },
    select: { slug: true },
  });

  if (input.action === "hint") {
    if (!answer.solved)
      return NextResponse.json(
        { error: "not_solved_yet" },
        { status: 409 }
      );
    if (answer.hintsUsed === 0) {
      const claim = await db.answer.updateMany({
        where: { id: answer.id, hintsUsed: 0 },
        data: { hintsUsed: 1 },
      });
      if (claim.count > 0) {
        const deduction = hintDeduction(answer.attempts);
        if (deduction > 0) {
          await db.player.update({
            where: { id: player.id },
            data: { score: { decrement: deduction } },
          });
        }
      }
      answer = { ...answer, hintsUsed: 1 };
    }
    return NextResponse.json({
      hint: { vi: station.hintVi, en: station.hintEn },
      nextSlug: nextStation?.slug ?? null,
      hintsUsed: answer.hintsUsed,
    });
  }

  const correct = input.choice === station.correctIndex;

  if (!answer.solved) {
    const attempts = answer.attempts + 1;
    if (correct) {
      const claimed = await db.answer.updateMany({
        where: { id: answer.id, solved: false },
        data: { solved: true, attempts },
      });
      if (claimed.count === 0)
        return NextResponse.json({
          correct: true,
          nextSlug: nextStation?.slug ?? null,
        });
      const points = stationPoints(answer.attempts, answer.hintsUsed);
      const updated = await db.player.update({
        where: { id: player.id },
        data: { score: { increment: points } },
        select: { score: true },
      });
      const { created } = await grantsForAnswer({
        playerId: player.id,
        stationSlug: station.slug,
      });
      return NextResponse.json({
        correct: true,
        pointsEarned: points,
        score: updated.score,
        nextSlug: nextStation?.slug ?? null,
        newChests: created,
      });
    }
    await db.answer.update({ where: { id: answer.id }, data: { attempts } });
    return NextResponse.json({ correct: false });
  }

  return NextResponse.json({
    correct,
    nextSlug: nextStation?.slug ?? null,
  });
}
