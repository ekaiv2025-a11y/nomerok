import "server-only";
import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "crypto";

/*
 * Вход специалиста в кабинет. Пароля нет: бот присылает одноразовую ссылку,
 * после неё в браузере сохраняется подписанная cookie на 30 дней.
 */
export const SPEC_COOKIE = "nm_spec";
const DAYS = 30;

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
