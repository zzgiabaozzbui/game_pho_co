import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshopTaskCreateSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("partnerId");

  const where = partnerId ? { partnerId: Number(partnerId) } : {};
  const tasks = await db.workshopTask.findMany({
    where,
    include: { partner: { select: { id: true, name: true } } },
    orderBy: [{ stationId: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`admin-workshop-create:${clientIp(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json();
  const parsed = workshopTaskCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const task = await db.workshopTask.create({ data: parsed.data });
  return NextResponse.json(task, { status: 201 });
}
