import { NextResponse } from "next/server";
import { requestSchema, firstErrors } from "@/lib/validation";
import { createRequest, getPublishedMasterBySlug, DbNotConfiguredError } from "@/lib/db";
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
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, fields: firstErrors(parsed.error) }, { status: 422 });
  }
  const data = parsed.data;

  // Бот заполнил скрытое поле или отправил форму мгновенно — делаем вид, что всё хорошо.
  if (data.website || (data.startedAt && Date.now() - data.startedAt < 2500)) {
    return NextResponse.json({ ok: true });
  }
  if (!rateLimit("req:" + (await clientIp()), 5)) {
    return NextResponse.json({ ok: false, error: "Слишком много заявок подряд. Попробуйте через 10 минут." }, { status: 429 });
  }

  try {
    const master = data.master_slug ? await getPublishedMasterBySlug(data.master_slug) : null;
    const saved = await createRequest({
      category: data.category,
      description: data.description,
      when_text: data.when_text,
      name: data.name,
      phone: data.phone,
      master_id: master?.id ?? null,
    });

    const lines = [
      "🆕 <b>Новая заявка</b>",
      `<b>Кто нужен:</b> ${escapeHtml(categoryLabel(saved.category))}`,
      master ? `<b>Специалист:</b> ${escapeHtml(master.name)} — ${SITE_URL}/master/${master.slug}` : "",
      `<b>Задача:</b> ${escapeHtml(saved.description)}`,
      saved.when_text ? `<b>Когда:</b> ${escapeHtml(saved.when_text)}` : "",
      `<b>Клиент:</b> ${escapeHtml(saved.name || "—")}, ${escapeHtml(formatPhone(saved.phone))}`,
      `\n${SITE_URL}/admin`,
    ].filter(Boolean);
    await notifyAdmin(lines.join("\n"));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof DbNotConfiguredError ? "Сайт ещё настраивается, заявки временно не принимаются." : "Не получилось отправить. Попробуйте ещё раз.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
