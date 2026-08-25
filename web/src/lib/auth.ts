import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "pc36_admin";
const TTL_MS = 12 * 60 * 60 * 1000;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createAdminToken(secret: string, now = Date.now()): string {
  const exp = String(now + TTL_MS);
  return `${exp}.${sign(`admin:${exp}`, secret)}`;
}

export function verifyAdminToken(token: string, secret: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expRaw, sig] = parts;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= Date.now()) return false;
  const expected = sign(`admin:${exp}`, secret);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function checkPassword(input: string, envPassword: string): boolean {
  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(envPassword, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function adminTokenFromRequest(req: Request): string | null {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === ADMIN_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function isAdminRequest(req: Request): boolean {
  const secret = process.env.SESSION_SECRET ?? "";
  const token = adminTokenFromRequest(req);
  return !!secret && !!token && verifyAdminToken(token, secret);
}
