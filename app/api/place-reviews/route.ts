import { NextResponse } from "next/server";
import { getPlace } from "@/lib/places-db";
import { createPlaceReview, hasPlaceReviewFrom } from "@/lib/place-reviews-db";
import { readPlaceReviewToken } from "@/lib/signed";
import { pickImages, uploadImages } from "@/lib/upload";
import { escapeHtml, notifyAdmin, sendTo } from "@/lib/telegram";
import { botDict } from "@/lib/i18n/bot";
import { getDict, isLocale } from "@/lib/i18n";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { SITE_URL } from "@/lib/site";

/** Отзыв о месте: только по подписанной ссылке из бота, публикуется после проверки. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const l = form?.get("lang");
  const lang = isLocale(l) ? l : "ru";
  const d = getDict(lang);
  const t = d.reviews;
  if (!form) return NextResponse.json({ ok: false, error: d.errors.badRequest }, { status: 400 });
  if (form.get("website")) return NextResponse.json({ ok: true });
  const ticket = readPlaceReviewToken(String(form.get("t") ?? ""));
  if (!ticket) return NextResponse.json({ ok: false, error: t.expiredText }, { status: 400 });
  if (!rateLimit("preview:" + (await clientIp()), 5)) return NextResponse.json({ ok: false, error: d.errors.tooMany }, { status: 429 });

  const rating = Number(form.get("rating"));
  const text = String(form.get("text") ?? "").trim().slice(0, 2000);
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const fields: Record<string, string> = {};
  if (!(rating >= 1 && rating <= 5 && Number.isInteger(rating))) fields.rating = t.errRating;
  if (text.length < 20) fields.text = t.errText;
  if (name.length < 2) fields.name = t.errName;
  const photos = pickImages(form);
  if (!photos) fields.photos = t.errPhotos;
  if (Object.keys(fields).length) return NextResponse.json({ ok: false, fields }, { status: 422 });

  try {
    const p = await getPlace(ticket.p);
    if (!p || p.status !== "published") return NextResponse.json({ ok: false, error: t.expiredText }, { status: 404 });
    if (p.owner_chat_id === ticket.c) return NextResponse.json({ ok: false, error: botDict(lang).ownReview }, { status: 400 });
    if (await hasPlaceReviewFrom(p.id, ticket.c)) return NextResponse.json({ ok: false, error: t.errDuplicate }, { status: 409 });
    const urls = await uploadImages(`place-reviews/${p.id}`, photos!);
    await createPlaceReview({ place_id: p.id, author_name: name, author_chat_id: ticket.c, rating, text, photos: urls });
    await notifyAdmin(
      [
        `⭐ <b>Отзыв о месте</b> ${escapeHtml(p.name)}: ${"★".repeat(rating)}${"☆".repeat(5 - rating)}`,
        `<b>${escapeHtml(name)}</b>: ${escapeHtml(text)}`,
        urls.length ? `📷 Фото: ${urls.length}` : "",
        `\nПроверить и опубликовать: ${SITE_URL}/admin/places`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    await sendTo(ticket.c, botDict(lang).reviewReceived).catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[place-review]", err);
    return NextResponse.json({ ok: false, error: d.errors.unavailable }, { status: 500 });
  }
}
