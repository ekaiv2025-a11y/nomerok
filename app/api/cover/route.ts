import { commonsPhoto } from "@/lib/commons";

/*
 * Запасной путь для обложек путеводителя: если при сборке страницы Wikimedia Commons не успел ответить,
 * страница ставит <img src="/api/cover?q=…">, и картинка находится уже в браузере. Ответ — переадресация на фото,
 * CDN запоминает её на неделю.
 */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").slice(0, 120);
  if (!q) return new Response("no q", { status: 400 });
  const ph = await commonsPhoto(q).catch(() => undefined);
  if (!ph) return new Response("not found", { status: ph === null ? 404 : 503, headers: { "Cache-Control": "no-store" } });
  return new Response(null, { status: 302, headers: { Location: ph.url, "Cache-Control": "public, max-age=86400, s-maxage=604800" } });
}
