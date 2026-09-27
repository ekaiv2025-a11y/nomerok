import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, isLocale, pickLocale } from "@/lib/i18n/config";

/*
 * Языки сайта: у каждой страницы адрес начинается с /ru, /ka или /en.
 * Если язык в адресе не указан — выбираем по прошлому выбору посетителя
 * (cookie) или по языку браузера и перенаправляем.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    const headers = new Headers(req.headers);
    headers.set("x-nm-lang", first);
    return NextResponse.next({ request: { headers } });
  }

  const saved = req.cookies.get(LANG_COOKIE)?.value;
  const lang = isLocale(saved) ? saved : pickLocale(req.headers.get("accept-language"));
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Не трогаем админку, API, служебные файлы и всё, что с точкой (картинки, robots.txt, sitemap.xml).
  matcher: ["/((?!api|admin|_next|.*\\..*).*)"],
};
