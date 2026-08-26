import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.formData();
  const guestId = body.get("guestId") as string;
  const assignmentId = Number(body.get("assignmentId"));
  const photo = body.get("photo") as File | null;

  if (!guestId || !assignmentId) {
    return NextResponse.json({ error: "guestId and assignmentId required" }, { status: 400 });
  }

  const assignment = await db.guestAssignment.findFirst({
    where: { id: assignmentId, guestId },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }
  if (assignment.status !== "ASSIGNED") {
    return NextResponse.json({ error: "Assignment already submitted" }, { status: 409 });
  }

  let photoPath: string | null = null;
  if (photo && photo.size > 0) {
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `workshop-${assignmentId}-${Date.now()}.jpg`;
    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    photoPath = `/uploads/${filename}`;
  }

  await db.guestAssignment.update({
    where: { id: assignmentId },
    data: {
      status: "COMPLETED",
      photoPath,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, assignmentId });
}
