import { NextResponse } from "next/server";
import { requestSchema, firstErrors, langFromBody } from "@/lib/validation";
import { createRequest, findMasterByPhone, getPublishedMasterBySlug } from "@/lib/db";
import { botLink, notifyAdmin, escapeHtml, sendTo } from "@/lib/telegram";
import { distributeRequest, sendRequestToChosen } from "@/lib/bot";
import { getPlace } from "@/lib/places-db";
import { orgRequestTargets } from "@/lib/org-db";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";
import { categoryLabel } from "@/lib/categories";
import { formatPhone } from "@/lib/phone";
import { SITE_URL } from "@/lib/site";
import { getDict, LOCALE_NAMES } from "@/lib/i18n";
import { cityLabel, cityOf } from "@/lib/cities";
import { currentClient } from "@/lib/client-auth";
import { looksLikeAd, looksLikeSelf } from "@/lib/request-check";
import { updateRequest } from "@/lib/db";

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
      city: master ? (master.city ?? "batumi") : cityOf(body.city),
    });

    // Клиент вошёл в «Мои заявки» — сразу привязываем заявку к его Telegram: отклики придут туда без лишних шагов
    const photos = (Array.isArray(body.photos) ? body.photos : [])
      .filter((u: unknown): u is string => typeof u === "string" && (/^https:\/\/[a-z0-9-]+\.supabase\.co\//.test(u) || (u.startsWith("data:image/") && process.env.LOCAL_DB === "1")))
      .slice(0, 3);
    if (photos.length) {
      await updateRequest(saved.id, { photos }).catch(() => null);
      saved.photos = photos;
    }
    const me = await currentClient();
    if (me) {
      await updateRequest(saved.id, { client_tg_chat_id: me.chatId }).catch(() => null);
      saved.client_tg_chat_id = me.chatId;
    }

    // Заявка организации: получат её команда и владелец (а не весь раздел)
    const org = !master && typeof body.org === "string" ? await getPlace(body.org.slice(0, 40)).catch(() => null) : null;
    const orgOk = org && org.owner_verified_at ? org : null;
    if (orgOk) await updateRequest(saved.id, { org_place_id: orgOk.id } as never).catch(() => null);

    // Похоже на рекламу (ссылки, «предлагаем», LLC…) — не рассылаем, ждём решения администратора.
    // Сообщение конкретному специалисту рассылаем всегда (он сам решит).
    const check = master ? { ad: false, reasons: [] as string[] } : looksLikeAd(saved);
    // Номер принадлежит специалисту с анкетой — это он сам, а не клиент
    const asMaster = master ? null : await findMasterByPhone(saved.phone).catch(() => null);
    if (asMaster && asMaster.status !== "rejected") {
      check.ad = true;
      check.reasons.push(`номер специалиста «${asMaster.name}»`);
    }
    if (check.ad && body.notSelf === true) check.reasons.push("клиент нажал «Нет, я ищу мастера»");
    const held: "specialist" | "self" | null = asMaster && asMaster.status !== "rejected" ? "specialist" : check.ad && looksLikeSelf(saved.description) ? "self" : null;
    let sent = 0;
    if (!check.ad && orgOk) {
      const targets = await orgRequestTargets(orgOk).catch(() => []);
      sent = (await sendRequestToChosen(saved, targets).catch(() => [])).length;
      if (orgOk.owner_chat_id && !targets.some((m) => m.tg_chat_id === orgOk.owner_chat_id)) {
        const ok = await sendTo(
          orgOk.owner_chat_id,
          [
            `📩 <b>Заявка в «${escapeHtml(orgOk.name)}»</b>`,
            `<b>Задача:</b> ${escapeHtml(saved.description)}`,
            saved.when_text ? `<b>Когда:</b> ${escapeHtml(saved.when_text)}` : "",
            `<b>Клиент:</b> ${escapeHtml(saved.name || "—")}, ${escapeHtml(formatPhone(saved.phone))}`,
            targets.length ? `Заявка также отправлена вашей команде: ${targets.length}.` : "Свяжитесь с клиентом напрямую.",
          ]
            .filter(Boolean)
            .join("\n"),
        ).catch(() => null);
        if (ok) sent++;
      }
      if (sent > 0) await updateRequest(saved.id, { status: "sent", sent_count: sent }).catch(() => null);
    } else if (!check.ad) {
      sent = await distributeRequest(saved).catch((err) => {
        console.error("[distribute]", err);
        return 0;
      });
    }

    const lines = [
      master ? "✉️ <b>Сообщение специалисту</b>" : orgOk ? `🏢 <b>Заявка в организацию «${escapeHtml(orgOk.name)}»</b>` : "🆕 <b>Новая заявка</b>",
      `<b>Кто нужен:</b> ${escapeHtml(categoryLabel(saved.category, "ru"))} · ${cityLabel(saved.city, "ru")}`,
      master ? `<b>Специалист:</b> ${escapeHtml(master.name)} — ${SITE_URL}/ru/master/${master.slug}` : "",
      `<b>Задача:</b> ${escapeHtml(saved.description)}`,
      saved.when_text ? `<b>Когда:</b> ${escapeHtml(saved.when_text)}` : "",
      saved.photos?.length ? `📷 Фото: ${saved.photos.length}` : "",
      `<b>Клиент:</b> ${escapeHtml(saved.name || "—")}, ${escapeHtml(formatPhone(saved.phone))}`,
      `<b>Язык сайта:</b> ${LOCALE_NAMES[lang]}`,
      check.ad
        ? `🛑 <b>Похоже на рекламу, а не на заявку</b> (${check.reasons.join(", ")}) — специалистам НЕ разослана. Если всё нормально — нажмите «Разослать» в админке.`
        : sent > 0
          ? `📨 Отправлено специалистам в Telegram: ${sent}`
          : "⚠️ Нет подписанных на заявки специалистов этого направления — передайте вручную.",
      `\n${SITE_URL}/admin`,
    ].filter(Boolean);
    await notifyAdmin(lines.join("\n"));
    return NextResponse.json({ ok: true, held, linked: !!me, claim: me ? null : saved.client_link_token, tgLink: me ? null : await botLink(`r_${saved.client_link_token}`) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: e.unavailable }, { status: 500 });
  }
}
