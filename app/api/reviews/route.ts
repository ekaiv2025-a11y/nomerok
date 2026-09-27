import { NextResponse } from "next/server";
import { adminGetMaster } from "@/lib/db";
import { createReview, hasReviewFrom } from "@/lib/reviews-db";
import { readReviewToken } from "@/lib/signed";
import { pickImages, uploadImages } from "@/lib/upload";
import { escapeHtml, notifyAdmin, sendTo } from "@/lib/telegram";
import { botDict } from "@/lib/i18n/bot";
import { getDict, isLocale } from "@/lib/i18n";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { SITE_URL } from "@/lib/site";

/** Новый отзыв: только по подписанной ссылке из бота, публикуется после проверки. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const l = form?.get("lang");
  const lang = isLocale(l) ? l : "ru";
  const d = getDict(lang);
  const t = d.reviews;
  if (!form) return NextResponse.json({ ok: false, error: d.errors.badRequest }, { status: 400 });
  if (form.get("website")) return NextResponse.json({ ok: true });

  const ticket = readReviewToken(String(form.get("t") ?? ""));
  if (!ticket) return NextResponse.json({ ok: false, error: t.expiredText }, { status: 400 });
  if (!rateLimit("review:" + (await clientIp()), 5)) return NextResponse.json({ ok: false, error: d.errors.tooMany }, { status: 429 });

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
    const m = await adminGetMaster(ticket.m);
    if (!m || m.status !== "published") return NextResponse.json({ ok: false, error: t.expiredText }, { status: 404 });
    if (m.tg_chat_id === ticket.c) return NextResponse.json({ ok: false, error: botDict(lang).ownReview }, { status: 400 });
    if (await hasReviewFrom(m.id, ticket.c)) return NextResponse.json({ ok: false, error: t.errDuplicate }, { status: 409 });

    const urls = await uploadImages(`reviews/${m.id}`, photos!);
    const rv = await createReview({ master_id: m.id, request_id: ticket.r, author_name: name, author_chat_id: ticket.c, rating, text, photos: urls });

    await notifyAdmin(
      [
        `⭐ <b>Новый отзыв</b> о ${escapeHtml(m.name)}: ${"★".repeat(rating)}${"☆".repeat(5 - rating)}`,
        `<b>${escapeHtml(name)}</b>${ticket.r ? " (клиент по заявке)" : ""}: ${escapeHtml(text)}`,
        urls.length ? `📷 Фото: ${urls.length}` : "",
        `\nПроверить и опубликовать: ${SITE_URL}/admin?tab=reviews`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    await sendTo(ticket.c, botDict(lang).reviewReceived).catch(() => null);
    return NextResponse.json({ ok: true, id: rv.id });
  } catch (err) {
    console.error("[review]", err);
    return NextResponse.json({ ok: false, error: d.errors.unavailable }, { status: 500 });
  }
}
