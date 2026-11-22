import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, isLocale, pickLocale } from "@/lib/i18n/config";
import { CITIES, isCity } from "@/lib/cities";

/** Выбор города посетителя: id города или "all" (вся Грузия). */
const CITY_COOKIE = "nm_city";

/*
 * Языки сайта: у каждой страницы адрес начинается с /ru, /ka или /en.
 * Если язык в адресе не указан — выбираем по прошлому выбору посетителя
 * (cookie) или по языку браузера и перенаправляем.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Старый адрес *.vercel.app → основной домен (API и админку не трогаем: на них завязан бот).
  const host = req.headers.get("host") ?? "";
  if (process.env.VERCEL_ENV === "production" && host.endsWith(".vercel.app") && process.env.NEXT_PUBLIC_SITE_URL) {
    const target = new URL(pathname + req.nextUrl.search, process.env.NEXT_PUBLIC_SITE_URL);
    if (target.host !== host) return NextResponse.redirect(target, 308);
  }

  const first = pathname.split("/")[1];

  // Главная без ?city= — показываем город посетителя: прошлый выбор (cookie) или по местоположению (IP, данные Vercel).
  // Поисковых ботов не перенаправляем: для них главная — вся Грузия.
  if (isLocale(first) && pathname === `/${first}` && !req.nextUrl.searchParams.has("city") && !BOT.test(req.headers.get("user-agent") ?? "")) {
    const saved = req.cookies.get(CITY_COOKIE)?.value;
    const city = saved ? (isCity(saved) ? saved : null) : nearestCity(req.headers.get("x-vercel-ip-latitude"), req.headers.get("x-vercel-ip-longitude"));
    if (city) {
      const url = req.nextUrl.clone();
      url.searchParams.set("city", city);
      const res = NextResponse.redirect(url, 307);
      if (!saved) res.cookies.set(CITY_COOKIE, city, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
      return res;
    }
  }

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

const BOT = /bot|crawl|spider|slurp|google|bing|yandex|baidu|duckduck|facebookexternalhit|telegram|whatsapp|preview|lighthouse/i;

/** Ближайший к посетителю город каталога (не дальше 40 км), иначе null — тогда главная «Вся Грузия». */
function nearestCity(lat: string | null, lng: string | null): string | null {
  const a = Number(lat);
  const b = Number(lng);
  if (!lat || !lng || !Number.isFinite(a) || !Number.isFinite(b)) return null;
  let best: string | null = null;
  let bestKm = 40;
  for (const c of CITIES) {
    const km = Math.hypot((a - c.center[0]) * 111, (b - c.center[1]) * 83);
    if (km < bestKm) {
      bestKm = km;
      best = c.id;
    }
  }
  return best;
}

export const config = {
  // Не трогаем админку, API, служебные файлы и всё, что с точкой (картинки, robots.txt, sitemap.xml).
  // Страницы с /ru, /en, /ka тоже не трогаем: proxy на каждом заходе — лишний запуск сервера (лимиты Vercel).
  // Исключение: главные /ru, /en, /ka — там выбираем город посетителя.
  matcher: ["/((?!api|admin|_next|ru(?:/|$)|en(?:/|$)|ka(?:/|$)|.*\\..*).*)", "/ru", "/en", "/ka"],
};
