import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkPassword,
  createAdminToken,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit(`admin-login:${clientIp(req)}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok)
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );

  const body = (await req.json().catch(() => null)) as {
    password?: string;
  } | null;

  const envPassword = process.env.ADMIN_PASSWORD ?? "";
  if (
    !body?.password ||
    !envPassword ||
    !process.env.SESSION_SECRET ||
    !checkPassword(body.password, envPassword)
  )
    return NextResponse.json(
      { error: "wrong_password" },
      { status: 401 }
    );

  const token = createAdminToken(process.env.SESSION_SECRET ?? "");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
