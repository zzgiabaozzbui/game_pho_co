import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { stationUpdateSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const stations = await db.station.findMany({
    orderBy: { orderIndex: "asc" },
    include: { stationPartners: { select: { partnerId: true } } },
  });
  return NextResponse.json(
    stations.map((s) => ({
      ...s,
      options: JSON.parse(s.optionsJson) as { vi: string; en: string }[],
      optionsJson: undefined,
      partnerIds: s.stationPartners.map((sp) => sp.partnerId),
      stationPartners: undefined,
    }))
  );
}

export async function PUT(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = stationUpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  const s = parsed.data;

  try {
    const updated = await db.station.update({
      where: { slug: s.slug },
      data: {
        nameVi: s.nameVi,
        nameEn: s.nameEn,
        storyVi: s.storyVi,
        storyEn: s.storyEn,
        questionVi: s.questionVi,
        questionEn: s.questionEn,
        optionsJson: JSON.stringify(s.options),
        correctIndex: s.correctIndex,
        hintVi: s.hintVi,
        hintEn: s.hintEn,
        lat: s.lat,
        lng: s.lng,
        radiusM: s.radiusM,
        orderIndex: s.orderIndex,
        isActive: s.isActive,
        chestTierId: s.chestTierId,
        challengeType: s.challengeType ?? "QUIZ",
      },
    });

    if (s.partnerIds !== undefined) {
      await db.stationPartner.deleteMany({ where: { stationId: updated.id } });
      if (s.partnerIds.length > 0) {
        await db.stationPartner.createMany({
          data: s.partnerIds.map((pid) => ({ stationId: updated.id, partnerId: pid })),
        });
      }
    }

    return NextResponse.json({ ok: true, slug: updated.slug });
  } catch {
    return NextResponse.json(
      { error: "update_failed (orderIndex trùng?)" },
      { status: 409 }
    );
  }
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`admin-station-create:${clientIp(req)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json();
  const { slug, orderIndex, nameVi, nameEn, lat, lng, qrToken } = body;

  if (!slug || !nameVi || !nameEn || !qrToken) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existingSlug = await db.station.findUnique({ where: { slug } });
  if (existingSlug) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const station = await db.station.create({
    data: {
      slug,
      orderIndex: orderIndex ?? 0,
      nameVi,
      nameEn,
      storyVi: body.storyVi ?? "",
      storyEn: body.storyEn ?? "",
      questionVi: body.questionVi ?? "",
      questionEn: body.questionEn ?? "",
      optionsJson: body.optionsJson ?? "[]",
      correctIndex: body.correctIndex ?? 0,
      hintVi: body.hintVi ?? "",
      hintEn: body.hintEn ?? "",
      lat: lat ?? 0,
      lng: lng ?? 0,
      radiusM: body.radiusM ?? 120,
      qrToken,
      challengeType: body.challengeType ?? "QUIZ",
    },
  });
  return NextResponse.json(station, { status: 201 });
}
