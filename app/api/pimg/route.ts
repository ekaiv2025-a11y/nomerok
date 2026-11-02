import { ALLOWED_IMAGES } from "@/lib/projects";

/** Фото ЖК от застройщика: только ссылки из data/projects.json, ответ кешируется на месяц (Vercel CDN). */
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u") ?? "";
  if (!ALLOWED_IMAGES.has(u)) return new Response("not found", { status: 404 });
  try {
    const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (NomerOk.ge)", Referer: new URL(u).origin + "/" }, signal: AbortSignal.timeout(10000), next: { revalidate: 30 * 86400 } });
    const type = r.headers.get("content-type") ?? "";
    if (!r.ok || !type.startsWith("image/")) return new Response("bad image", { status: 502 });
    return new Response(r.body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=2592000, s-maxage=2592000, immutable" } });
  } catch {
    return new Response("timeout", { status: 504 });
  }
}
