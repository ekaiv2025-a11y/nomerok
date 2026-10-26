import { NextResponse } from "next/server";
import { trackArticleView } from "@/lib/article-views";
import { sourceOf } from "@/lib/site-stats";
import { visitorId } from "@/lib/request-info";
import { isAdmin } from "@/lib/admin-auth";

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|telegram|whatsapp|headless|lighthouse/i;

/** Просмотр статьи (вызывается из браузера — роботов не считаем, админа тоже). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!/^[a-z0-9-]{2,90}$/.test(slug) || BOTS.test(req.headers.get("user-agent") ?? "")) return NextResponse.json({ ok: true });
  if (await isAdmin()) return NextResponse.json({ ok: true });
  // откуда пришли на статью: Google, Telegram… или «внутри сайта» (перешли с другой страницы NomerOk)
  const host = new URL(req.url).hostname.replace(/^www\./, "");
  const ref = typeof body?.ref === "string" ? body.ref : "";
  const s = sourceOf(ref, typeof body?.utm === "string" ? body.utm : "", host);
  await trackArticleView(slug, await visitorId(), s === "прямой заход" && ref ? "внутри сайта" : s).catch(() => null);
  return NextResponse.json({ ok: true });
}
