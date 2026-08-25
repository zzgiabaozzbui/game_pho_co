import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { stationUpdateSchema } from "@/lib/validators";

export async function GET(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const stations = await db.station.findMany({
    orderBy: { orderIndex: "asc" },
  });
  return NextResponse.json(
    stations.map((s) => ({
      ...s,
      options: JSON.parse(s.optionsJson) as { vi: string; en: string }[],
      optionsJson: undefined,
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
      },
    });
    return NextResponse.json({ ok: true, slug: updated.slug });
  } catch {
    return NextResponse.json(
      { error: "update_failed (orderIndex trùng?)" },
      { status: 409 }
    );
  }
}
