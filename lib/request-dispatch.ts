import "server-only";
import { isUrgent } from "./request-hints";
import { adminGetMaster, findMasterByPhone, updateRequest } from "./db";
import { distributeRequest, sendRequestToChosen } from "./bot";
import { getPlace } from "./places-db";
import { orgRequestTargets } from "./org-db";
import { notifyAdmin, escapeHtml, sendTo, telegramChatId } from "./telegram";
import { categoryLabel } from "./categories";
import { formatPhone } from "./phone";
import { SITE_URL } from "./site";
import { LOCALE_NAMES } from "./i18n";
import { cityLabel } from "./cities";
import { looksLikeAd, looksLikeSelf } from "./request-check";
import type { ClientRequest } from "./types";

/*
 * Рассылка заявки: организации, конкретному специалисту или всем специалистам направления, и сообщение администратору.
 * Общие заявки рассылаются только после того, как клиент подключил Telegram или вошёл на сайт (решение владельца, 06.11.2026).
 */

/** Похоже ли на рекламу и не специалист ли это сам — для экрана «заявка отправлена». */
export async function heldOf(saved: ClientRequest): Promise<"specialist" | "self" | null> {
  if (saved.master_id) return null;
  const check = looksLikeAd(saved);
  const asMaster = await findMasterByPhone(saved.phone).catch(() => null);
  if (asMaster && asMaster.status !== "rejected") return "specialist";
  return check.ad && looksLikeSelf(saved.description) ? "self" : null;
}

/** Заявка ждёт одобрения администратора: сообщение с кнопками «Одобрить» / «Спам». */
async function askApproval(saved: ClientRequest, master: { name: string; slug: string } | null) {
  const chat = telegramChatId();
  const text = [
    master ? "✉️ <b>Сообщение специалисту — на проверке</b>" : "🆕 <b>Новая заявка — на проверке</b>",
    isUrgent(saved) ? "🔥 <b>СРОЧНО — клиенту нужно сегодня</b>, одобрите поскорее" : "",
    `<b>Кто нужен:</b> ${escapeHtml(categoryLabel(saved.category, "ru"))} · ${cityLabel(saved.city, "ru")}`,
    master ? `<b>Специалист:</b> ${escapeHtml(master.name)} — ${SITE_URL}/ru/master/${master.slug}` : "",
    `<b>Задача:</b> ${escapeHtml(saved.description)}`,
    saved.when_text ? `<b>Когда:</b> ${escapeHtml(saved.when_text)}` : "",
    saved.photos?.length ? `📷 Фото: ${saved.photos.length}` : "",
    `<b>Клиент:</b> ${escapeHtml(saved.name || "—")}, ${escapeHtml(formatPhone(saved.phone))}`,
    `<b>Язык сайта:</b> ${LOCALE_NAMES[saved.lang]}`,
    "",
    "Специалистам пока не отправлена. Одобрите — и она уйдёт.",
  ]
    .filter(Boolean)
    .join("\n");
  if (chat) await sendTo(Number(chat), text, [[{ text: "✅ Одобрить и разослать", callback_data: `ap:${saved.id}` }], [{ text: "🚫 Спам", callback_data: `rj:${saved.id}` }]]).catch(() => null);
  else await notifyAdmin(text + `\n${SITE_URL}/admin`).catch(() => null);
}

export async function dispatchRequest(saved: ClientRequest, opts: { notSelf?: boolean; approved?: boolean } = {}): Promise<{ sent: number }> {
  const lang = saved.lang;
  // Ручное одобрение: пока администратор не одобрил — никому не рассылаем (если в базе есть поле approved_at)
  if ("approved_at" in saved && !saved.approved_at) {
    const m = saved.master_id ? await adminGetMaster(saved.master_id).catch(() => null) : null;
    await askApproval(saved, m);
    return { sent: 0 };
  }
  const master = saved.master_id ? await adminGetMaster(saved.master_id).catch(() => null) : null;
  // Заявка организации: получат её команда и владелец (а не весь раздел)
  const orgId = (saved as { org_place_id?: string | null }).org_place_id;
  const org = !master && orgId ? await getPlace(orgId).catch(() => null) : null;
  const orgOk = org && org.owner_verified_at ? org : null;

  // Похоже на рекламу (ссылки, «предлагаем», LLC…) — не рассылаем, ждём решения администратора.
  // Сообщение конкретному специалисту рассылаем всегда (он сам решит).
  // Администратор одобрил вручную — его решение важнее автоматических проверок
  const check = master || opts.approved ? { ad: false, reasons: [] as string[] } : looksLikeAd(saved);
  // Номер принадлежит специалисту с анкетой — это он сам, а не клиент
  const asMaster = master || opts.approved ? null : await findMasterByPhone(saved.phone).catch(() => null);
  if (asMaster && asMaster.status !== "rejected") {
    check.ad = true;
    check.reasons.push(`номер специалиста «${asMaster.name}»`);
  }
  if (check.ad && opts.notSelf === true) check.reasons.push("клиент нажал «Нет, я ищу мастера»");
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
  return { sent };
}

/** Клиент подключил Telegram или вошёл — заявка, которая ждала его, уходит специалистам. */
export async function activatePending(r: ClientRequest, chatId: number): Promise<boolean> {
  if (!r.pending_client) return false;
  await updateRequest(r.id, { pending_client: false, client_tg_chat_id: chatId } as never);
  await dispatchRequest({ ...r, pending_client: false, client_tg_chat_id: chatId });
  return true;
}

/** Администратор одобрил: если клиент уже подтвердил — рассылаем сейчас, иначе заявка уйдёт, когда подтвердит. */
export async function approveRequest(r: ClientRequest): Promise<{ sent: number; waiting: boolean }> {
  const now = new Date().toISOString();
  await updateRequest(r.id, { approved_at: now } as never);
  if (r.pending_client) return { sent: 0, waiting: true };
  const res = await dispatchRequest({ ...r, approved_at: now }, { approved: true });
  return { sent: res.sent, waiting: false };
}
