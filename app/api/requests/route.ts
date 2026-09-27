import { NextResponse } from "next/server";
import { requestSchema, firstErrors, langFromBody } from "@/lib/validation";
import { createRequest, getPublishedMasterBySlug } from "@/lib/db";
import { botLink, notifyAdmin, escapeHtml } from "@/lib/telegram";
import { distributeRequest } from "@/lib/bot";
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

  const parsed = requestSchema(lang).safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, fields: firstErrors(parsed.error) }, { status: 422 });
  const data = parsed.data;

  // Бот заполнил скрытое поле или отправил форму мгновенно — делаем вид, что всё хорошо.
  if (data.website || (data.startedAt && Date.now() - data.startedAt < 2500)) return NextResponse.json({ ok: true });
  if (!rateLimit("req:" + (await clientIp()), 5)) return NextResponse.json({ ok: false, error: e.tooMany }, { status: 429 });

  try {
    const found = data.master_slug ? await getPublishedMasterBySlug(data.master_slug) : null;
    // Пример профиля или специалист на паузе — заявка уходит всем специалистам направления
    const master = found && !found.demo && !found.away ? found : null;
    const saved = await createRequest({
      category: data.category,
      description: data.description,
      when_text: data.when_text,
      name: data.name,
      phone: data.phone,
      master_id: master?.id ?? null,
      lang,
    });

    // Рассылаем заявку подтверждённым специалистам в Telegram
    const sent = await distributeRequest(saved).catch((err) => {
      console.error("[distribute]", err);
      return 0;
    });

    const lines = [
      master ? "✉️ <b>Сообщение специалисту</b>" : "🆕 <b>Новая заявка</b>",
      `<b>Кто нужен:</b> ${escapeHtml(categoryLabel(saved.category, "ru"))}`,
      master ? `<b>Специалист:</b> ${escapeHtml(master.name)} — ${SITE_URL}/ru/master/${master.slug}` : "",
      `<b>Задача:</b> ${escapeHtml(saved.description)}`,
      saved.when_text ? `<b>Когда:</b> ${escapeHtml(saved.when_text)}` : "",
      `<b>Клиент:</b> ${escapeHtml(saved.name || "—")}, ${escapeHtml(formatPhone(saved.phone))}`,
      `<b>Язык сайта:</b> ${LOCALE_NAMES[lang]}`,
      sent > 0
        ? `📨 Отправлено специалистам в Telegram: ${sent}`
        : "⚠️ Нет специалистов с подтверждённым Telegram для этой заявки — передайте вручную.",
      `\n${SITE_URL}/admin`,
    ].filter(Boolean);
    await notifyAdmin(lines.join("\n"));
    return NextResponse.json({ ok: true, tgLink: await botLink(`r_${saved.client_link_token}`) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: e.unavailable }, { status: 500 });
  }
}
