import "server-only";
import { cookies } from "next/headers";
import { readSigned, signData } from "./signed";

/*
 * Кабинет клиента «Мои заявки». Пароля нет: вход через бота (он знает Telegram клиента),
 * бот присылает ссылку, после неё в браузере сохраняется подписанная cookie на 60 дней.
 */
export const CLIENT_COOKIE = "nm_client";
const DAYS = 60;

export const clientLoginToken = (chatId: number, name = "") => signData("client-login", { c: chatId, n: name.slice(0, 60) }, 0.5);
export const readClientLoginToken = (t: string | null) => readSigned<{ c: number; n?: string }>("client-login", t);

export function clientCookieValue(chatId: number, name = "") {
  return { value: signData("client-session", { c: chatId, n: name }, DAYS * 24), maxAge: DAYS * 86400 };
}

export async function currentClient(): Promise<{ chatId: number; tgName: string } | null> {
  const v = (await cookies()).get(CLIENT_COOKIE)?.value;
  const d = readSigned<{ c: number; n?: string }>("client-session", v);
  return d?.c ? { chatId: d.c, tgName: d.n ?? "" } : null;
}

/** Имя и телефон для форм: из последней заявки клиента, имя — запасной вариант из Telegram. */
export async function clientContact(): Promise<{ name: string; phone: string } | null> {
  const me = await currentClient();
  if (!me) return null;
  const { listClientRequests } = await import("./client-db");
  const last = (await listClientRequests(me.chatId).catch(() => []))[0];
  return { name: last?.name || me.tgName, phone: last?.phone ?? "" };
}

export async function currentClientChatId(): Promise<number | null> {
  const v = (await cookies()).get(CLIENT_COOKIE)?.value;
  return readSigned<{ c: number }>("client-session", v)?.c ?? null;
}
