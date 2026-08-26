import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshopTaskUpdateSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`admin-workshop-update:${clientIp(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const { id } = await params;
  const body = await req.json();
  const parsed = workshopTaskUpdateSchema.safeParse({
    ...body,
    id: Number(id),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id: _id, ...data } = parsed.data;
  void _id;
  const task = await db.workshopTask.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json(task);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`admin-workshop-delete:${clientIp(req)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const { id } = await params;
  await db.workshopTask.delete({ where: { id: Number(id) } });
  return NextResponse.json({ deleted: true });
}
