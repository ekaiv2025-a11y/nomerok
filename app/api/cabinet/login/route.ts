import { NextResponse, type NextRequest } from "next/server";
import { resolveLoginToken } from "@/lib/db";
import { SPEC_COOKIE, specCookieValue } from "@/lib/spec-auth";
import { isLocale } from "@/lib/i18n/config";

/** Ссылка из бота: /api/cabinet/login?t=КОД&lang=ru → вход в кабинет. */
export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t") ?? "";
  const l = req.nextUrl.searchParams.get("lang");
  const lang = isLocale(l) ? l : "ru";
  const id = t ? await resolveLoginToken(t).catch(() => null) : null;
  const url = req.nextUrl.clone();
  url.search = "";
  url.pathname = `/${lang}/cabinet`;
  if (!id) {
    url.searchParams.set("expired", "1");
    return NextResponse.redirect(url);
  }
  const res = NextResponse.redirect(url);
  const c = specCookieValue(id);
  res.cookies.set(SPEC_COOKIE, c.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: c.maxAge });
  return res;
}
