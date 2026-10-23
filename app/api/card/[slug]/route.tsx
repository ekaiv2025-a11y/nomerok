import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getPublishedMasterBySlug } from "@/lib/db";
import { CARD_STYLES, H, StoryCard, W, cardData, qrDataUrl, type CardStyle } from "@/lib/story-card";
import { cardFonts } from "@/lib/card-fonts";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

/**
 * Карточка для сторис: /api/card/<slug>?s=green|light|photo&qr=1&lang=ru&dl=1
 * dl=1 — скачать файлом. Только опубликованные анкеты.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const m = await getPublishedMasterBySlug(slug).catch(() => null);
  if (!m) return new Response("not found", { status: 404 });
  const style: CardStyle = CARD_STYLES.find((x) => x === sp.get("s")) ?? "green";
  const l = sp.get("lang");
  const lang = l === "en" || l === "ka" ? l : "ru";
  const d = cardData(m, lang, SITE_URL);
  const qr = sp.get("qr") === "1" ? await qrDataUrl(d.url) : null;
  const headers: Record<string, string> = { "Cache-Control": "public, max-age=600, s-maxage=3600" };
  if (sp.get("dl") === "1") headers["Content-Disposition"] = `attachment; filename="nomerok-${m.slug}-${style}${qr ? "-qr" : ""}.png"`;
  return new ImageResponse(<StoryCard d={d} lang={lang} style={style} qr={qr} />, { width: W, height: H, fonts: cardFonts(), headers });
}
