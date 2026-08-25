import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { slug } = await ctx.params;
  const station = await db.station.findUnique({ where: { slug } });
  if (!station)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    new URL(req.url).origin;
  const target = `${base}/station/${station.slug}?token=${encodeURIComponent(station.qrToken)}`;

  const png = await QRCode.toBuffer(target, {
    type: "png",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
