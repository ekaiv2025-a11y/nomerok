import { NextResponse } from "next/server";
import { getPublishedMasterBySlug } from "@/lib/db";
import { createComplaint } from "@/lib/reviews-db";
import { pickImages, uploadImages } from "@/lib/upload";
import { escapeHtml, notifyAdmin } from "@/lib/telegram";
import { getDict, isLocale } from "@/lib/i18n";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { SITE_URL } from "@/lib/site";

const COMPLAINT_REASONS = ["no_contact", "quality", "price", "fraud", "fake", "rude", "other"] as const;

/** Жалоба на профиль. Видит только администрация. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const l = form?.get("lang");
  const lang = isLocale(l) ? l : "ru";
  const d = getDict(lang);
  const t = d.complaint;
  if (!form) return NextResponse.json({ ok: false, error: d.errors.badRequest }, { status: 400 });
  if (form.get("website")) return NextResponse.json({ ok: true });
  if (!rateLimit("complaint:" + (await clientIp()), 4)) return NextResponse.json({ ok: false, error: d.errors.tooMany }, { status: 429 });

  const reason = String(form.get("reason") ?? "");
  const text = String(form.get("text") ?? "").trim().slice(0, 3000);
  const contact = String(form.get("contact") ?? "").trim().slice(0, 100);
  const slug = String(form.get("master_slug") ?? "").trim();
  const masterText = String(form.get("master_text") ?? "").trim().slice(0, 200);
  const fields: Record<string, string> = {};
  if (!(COMPLAINT_REASONS as readonly string[]).includes(reason)) fields.reason = t.errReason;
  if (text.length < 20) fields.text = t.errText;
  if (contact.replace(/\D/g, "").length < 7 && !/@?[a-z0-9_]{5,}/i.test(contact)) fields.contact = t.errContact;
  const photos = pickImages(form);
  if (!photos) fields.photos = d.reviews.errPhotos;
  if (Object.keys(fields).length) return NextResponse.json({ ok: false, fields }, { status: 422 });

  try {
    const m = slug ? await getPublishedMasterBySlug(slug) : null;
    const master = m && !m.demo ? m : null;
    const urls = await uploadImages("complaints", photos!);
    const c = await createComplaint({
      master_id: master?.id ?? null,
      master_name: master?.name ?? masterText,
      reason,
      text,
      contact,
      photos: urls,
    });
    await notifyAdmin(
      [
        `🚩 <b>Жалоба</b>: ${escapeHtml(getDict("ru").complaint.reasons[reason as (typeof COMPLAINT_REASONS)[number]])}`,
        `<b>На кого:</b> ${escapeHtml(c.master_name || "не указано")}${master ? ` — ${SITE_URL}/ru/master/${master.slug}` : ""}`,
        `<b>Что произошло:</b> ${escapeHtml(text)}`,
        `<b>Контакт:</b> ${escapeHtml(contact)}`,
        urls.length ? `📷 Файлов: ${urls.length}` : "",
        `\n${SITE_URL}/admin?tab=complaints`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[complaint]", err);
    return NextResponse.json({ ok: false, error: d.errors.unavailable }, { status: 500 });
  }
}
