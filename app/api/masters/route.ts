import { NextResponse } from "next/server";
import { masterApplicationSchema, firstErrors, langFromBody } from "@/lib/validation";
import { createMaster } from "@/lib/db";
import { notifyAdmin, escapeHtml } from "@/lib/telegram";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { categoryLabel } from "@/lib/categories";
import { formatPhone } from "@/lib/phone";
import { SITE_URL } from "@/lib/site";
import { getDict, LOCALE_NAMES } from "@/lib/i18n";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = langFromBody(body);
  const e = getDict(lang).errors;
  if (!body) return NextResponse.json({ ok: false, error: e.badRequest }, { status: 400 });

  const parsed = masterApplicationSchema(lang).safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, fields: firstErrors(parsed.error) }, { status: 422 });
  const d = parsed.data;
  if (d.website || (d.startedAt && Date.now() - d.startedAt < 2500)) return NextResponse.json({ ok: true });
  if (!rateLimit("master:" + (await clientIp()), 3)) return NextResponse.json({ ok: false, error: e.tooMany }, { status: 429 });

  try {
    const m = await createMaster({
      name: d.name,
      category: d.category,
      services: d.services,
      about: d.about,
      credentials: d.credentials,
      experience_years: d.experience_years ?? null,
      languages: d.languages,
      price_from: d.price_from ?? null,
      price_unit: d.price_unit,
      phone: d.phone,
      telegram: d.telegram,
      whatsapp: d.whatsapp,
      photo_url: null,
      status: "pending",
      consent_at: new Date().toISOString(),
    });

    await notifyAdmin(
      [
        "🧑‍💼 <b>Новая анкета специалиста</b>",
        `<b>${escapeHtml(m.name)}</b> — ${escapeHtml(categoryLabel(m.category, "ru"))}`,
        `<b>Услуги:</b> ${escapeHtml(m.services)}`,
        `<b>Телефон:</b> ${escapeHtml(formatPhone(m.phone))}${m.telegram ? ` · @${escapeHtml(m.telegram)}` : ""}`,
        `<b>Язык сайта:</b> ${LOCALE_NAMES[lang]}`,
        `\nПроверить и опубликовать: ${SITE_URL}/admin/masters/${m.id}`,
      ].join("\n"),
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: e.unavailable }, { status: 500 });
  }
}
