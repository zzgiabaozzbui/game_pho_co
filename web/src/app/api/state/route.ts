import { NextResponse } from "next/server";
import { buildState } from "@/lib/state";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const playerId = url.searchParams.get("playerId");
  if (!playerId)
    return NextResponse.json({ error: "missing playerId" }, { status: 400 });

  const state = await buildState(playerId);
  if (!state)
    return NextResponse.json({ error: "unknown player" }, { status: 404 });

  return NextResponse.json(state);
}
