import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { randomBytes } from "crypto";
import { basename, extname, join } from "path";
import { isAdminRequest } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

const lootDir = () => join(process.env.UPLOADS_DIR || "public/images", "loot");

export async function POST(req: Request) {
  if (!isAdminRequest(req))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data"))
    return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File))
    return NextResponse.json({ error: "no file provided" }, { status: 400 });

  if (!ALLOWED_MIMES.includes(file.type as typeof ALLOWED_MIMES[number]))
    return NextResponse.json({ error: "invalid file type, allowed: jpg, png, webp, gif" }, { status: 400 });

  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "file too large, max 5MB" }, { status: 400 });

  const rawName = basename(file.name);
  if (rawName.includes("..") || rawName.includes("/"))
    return NextResponse.json({ error: "invalid filename" }, { status: 400 });

  const ext = extname(rawName) || extFromMime(file.type);
  const rand = randomBytes(4).toString("hex");
  const filename = `${Date.now()}-${rand}${ext}`;
  const dir = lootDir();
  const filepath = join(dir, filename);

  try {
    await mkdir(dir, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buf);
  } catch {
    return NextResponse.json({ error: "write failed" }, { status: 500 });
  }

  return NextResponse.json({ path: `/api/images/loot?name=${filename}` });
}
