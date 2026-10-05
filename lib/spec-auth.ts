import "server-only";
import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "crypto";

/*
 * Вход специалиста в кабинет. Пароля нет: бот присылает одноразовую ссылку,
 * или код из бота; после этого в браузере сохраняется подписанная cookie на год.
 */
export const SPEC_COOKIE = "nm_spec";
const DAYS = 365; // год: заходить заново почти не придётся

function secret(): string {
  const base = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_PASSWORD || "nomerok-dev";
  return createHash("sha256").update("nomerok-spec|" + base).digest("hex");
}

function sign(id: string, exp: number): string {
  return createHmac("sha256", secret()).update(`${id}.${exp}`).digest("hex").slice(0, 40);
}

export function specCookieValue(masterId: string): { value: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + DAYS * 86400;
  return { value: `${masterId}.${exp}.${sign(masterId, exp)}`, maxAge: DAYS * 86400 };
}

export async function currentSpecialistId(): Promise<string | null> {
  const v = (await cookies()).get(SPEC_COOKIE)?.value;
  if (!v) return null;
  const [id, expS, sig] = v.split(".");
  const exp = Number(expS);
  if (!id || !exp || !sig || exp < Date.now() / 1000) return null;
  const good = sign(id, exp);
  if (good.length !== sig.length || !timingSafeEqual(Buffer.from(good), Buffer.from(sig))) return null;
  return id;
}

/** Ставит вход в кабинет + открытую метку nm_is_spec (по ней шапка показывает «Мой кабинет»). */
export function setSpecCookies(res: { cookies: { set: (name: string, value: string, opts: Record<string, unknown>) => unknown } }, masterId: string) {
  const c = specCookieValue(masterId);
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(SPEC_COOKIE, c.value, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: c.maxAge });
  res.cookies.set("nm_is_spec", "1", { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge: c.maxAge });
}
