import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { accountChatId, type Account } from "./accounts";
import { adminUpdateMaster, dbMode, readLocal, supabase } from "./db";
import { readSigned, signData } from "./signed";
import { specCookieValue, currentSpecialistId } from "./spec-auth";
import { CLIENT_COOKIE, clientCookieValue } from "./client-auth";
import { SITE_URL } from "./site";
import type { Master } from "./types";

/*
 * Сессия аккаунта (почта / Google / Facebook): подписанная cookie nm_acc на год.
 * После входа человек попадает туда, откуда пришёл:
 *   client — «Мои заявки» (или страница заявки), spec — кабинет специалиста,
 *   join — регистрация специалиста, link — добавить такой вход к уже существующей анкете.
 */
export const ACC_COOKIE = "nm_acc";
const DAYS = 365;
export type LoginIntent = "client" | "spec" | "join" | "link";
export const INTENTS: LoginIntent[] = ["client", "spec", "join", "link"];
export const asIntent = (v: unknown): LoginIntent => (INTENTS.includes(v as LoginIntent) ? (v as LoginIntent) : "client");
export const asLang = (v: unknown): "ru" | "en" | "ka" => (v === "en" || v === "ka" ? v : "ru");

/** Безопасный адрес возврата: только страницы этого сайта. */
export function safeNext(v: unknown, lang: string): string | null {
  if (typeof v !== "string") return null;
  return /^\/(ru|en|ka)(\/[\w\-/.]*)?(\?[\w\-=&%.]*)?$/.test(v) && !v.includes("//") && v.startsWith(`/${lang}`) ? v : null;
}

export type AccSession = { id: string; name: string; email: string | null };

export async function currentAccount(): Promise<AccSession | null> {
  const v = (await cookies()).get(ACC_COOKIE)?.value;
  const d = readSigned<{ a: string; n: string; e: string | null }>("acc-session", v);
  return d?.a ? { id: d.a, name: d.n ?? "", email: d.e ?? null } : null;
}

/** Анкеты, к которым привязан аккаунт (созданные через аккаунт или привязанные из кабинета). */
export async function mastersOfAccount(acc: Pick<Account, "id" | "num">): Promise<Master[]> {
  const vid = accountChatId(acc.num);
  const sb = supabase();
  let list: Master[] = [];
  if (sb) {
    const r = await sb.from("masters").select("*").or(`account_id.eq.${acc.id},tg_chat_id.eq.${vid}`);
    list = r.error ? [] : (r.data as Master[]);
  } else if (dbMode() !== "none") {
    list = (await readLocal()).masters.filter((m) => (m as Master & { account_id?: string }).account_id === acc.id || m.tg_chat_id === vid);
  }
  const rank = (m: Master) => (m.status === "rejected" ? 2 : 0) + (m.archived_at ? 1 : 0);
  return list.sort((a, b) => rank(a) - rank(b) || b.created_at.localeCompare(a.created_at));
}

type CookieSet = [string, string, Record<string, unknown>];

/** Куда отправить и какие cookie поставить после успешного входа. */
export async function finishLogin(acc: Account, intent: LoginIntent, lang: string, next: string | null, claim: string | null = null): Promise<{ url: string; cookies: CookieSet[] }> {
  const secure = process.env.NODE_ENV === "production";
  const base = { httpOnly: true, secure, sameSite: "lax", path: "/" };
  const out: CookieSet[] = [[ACC_COOKIE, signData("acc-session", { a: acc.id, n: acc.name, e: acc.email }, DAYS * 24), { ...base, maxAge: DAYS * 86400 }]];
  const spec = (id: string) => {
    const c = specCookieValue(id);
    out.push([`nm_spec`, c.value, { ...base, maxAge: c.maxAge }], ["nm_is_spec", "1", { ...base, httpOnly: false, maxAge: c.maxAge }]);
  };

  if (intent === "link") {
    const id = await currentSpecialistId();
    if (id) {
      const patch: Record<string, unknown> = { account_id: acc.id };
      if (acc.email) Object.assign(patch, { email: acc.email, email_verified_at: new Date().toISOString() });
      await adminUpdateMaster(id, patch as never).catch(() => null);
      return { url: `/${lang}/cabinet?linked=1`, cookies: out };
    }
    intent = "spec";
  }
  if (intent === "spec" || intent === "join") {
    const m = (await mastersOfAccount(acc).catch(() => []))[0];
    if (m) {
      spec(m.id);
      return { url: `/${lang}/cabinet`, cookies: out };
    }
    return { url: `/${lang}/join${intent === "spec" ? "?noprofile=1" : ""}`, cookies: out };
  }
  // клиент
  const vid = accountChatId(acc.num);
  // Только что отправил заявку и выбрал «получать отклики на почту» — привязываем её
  if (claim && /^[\w-]{6,64}$/.test(claim)) {
    const { getRequestByLinkToken, updateRequest } = await import("./db");
    const r = await getRequestByLinkToken(claim).catch(() => null);
    if (r && !r.client_tg_chat_id) await updateRequest(r.id, { client_tg_chat_id: vid }).catch(() => null);
  }
  const c = clientCookieValue(vid, acc.name);
  out.push([CLIENT_COOKIE, c.value, { ...base, maxAge: c.maxAge }]);
  return { url: next ?? `/${lang}/my`, cookies: out };
}

export function applyCookies(res: NextResponse, list: CookieSet[]) {
  for (const [n, v, o] of list) res.cookies.set(n, v, o);
  return res;
}

/** Адрес сайта для возврата из Google/Facebook (должен совпадать с указанным в их настройках). */
export function authOrigin(req: Request): string {
  return process.env.LOCAL_DB === "1" ? new URL(req.url).origin : SITE_URL;
}

/* ---- состояние входа через Google/Facebook (защита от подмены) ---- */
export const OAUTH_COOKIE = "nm_oauth";
export type OAuthState = { s: string; v: string; i: LoginIntent; l: string; x: string | null; c: string | null; p: "google" | "facebook" };
export const oauthStateValue = (st: OAuthState) => signData("oauth", st, 0.25);
export async function readOAuthState(): Promise<OAuthState | null> {
  return readSigned<OAuthState>("oauth", (await cookies()).get(OAUTH_COOKIE)?.value);
}

/** Выход отовсюду: аккаунт, кабинет специалиста, «Мои заявки». */
export function clearAllSessions(res: NextResponse) {
  for (const n of [ACC_COOKIE, "nm_spec", "nm_is_spec", CLIENT_COOKIE]) res.cookies.set(n, "", { path: "/", maxAge: 0 });
  return res;
}
