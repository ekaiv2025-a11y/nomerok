import "server-only";
import { cookies } from "next/headers";
import { readSigned, signData } from "./signed";

/*
 * Вход в кабинет организации. Личность — Telegram владельца (owner_chat_id места).
 * Бот присылает одноразовую ссылку (1 час) → браузер получает подписанную cookie на 60 дней.
 */
export const ORG_COOKIE = "nm_org";
const SESSION_DAYS = 60;

export const orgLoginToken = (chatId: number, name: string) => signData("org-login", { c: chatId, n: name.slice(0, 60) }, 1);
export const readOrgLogin = (t: string | null | undefined) => readSigned<{ c: number; n: string }>("org-login", t);

export const orgSessionValue = (chatId: number, name: string) => signData("org-session", { c: chatId, n: name.slice(0, 60) }, SESSION_DAYS * 24);
export const ORG_MAX_AGE = SESSION_DAYS * 86400;

export async function currentOrgUser(): Promise<{ chatId: number; name: string } | null> {
  const v = (await cookies()).get(ORG_COOKIE)?.value;
  const d = readSigned<{ c: number; n: string }>("org-session", v);
  return d ? { chatId: d.c, name: d.n } : null;
}
