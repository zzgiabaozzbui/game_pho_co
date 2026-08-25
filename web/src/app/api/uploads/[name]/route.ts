import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { uploadsDir } from "@/lib/storage";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  req: Request,
  ctx: { params: Promise<{ name: string }> }
) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { name } = await ctx.params;
  if (!/^[0-9a-f]{20}\.(jpg|png|webp)$/.test(name))
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const ext = name.split(".").pop()!;
  const file = path.join(uploadsDir(), name);
  try {
    const st = await stat(file);
    const data = await readFile(file);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME[ext],
        "Content-Length": String(st.size),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
