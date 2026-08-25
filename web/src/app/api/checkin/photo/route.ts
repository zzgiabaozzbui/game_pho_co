import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playerIdSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { uploadsDir } from "@/lib/storage";

const MAX_BYTES = 8 * 1024 * 1024;
const EXT_BY_MAGIC: ((b: Buffer) => string | null)[] = [
  (b) =>
    b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff ? "jpg" : null,
  (b) =>
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47
      ? "png"
      : null,
  (b) =>
    b.subarray(0, 4).toString("ascii") === "RIFF" &&
    b.subarray(8, 12).toString("ascii") === "WEBP"
      ? "webp"
      : null,
];

export async function POST(req: Request) {
  const rl = rateLimit(`photo:${clientIp(req)}`, {
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok)
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );

  const form = await req.formData().catch(() => null);
  if (!form)
    return NextResponse.json({ error: "invalid form" }, { status: 400 });

  const playerIdRaw = form.get("playerId");
  const slugRaw = form.get("slug");
  const file = form.get("file");

  if (
    typeof playerIdRaw !== "string" ||
    typeof slugRaw !== "string" ||
    !(file instanceof File)
  )
    return NextResponse.json({ error: "invalid fields" }, { status: 400 });

  const pid = playerIdSchema.safeParse(playerIdRaw);
  if (!pid.success)
    return NextResponse.json({ error: "bad player" }, { status: 400 });

  if (file.size <= 0 || file.size > MAX_BYTES)
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const ext =
    EXT_BY_MAGIC.map((fn) => fn(buf)).find((e) => e !== null) ?? null;
  if (!ext)
    return NextResponse.json(
      { error: "unsupported_type" },
      { status: 415 }
    );

  const player = await db.player.findUnique({ where: { id: pid.data } });
  if (!player)
    return NextResponse.json({ error: "unknown player" }, { status: 404 });

  const station = await db.station.findUnique({ where: { slug: slugRaw } });
  if (!station || !station.isActive)
    return NextResponse.json({ error: "unknown station" }, { status: 404 });

  const name = `${randomBytes(10).toString("hex")}.${ext}`;
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);

  await db.$transaction(async (tx) => {
    const updated = await tx.checkIn.updateMany({
      where: {
        playerId: player.id,
        stationId: station.id,
        method: "PHOTO",
        status: "PENDING",
      },
      data: { photoPath: name, reviewNote: null },
    });
    if (updated.count === 0) {
      await tx.checkIn.create({
        data: {
          playerId: player.id,
          stationId: station.id,
          method: "PHOTO",
          status: "PENDING",
          photoPath: name,
        },
      });
    }
  });

  return NextResponse.json({ ok: true, status: "PENDING" });
}
