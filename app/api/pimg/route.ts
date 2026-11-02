import { ALLOWED_IMAGES } from "@/lib/projects";
import { DEVELOPERS } from "@/lib/developers";

const ALLOWED = new Set([...ALLOWED_IMAGES, ...DEVELOPERS.map((d) => d.cover?.url).filter(Boolean) as string[]]);

/** Фото ЖК от застройщика: только ссылки из data/projects.json, ответ кешируется на месяц (Vercel CDN). */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  let u = sp.get("u") ?? "";
  if (!ALLOWED.has(u)) return new Response("not found", { status: 404 });
  // для карточек в списке — уменьшенная копия (у korter.ge есть готовая 1280×960)
  if (sp.get("s") === "1") u = u.replace("/buildings-v2/2560x1920/", "/buildings-v2/1280x960/");
  try {
    const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (NomerOk.ge)", Referer: new URL(u).origin + "/" }, signal: AbortSignal.timeout(10000), next: { revalidate: 30 * 86400 } });
    const type = r.headers.get("content-type") ?? "";
    if (!r.ok || !type.startsWith("image/")) return new Response("bad image", { status: 502 });
    return new Response(r.body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=2592000, s-maxage=2592000, immutable" } });
  } catch {
    return new Response("timeout", { status: 504 });
  }
}
