import { NextResponse } from "next/server";
import { CLIENT_COOKIE, clientCookieValue, readClientLoginToken } from "@/lib/client-auth";

/** Ссылка из бота → cookie клиента → «Мои заявки». */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = ["ru", "en", "ka"].includes(url.searchParams.get("lang") ?? "") ? url.searchParams.get("lang")! : "ru";
  const chatId = readClientLoginToken(url.searchParams.get("t"));
  const res = NextResponse.redirect(new URL(`/${lang}/my${chatId ? "" : "?expired=1"}`, url));
  if (chatId) {
    const c = clientCookieValue(chatId);
    res.cookies.set(CLIENT_COOKIE, c.value, { httpOnly: true, secure: url.protocol === "https:", sameSite: "lax", path: "/", maxAge: c.maxAge });
  }
  return res;
}
