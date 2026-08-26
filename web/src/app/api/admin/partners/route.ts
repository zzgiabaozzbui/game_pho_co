import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { partnerCreateSchema } from "@/lib/validators";

export async function GET(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const partners = await db.partner.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(partners);
}

export async function POST(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rl = rateLimit(`admin-partner-create:${clientIp(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = partnerCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const partner = await db.partner.create({ data: parsed.data });
  return NextResponse.json(partner, { status: 201 });
}
