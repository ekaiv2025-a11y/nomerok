import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "mm_admin";

function token(): string | null {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd || pwd.length < 8) return null;
  return createHmac("sha256", pwd).update("nomerok-admin-v1").digest("hex");
}

export function adminConfigured(): boolean {
  return token() !== null;
}

export function checkPassword(input: string): boolean {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd || pwd.length < 8) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pwd);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function adminCookieValue(): string {
  const t = token();
  if (!t) throw new Error("ADMIN_PASSWORD не задан");
  return t;
}

export async function isAdmin(): Promise<boolean> {
  const t = token();
  if (!t) return false;
  const v = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!v || v.length !== t.length) return false;
  return timingSafeEqual(Buffer.from(v), Buffer.from(t));
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Нет доступа");
}
