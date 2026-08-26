import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const lootDir = () => join(process.env.UPLOADS_DIR || "public/images", "loot");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name || name.includes("..") || name.includes("/")) {
    return NextResponse.json({ error: "invalid name" }, { status: 400 });
  }

  const filepath = join(lootDir(), name);

  try {
    const buf = await readFile(filepath);
    const ext = name.split(".").pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    const contentType = mimeMap[ext ?? ""] ?? "application/octet-stream";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
