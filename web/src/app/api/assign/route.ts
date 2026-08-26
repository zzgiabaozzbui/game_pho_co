import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignPartner } from "@/lib/assignment";

export async function POST(req: Request) {
  const body = await req.json();
  const { guestId, stationId } = body;

  if (!guestId || !stationId) {
    return NextResponse.json({ error: "guestId and stationId required" }, { status: 400 });
  }

  const result = await assignPartner(db, Number(stationId), guestId);
  if (!result) {
    return NextResponse.json({ error: "No partners available for this station" }, { status: 404 });
  }

  return NextResponse.json(result);
}
