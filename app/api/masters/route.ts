import { NextResponse } from "next/server";
import { masterApplicationSchema, firstErrors } from "@/lib/validation";
import { createMaster, DbNotConfiguredError } from "@/lib/db";
import { notifyAdmin, escapeHtml } from "@/lib/telegram";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { categoryLabel } from "@/lib/categories";
import { formatPhone } from "@/lib/phone";
import { SITE_URL } from "@/lib/site";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный запрос" }, { status: 400 });
  }
  const parsed = masterApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, fields: firstErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;
  if (d.website || (d.startedAt && Date.now() - d.startedAt < 2500)) {
    return NextResponse.json({ ok: true });
  }
  if (!rateLimit("master:" + (await clientIp()), 3)) {
    return NextResponse.json({ ok: false, error: "Слишком много анкет подряд. Попробуйте позже." }, { status: 429 });
  }

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
        `<b>${escapeHtml(m.name)}</b> — ${escapeHtml(categoryLabel(m.category))}`,
        `<b>Услуги:</b> ${escapeHtml(m.services)}`,
        `<b>Телефон:</b> ${escapeHtml(formatPhone(m.phone))}${m.telegram ? ` · @${escapeHtml(m.telegram)}` : ""}`,
        `\nПроверить и опубликовать: ${SITE_URL}/admin/masters/${m.id}`,
      ].join("\n"),
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof DbNotConfiguredError ? "Сайт ещё настраивается, анкеты временно не принимаются." : "Не получилось отправить. Попробуйте ещё раз.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
