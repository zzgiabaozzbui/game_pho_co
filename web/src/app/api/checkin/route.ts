import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  gpsCheckinSchema,
  qrCheckinSchema,
} from "@/lib/validators";
import { haversineM } from "@/lib/geo";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const parsed =
    body.method === "GPS"
      ? gpsCheckinSchema.safeParse(body)
      : body.method === "QR"
        ? qrCheckinSchema.safeParse(body)
        : null;

  if (!parsed?.success)
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

  const already = await db.checkIn.findFirst({
    where: {
      playerId: player.id,
      stationId: station.id,
      status: "APPROVED",
    },
  });
  if (already)
    return NextResponse.json({ ok: true, status: "APPROVED", existed: true });

  let lat: number | null = null;
  let lng: number | null = null;
  let distanceM: number | null = null;

  if (input.method === "GPS") {
    distanceM = haversineM(input.lat, input.lng, station.lat, station.lng);
    lat = input.lat;
    lng = input.lng;
    if (distanceM > station.radiusM) {
      return NextResponse.json(
        {
          error: "too_far",
          distanceM: Math.round(distanceM),
          radiusM: station.radiusM,
        },
        { status: 422 }
      );
    }
  } else {
    if (input.token !== station.qrToken)
      return NextResponse.json({ error: "bad_token" }, { status: 403 });
    lat = input.lat ?? null;
    lng = input.lng ?? null;
  }

  await db.checkIn.create({
    data: {
      playerId: player.id,
      stationId: station.id,
      method: input.method,
      status: "APPROVED",
      lat,
      lng,
      distanceM,
    },
  });

  return NextResponse.json({ ok: true, status: "APPROVED" });
}
