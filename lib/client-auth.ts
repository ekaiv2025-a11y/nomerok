import "server-only";
import { cookies } from "next/headers";
import { readSigned, signData } from "./signed";

/*
 * Кабинет клиента «Мои заявки». Пароля нет: вход через бота (он знает Telegram клиента),
 * бот присылает ссылку, после неё в браузере сохраняется подписанная cookie на 60 дней.
 */
export const CLIENT_COOKIE = "nm_client";
const DAYS = 60;

export const clientLoginToken = (chatId: number) => signData("client-login", { c: chatId }, 0.5);
export const readClientLoginToken = (t: string | null) => readSigned<{ c: number }>("client-login", t)?.c ?? null;

export function clientCookieValue(chatId: number) {
  return { value: signData("client-session", { c: chatId }, DAYS * 24), maxAge: DAYS * 86400 };
}

export async function currentClientChatId(): Promise<number | null> {
  const v = (await cookies()).get(CLIENT_COOKIE)?.value;
  return readSigned<{ c: number }>("client-session", v)?.c ?? null;
}
