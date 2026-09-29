import "server-only";
import {
  addResponse,
  adminGetMaster,
  adminUpdateMaster,
  countResponses,
  createLoginToken,
  getMasterByLinkToken,
  getMastersByChatId,
  getRequest,
  getRequestByLinkToken,
  hasResponse,
  listMastersForRequests,
  updateRequest,
  adminListResponses,
  adminListMasters,
  touchActive,
} from "./db";
import { daysFromToday, formatDay, isAwayNow, servesCategory, todayTbilisi } from "./availability";
import { hasReviewFrom, listRequestsForDirectCheck, listRequestsForFollowup } from "./reviews-db";
import { reviewToken } from "./signed";
import type { Review } from "./types";
import { botDict } from "./i18n/bot";
import { categoryLabel } from "./categories";
import { formatPhone, normalizePhone, normalizeTelegram, telegramLink } from "./phone";
import { profileSteps } from "./profile";
import { SITE_NAME, SITE_URL } from "./site";
import { escapeHtml, notifyAdmin, sendTo, tg } from "./telegram";
import { makeJoinToken } from "./join-token";
import type { ClientRequest, Master, MasterStatus } from "./types";

/** Сколько специалистов могут откликнуться на одну общую заявку. */
export const MAX_RESPONSES = 3;

const esc = escapeHtml;

function siteUrl(): string {
  return SITE_URL;
}

/* ---------- рассылка заявки специалистам ---------- */

/** Отправляет заявку подходящим специалистам в Telegram. Возвращает, скольким отправлено. */
export async function distributeRequest(r: ClientRequest, exclude: Set<string> = new Set()): Promise<number> {
  let targets: Master[] = [];
  if (r.master_id) {
    const m = await adminGetMaster(r.master_id);
    if (m && m.status === "published" && m.tg_chat_id && m.phone_verified_at) targets = [m];
  } else {
    targets = await listMastersForRequests(r.category, r.city ?? "batumi");
  }
  targets = targets.filter((m) => !exclude.has(m.id));
  let sent = 0;
  for (const m of targets) {
    const b = botDict(m.lang);
    const text = r.master_id
      ? b.directRequest(esc(r.description), esc(r.when_text))
      : b.newRequest(esc(categoryLabel(r.category, m.lang)), esc(r.description), esc(r.when_text));
    const ok = await sendTo(m.tg_chat_id!, text, [[{ text: b.btnTake, callback_data: `take:${r.id}` }]]);
    if (ok) sent++;
  }
  if (sent > 0) await updateRequest(r.id, { sent_count: (exclude.size ? r.sent_count ?? 0 : 0) + sent, status: "sent" });
  return sent;
}

/* ---------- уведомления специалисту о модерации ---------- */

function stepsText(m: Master): string {
  const b = botDict(m.lang);
  const { missing } = profileSteps(m);
  if (!missing.length) return b.approvedAllDone;
  return `${b.stepsIntro}\n${missing.map((s, i) => `${i + 1}. ${b.steps[s]}`).join("\n")}`;
}

async function cabinetButton(m: Master) {
  const token = await createLoginToken(m.id);
  return { text: botDict(m.lang).btnCabinet, url: `${siteUrl()}/api/cabinet/login?t=${token}&lang=${m.lang}` };
}

export async function notifyMasterStatus(m: Master, status: MasterStatus): Promise<void> {
  if (!m.tg_chat_id) return;
  const b = botDict(m.lang);
  if (status === "published") {
    const url = `${siteUrl()}/${m.lang}/master/${m.slug}`;
    await sendTo(m.tg_chat_id, `${b.approved(url)}\n\n${stepsText(m)}`, [[await cabinetButton(m)]]);
  } else if (status === "rejected") {
    await sendTo(m.tg_chat_id, b.rejected);
  } else if (status === "hidden") {
    await sendTo(m.tg_chat_id, b.hidden);
  }
}

export async function sendCabinetLink(m: Master): Promise<void> {
  if (!m.tg_chat_id) return;
  await sendTo(m.tg_chat_id, `${botDict(m.lang).cabinetLink}\n\n${stepsText(m)}`, [[await cabinetButton(m)]]);
}

/* ---------- обработка сообщений от Telegram ---------- */

type TgUser = { id: number; first_name?: string; last_name?: string; username?: string; language_code?: string };
type TgMessage = {
  message_id: number;
  chat: { id: number; type: string };
  from?: TgUser;
  text?: string;
  contact?: { phone_number: string; user_id?: number };
};
type TgCallback = { id: string; from: TgUser; data?: string; message?: TgMessage };
export type TgUpdate = { update_id: number; message?: TgMessage; callback_query?: TgCallback };

function guessLang(u?: TgUser): string {
  const l = (u?.language_code ?? "").slice(0, 2);
  return l === "ka" ? "ka" : l === "en" ? "en" : "ru";
}

const removeKeyboard = { reply_markup: { remove_keyboard: true } };

async function welcome(chatId: number, lang: string) {
  const b = botDict(lang);
  await sendTo(chatId, b.welcome(SITE_NAME), [
    [{ text: b.btnFind, url: `${siteUrl()}/${lang}` }],
    [{ text: b.btnJoin, url: `${siteUrl()}/${lang}/join` }],
  ]);
}

async function askContact(m: Master, chatId: number) {
  const b = botDict(m.lang);
  await tg("sendMessage", {
    chat_id: chatId,
    text: b.askContact(esc(m.name), formatPhone(m.phone)),
    parse_mode: "HTML",
    reply_markup: { keyboard: [[{ text: b.btnShareContact, request_contact: true }]], resize_keyboard: true, one_time_keyboard: true },
  });
}

async function onStart(msg: TgMessage, payload: string) {
  const chatId = msg.chat.id;
  const from = msg.from;

  // Специалист пришёл по ссылке из анкеты: t.me/бот?start=m_КОД
  if (payload.startsWith("m_")) {
    const m = await getMasterByLinkToken(payload.slice(2));
    if (!m) return sendTo(chatId, botDict(guessLang(from)).linkInvalid);
    await adminUpdateMaster(m.id, { tg_chat_id: chatId, tg_username: from?.username ?? null });
    if (m.phone_verified_at) {
      await sendTo(chatId, botDict(m.lang).alreadyVerified);
      return sendCabinetLink({ ...m, tg_chat_id: chatId });
    }
    return askContact(m, chatId);
  }

  // Клиент хочет получать отклики: t.me/бот?start=r_КОД
  if (payload.startsWith("r_")) {
    const r = await getRequestByLinkToken(payload.slice(2));
    if (!r) return sendTo(chatId, botDict(guessLang(from)).linkInvalid);
    await updateRequest(r.id, { client_tg_chat_id: chatId });
    const b = botDict(r.lang);
    return sendTo(chatId, b.clientLinked, r.status === "done" ? undefined : [[{ text: b.btnClose, callback_data: `close:${r.id}` }]]);
  }

  // «Оставить отзыв» со страницы специалиста: t.me/бот?start=rv_ID
  if (payload.startsWith("rv_")) return sendReviewLink(chatId, from, payload.slice(3), null);

  // «Заполнить анкету через Telegram» с сайта: t.me/бот?start=j_ru
  if (payload.startsWith("j_")) {
    const lang = ["ru", "en", "ka"].includes(payload.slice(2)) ? payload.slice(2) : guessLang(from);
    const b = botDict(lang);
    return tg("sendMessage", {
      chat_id: chatId,
      text: b.joinAsk,
      parse_mode: "HTML",
      reply_markup: { keyboard: [[{ text: b.btnShareContact, request_contact: true }]], resize_keyboard: true, one_time_keyboard: true },
    });
  }

  const masters = await getMastersByChatId(chatId);
  if (masters[0]) return sendCabinetLink(masters[0]);
  return welcome(chatId, guessLang(from));
}

/** Присылает ссылку на форму отзыва (человек подтверждён своим Telegram). */
async function sendReviewLink(chatId: number, from: TgUser | undefined, masterId: string, requestId: string | null, langHint?: string, nameHint?: string) {
  const lang = langHint ?? guessLang(from);
  const b = botDict(lang);
  const m = /^[0-9a-f-]{36}$/i.test(masterId) ? await adminGetMaster(masterId).catch(() => null) : null;
  if (!m || m.status !== "published") return sendTo(chatId, b.reviewNotFound);
  if (m.tg_chat_id === chatId) return sendTo(chatId, b.ownReview);
  if (await hasReviewFrom(m.id, chatId).catch(() => false)) return sendTo(chatId, b.alreadyReviewed);
  const token = reviewToken({ m: m.id, c: chatId, n: (nameHint || [from?.first_name, from?.last_name].filter(Boolean).join(" ")).slice(0, 60), r: requestId });
  return sendTo(chatId, requestId ? b.reviewInvite(esc(m.name)) : b.reviewStart(esc(m.name)), [
    [{ text: b.btnReview, url: `${siteUrl()}/${lang}/review?t=${token}` }],
  ]);
}

/** Номер получен, анкеты ещё нет — отдаём ссылку на анкету с подставленными данными. */
async function onJoinContact(msg: TgMessage, phone: string) {
  const chatId = msg.chat.id;
  const from = msg.from;
  const lang = guessLang(from);
  const b = botDict(lang);
  let photoFileId: string | null = null;
  if (from) {
    const photos = await tg<{ photos: { file_id: string; width: number }[][] }>("getUserProfilePhotos", { user_id: from.id, limit: 1 });
    const sizes = photos?.photos?.[0];
    if (sizes?.length) photoFileId = [...sizes].sort((a, b2) => b2.width - a.width).find((x) => x.width <= 800)?.file_id ?? sizes[sizes.length - 1].file_id;
  }
  const token = makeJoinToken({
    chatId,
    phone,
    username: normalizeTelegram(from?.username),
    name: [from?.first_name, from?.last_name].filter(Boolean).join(" ").slice(0, 80),
    photoFileId,
  });
  await sendTo(chatId, b.verified, undefined, removeKeyboard);
  await sendTo(chatId, b.joinReady, [[{ text: b.btnJoinContinue, url: `${siteUrl()}/${lang}/join?t=${token}` }]]);
}

async function onContact(msg: TgMessage) {
  const chatId = msg.chat.id;
  const lang = guessLang(msg.from);
  const c = msg.contact!;
  if (c.user_id && msg.from && c.user_id !== msg.from.id) return sendTo(chatId, botDict(lang).notOwnContact);

  const masters = await getMastersByChatId(chatId);
  const m = masters.find((x) => !x.phone_verified_at) ?? masters[0];
  if (!m) {
    const phone = normalizePhone("+" + c.phone_number.replace(/^\+/, ""));
    if (!phone || (c.user_id && msg.from && c.user_id !== msg.from.id)) return sendTo(chatId, botDict(lang).noPendingProfile, undefined, removeKeyboard);
    return onJoinContact(msg, phone);
  }
  const b = botDict(m.lang);
  if (m.phone_verified_at) return sendTo(chatId, b.alreadyVerified, undefined, removeKeyboard);

  const tgPhone = normalizePhone("+" + c.phone_number.replace(/^\+/, ""));
  const same = tgPhone && tgPhone.replace(/\D/g, "") === m.phone.replace(/\D/g, "");
  if (!same) {
    await notifyAdmin(
      `⚠️ <b>${esc(m.name)}</b>: номер Telegram ${esc(formatPhone(tgPhone ?? c.phone_number))} не совпадает с анкетой ${esc(formatPhone(m.phone))}\n${siteUrl()}/admin/masters/${m.id}`,
    );
    return sendTo(chatId, b.mismatch(formatPhone(tgPhone ?? c.phone_number), formatPhone(m.phone)), undefined, removeKeyboard);
  }

  const patch: Partial<Master> = { phone_verified_at: new Date().toISOString() };
  const uname = normalizeTelegram(msg.from?.username);
  if (!m.telegram && uname) patch.telegram = uname;
  await adminUpdateMaster(m.id, patch);
  const next = m.status === "published" ? b.verifiedPublished : b.verifiedPending;
  await sendTo(chatId, `${b.verified}\n${next}`, undefined, removeKeyboard);
  await notifyAdmin(`✅ <b>${esc(m.name)}</b> подтвердил(а) номер через Telegram\n${siteUrl()}/admin/masters/${m.id}`);
}

async function onTake(cb: TgCallback, requestId: string) {
  const chatId = cb.from.id;
  const answer = (text: string) => tg("answerCallbackQuery", { callback_query_id: cb.id, text, show_alert: true });

  const r = await getRequest(requestId);
  const masters = await getMastersByChatId(chatId);
  const m =
    masters.find((x) => x.status === "published" && x.phone_verified_at && (r?.master_id ? x.id === r.master_id : !!r && servesCategory(x, r.category))) ??
    null;
  const b = botDict(m?.lang ?? guessLang(cb.from));
  if (!r || r.status === "spam" || r.status === "done") return answer(b.requestGone);
  if (!m) return answer(b.notAllowed);

  if (await hasResponse(r.id, m.id)) return answer(b.alreadyYours);
  if (!r.master_id && (await countResponses(r.id)) >= MAX_RESPONSES) return answer(b.requestFull);

  const res = await addResponse(r.id, m.id);
  if (!res.created) return answer(b.alreadyYours);

  await tg("answerCallbackQuery", { callback_query_id: cb.id });
  if (cb.message) {
    await tg("editMessageReplyMarkup", {
      chat_id: chatId,
      message_id: cb.message.message_id,
      reply_markup: { inline_keyboard: [[{ text: b.takenButtonDone, callback_data: "noop" }]] },
    });
  }
  await sendTo(chatId, b.takenMaster(esc(r.name || "—"), formatPhone(r.phone), esc(r.description)), [
    [{ text: b.btnTelegram, url: telegramLink(null, r.phone) }],
  ]);
  await updateRequest(r.id, { status: "taken" });
  if (m.missed_direct) await adminUpdateMaster(m.id, { missed_direct: 0 });

  // Клиенту — контакты откликнувшегося специалиста
  if (r.client_tg_chat_id) {
    const cb2 = botDict(r.lang);
    const tgText = m.telegram ? `@${m.telegram}` : "";
    const buttons = [[{ text: cb2.btnProfile, url: `${siteUrl()}/${r.lang}/master/${m.slug}` }]];
    buttons.push([{ text: cb2.btnTelegram, url: telegramLink(m.telegram, m.phone) }]);
    await sendTo(r.client_tg_chat_id, cb2.clientResponse(esc(m.name), esc(categoryLabel(m.category, r.lang)), formatPhone(m.phone), tgText), buttons);
  }
  await notifyAdmin(
    `✋ <b>${esc(m.name)}</b> откликнулся(ась) на заявку «${esc(r.description.slice(0, 80))}» (${esc(r.name || "—")}, ${esc(formatPhone(r.phone))})${
      r.client_tg_chat_id ? "\nКлиент получил уведомление в Telegram." : ""
    }`,
  );
}

/* ---------- ответы клиента: закрыть заявку, «удалось договориться?» ---------- */

async function respondersOf(requestId: string): Promise<Master[]> {
  const all = (await adminListResponses()).filter((x) => x.request_id === requestId).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const list: Master[] = [];
  for (const x of all) {
    const m = await adminGetMaster(x.master_id);
    if (m) list.push(m);
  }
  return list;
}

/* ---------- пауза: «в отпуске / не принимаю заявки» ---------- */

async function onAway(cb: TgCallback, days: number) {
  await tg("answerCallbackQuery", { callback_query_id: cb.id });
  const masters = await getMastersByChatId(cb.from.id);
  if (!masters[0]) return;
  const b = botDict(masters[0].lang);
  const until = days > 0 && days <= 366 ? daysFromToday(days) : null;
  for (const m of masters) await adminUpdateMaster(m.id, { is_away: true, away_until: until });
  if (cb.message) await tg("editMessageReplyMarkup", { chat_id: cb.from.id, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
  await notifyAdmin(`⏸ <b>${esc(masters[0].name)}</b> поставил(а) паузу ${until ? `до ${until}` : "без срока"}`);
  return sendTo(cb.from.id, b.paused(until ? formatDay(until, masters[0].lang) : null));
}

/* ---------- активность и архив ---------- */

const DAY = 24 * 3600 * 1000;
/** Сколько личных заявок подряд без ответа — и профиль уходит в архив */
export const MISSED_DIRECT_LIMIT = 3;

async function onAlive(cb: TgCallback) {
  await tg("answerCallbackQuery", { callback_query_id: cb.id });
  const masters = await getMastersByChatId(cb.from.id);
  if (!masters[0]) return;
  if (cb.message) await tg("editMessageReplyMarkup", { chat_id: cb.from.id, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
  return sendTo(cb.from.id, botDict(masters[0].lang).stillHereOk);
}

export async function unarchiveMaster(m: Master) {
  await adminUpdateMaster(m.id, {
    archived_at: null,
    archived_reason: null,
    missed_direct: 0,
    inactive_warned_at: null,
    last_active_at: new Date().toISOString(),
  });
}

async function onUnarchive(cb: TgCallback) {
  await tg("answerCallbackQuery", { callback_query_id: cb.id });
  const masters = (await getMastersByChatId(cb.from.id)).filter((m) => m.archived_at);
  if (!masters.length) return;
  for (const m of masters) await unarchiveMaster(m);
  if (cb.message) await tg("editMessageReplyMarkup", { chat_id: cb.from.id, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
  await notifyAdmin(`↩️ <b>${esc(masters[0].name)}</b> вернул(а) профиль из архива`);
  return sendTo(cb.from.id, botDict(masters[0].lang).unarchived);
}

export async function archiveMaster(m: Master, reason: "inactive" | "missed") {
  await adminUpdateMaster(m.id, { archived_at: new Date().toISOString(), archived_reason: reason });
  if (m.tg_chat_id) {
    const b = botDict(m.lang);
    await sendTo(m.tg_chat_id, reason === "inactive" ? b.archivedInactive : b.archivedMissed, [[{ text: b.btnUnarchive, callback_data: "unarchive" }]]);
  }
  await notifyAdmin(
    `📦 <b>${esc(m.name)}</b> — профиль в архиве: ${reason === "inactive" ? "больше месяца без активности" : `${MISSED_DIRECT_LIMIT} личные заявки подряд без ответа`}\n${siteUrl()}/admin/masters/${m.id}`,
  );
}

/** Личная заявка сутки без ответа — передаём другим; после нескольких таких — архив. */
async function checkDirectMisses(): Promise<number> {
  const now = Date.now();
  let n = 0;
  for (const r of await listRequestsForDirectCheck()) {
    if (!r.master_id || r.direct_checked_at || r.status !== "sent" || now - new Date(r.created_at).getTime() < DAY) continue;
    const m = await adminGetMaster(r.master_id);
    await updateRequest(r.id, { direct_checked_at: new Date().toISOString(), master_id: null });
    n++;
    if (m) {
      const missed = (m.missed_direct ?? 0) + 1;
      await adminUpdateMaster(m.id, { missed_direct: missed });
      if (m.tg_chat_id) await sendTo(m.tg_chat_id, botDict(m.lang).directMissedMaster);
      if (missed >= MISSED_DIRECT_LIMIT && !m.archived_at) await archiveMaster(m, "missed");
    }
    // Заявка становится общей и уходит другим специалистам направления
    const sent = await distributeRequest({ ...r, master_id: null }, new Set(m ? [m.id] : ["-"]));
    if (r.client_tg_chat_id && m) await sendTo(r.client_tg_chat_id, botDict(r.lang).directMissedClient(esc(m.name)));
    await notifyAdmin(`⏰ Личная заявка для <b>${esc(m?.name ?? "—")}</b> сутки без ответа — передана другим (${sent}).\n«${esc(r.description.slice(0, 80))}»`);
  }
  return n;
}

/** Месяц без активности — предупреждаем; ещё неделя тишины — архив. */
async function checkInactivity(): Promise<{ warned: number; archived: number }> {
  const out = { warned: 0, archived: 0 };
  const now = Date.now();
  for (const m of await adminListMasters()) {
    if (m.status !== "published" || m.archived_at || isAwayNow(m) || !m.tg_chat_id || !m.last_active_at) continue;
    const idle = now - new Date(m.last_active_at).getTime();
    if (idle < 30 * DAY) continue;
    if (!m.inactive_warned_at) {
      const b = botDict(m.lang);
      await sendTo(m.tg_chat_id, b.inactiveWarn, [[{ text: b.btnStillHere, callback_data: "alive" }]]);
      await adminUpdateMaster(m.id, { inactive_warned_at: new Date().toISOString() });
      out.warned++;
    } else if (now - new Date(m.inactive_warned_at).getTime() >= 7 * DAY) {
      await archiveMaster(m, "inactive");
      out.archived++;
    }
  }
  return out;
}

/** По понедельникам — недельная сводка специалисту: просмотры, контакты, взятые заявки. */
async function sendWeeklyStats(force = false): Promise<number> {
  const weekday = new Date(todayTbilisi() + "T12:00:00Z").getUTCDay(); // 1 = понедельник
  if (weekday !== 1 && !force) return 0;
  const { masterStats } = await import("./stats");
  const { reviewStats } = await import("./reviews-db");
  const reviewsBy = await reviewStats().catch(() => new Map<string, { sum: number; n: number }>());
  let n = 0;
  for (const m of await adminListMasters()) {
    if (m.status !== "published" || m.archived_at || !m.tg_chat_id || !m.phone_verified_at) continue;
    if (m.stats_sent_at && Date.now() - new Date(m.stats_sent_at).getTime() < 6 * DAY) continue;
    const st = await masterStats(m.id, 7).catch(() => null);
    if (!st) continue;
    const b = botDict(m.lang);
    const tip = !(m.portfolio ?? []).length ? b.statsTipPhotos : !reviewsBy.get(m.id) ? b.statsTipReviews : b.statsTipDone;
    await sendTo(m.tg_chat_id, `${b.weeklyStats(st.views, st.contacts, st.taken)}\n\n${tip}`, [[await cabinetButton(m)]]);
    await adminUpdateMaster(m.id, { stats_sent_at: new Date().toISOString() });
    n++;
  }
  return n;
}

/** Пауза закончилась — включаем заявки обратно и сообщаем специалисту. */
async function endExpiredPauses(): Promise<number> {
  const today = todayTbilisi();
  let n = 0;
  for (const m of await adminListMasters()) {
    if (m.is_away && m.away_until && m.away_until < today) {
      await adminUpdateMaster(m.id, { is_away: false, away_until: null });
      if (m.tg_chat_id) await sendTo(m.tg_chat_id, botDict(m.lang).autoResumed);
      n++;
    }
  }
  return n;
}

const RESENT_MARK = "[разослана повторно]";

async function onClientAnswer(cb: TgCallback, data: string) {
  const [kind, requestId, idx] = data.split(":");
  const r = await getRequest(requestId);
  await tg("answerCallbackQuery", { callback_query_id: cb.id });
  if (!r || r.client_tg_chat_id !== cb.from.id) return;
  const b = botDict(r.lang);
  const chatId = cb.from.id;
  const clearButtons = () =>
    cb.message && tg("editMessageReplyMarkup", { chat_id: chatId, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
  const now = new Date().toISOString();
  const short = esc(r.description.slice(0, 60));

  if (kind === "close") {
    await clearButtons();
    if (r.status !== "done") {
      await updateRequest(r.id, { status: "done", outcome: r.outcome ?? "closed", outcome_at: r.outcome_at ?? now });
      await notifyAdmin(`🔒 Клиент закрыл заявку «${short}» (${esc(r.name || "—")})`);
    }
    return sendTo(chatId, b.closedOk);
  }
  if (kind === "later") {
    await clearButtons();
    return sendTo(chatId, b.laterOk);
  }
  if (kind === "nohelp") {
    await clearButtons();
    await updateRequest(r.id, { outcome: "none", outcome_at: now });
    await notifyAdmin(`😕 Клиенту не подошли откликнувшиеся специалисты по заявке «${short}» (${esc(r.name || "—")}, ${esc(formatPhone(r.phone))}). Клиенту предложено разослать заявку ещё раз.`);
    // Повторно разослать можно один раз — чтобы не засыпать специалистов одной и той же заявкой
    if ((r.admin_note ?? "").includes(RESENT_MARK)) return sendTo(chatId, b.resentNone, [[{ text: b.btnCatalog, url: `${siteUrl()}/${r.lang}` }]]);
    return sendTo(chatId, b.noHelpOk, [
      [{ text: b.btnResend, callback_data: `resend:${r.id}` }],
      [{ text: b.btnCatalog, url: `${siteUrl()}/${r.lang}` }],
      [{ text: b.btnClose, callback_data: `close:${r.id}` }],
    ]);
  }
  if (kind === "resend") {
    await clearButtons();
    if (r.status === "done") return sendTo(chatId, b.closedOk);
    if ((r.admin_note ?? "").includes(RESENT_MARK)) return sendTo(chatId, b.resentNone);
    const already = new Set((await adminListResponses()).filter((x) => x.request_id === r.id).map((x) => x.master_id));
    const sent = await distributeRequest(r, already.size ? already : new Set(["-"]));
    // Начинаем заново: через сутки снова спросим, удалось ли договориться
    await updateRequest(r.id, { outcome: null, outcome_at: null, followup_at: null, admin_note: `${r.admin_note ?? ""} ${RESENT_MARK}`.trim() });
    if (sent > 0) return sendTo(chatId, b.resentOk(sent));
    await notifyAdmin(`⚠️ Заявку «${short}» (${esc(r.name || "—")}, ${esc(formatPhone(r.phone))}) некому разослать повторно — найдите специалиста вручную.\n${siteUrl()}/admin`);
    return sendTo(chatId, b.resentNone);
  }
  if (kind === "deal") {
    const m = (await respondersOf(r.id))[Number(idx)];
    if (!m) return;
    await clearButtons();
    await updateRequest(r.id, { status: "in_work", outcome: "agreed", outcome_master_id: m.id, outcome_at: now });
    await notifyAdmin(`🤝 Клиент договорился с <b>${esc(m.name)}</b> по заявке «${short}»`);
    return sendTo(chatId, b.dealOk(esc(m.name)));
  }
}

/* ---------- ежедневные напоминания (запускает /api/cron/daily) ---------- */

const HOUR = 3600 * 1000;

export async function runFollowups() {
  const pausesEnded = await endExpiredPauses().catch(() => 0);
  const directMissed = await checkDirectMisses().catch((e) => (console.error("[direct]", e), 0));
  const inactivity = await checkInactivity().catch((e) => (console.error("[inactive]", e), { warned: 0, archived: 0 }));
  const weeklyStats = await sendWeeklyStats().catch((e) => (console.error("[stats]", e), 0));
  const out = { noResponse: 0, asked: 0, reviewInvites: 0, pausesEnded, directMissed, inactiveWarned: inactivity.warned, archived: inactivity.archived, weeklyStats };
  const now = Date.now();
  const list = await listRequestsForFollowup();
  for (const r of list) {
    const chatId = r.client_tg_chat_id;
    if (!chatId || r.status === "spam") continue;
    const b = botDict(r.lang);
    const age = now - new Date(r.created_at).getTime();
    const short = esc(r.description.slice(0, 60));

    // 1. Никто не взял заявку за сутки
    const justRedirected = r.direct_checked_at && now - new Date(r.direct_checked_at).getTime() < 20 * HOUR;
    if ((r.status === "new" || r.status === "sent") && !r.followup_at && age > 20 * HOUR && !justRedirected) {
      await sendTo(chatId, b.noResponse(short), [
        [{ text: b.btnCatalog, url: `${siteUrl()}/${r.lang}` }],
        [{ text: b.btnClose, callback_data: `close:${r.id}` }],
      ]);
      await updateRequest(r.id, { followup_at: new Date().toISOString() });
      await notifyAdmin(`⏰ Заявку «${short}» (${esc(r.name || "—")}, ${esc(formatPhone(r.phone))}) за сутки никто не взял — передайте вручную.\n${siteUrl()}/admin`);
      out.noResponse++;
      continue;
    }

    // 2. Кто-то откликнулся — через сутки спрашиваем, удалось ли договориться
    if (r.status === "taken" && !r.followup_at && !r.outcome && age > 20 * HOUR) {
      const ms = await respondersOf(r.id);
      if (!ms.length) continue;
      const buttons = ms.slice(0, 3).map((m, i) => [{ text: b.btnDealWith(m.name.split(" ")[0]), callback_data: `deal:${r.id}:${i}` }]);
      buttons.push([{ text: b.btnLater, callback_data: `later:${r.id}` }], [{ text: b.btnNoHelp, callback_data: `nohelp:${r.id}` }]);
      await sendTo(chatId, b.followupAsk(short), buttons);
      await updateRequest(r.id, { followup_at: new Date().toISOString() });
      out.asked++;
      continue;
    }

    // 3. Договорились — через 2 дня просим отзыв
    if (r.outcome === "agreed" && r.outcome_master_id && !r.review_invited_at && r.outcome_at && now - new Date(r.outcome_at).getTime() > 44 * HOUR) {
      await sendReviewLink(chatId, undefined, r.outcome_master_id, r.id, r.lang, r.name);
      await updateRequest(r.id, { review_invited_at: new Date().toISOString(), status: "done" });
      out.reviewInvites++;
    }
  }
  return out;
}

/** Отзыв опубликован — сообщаем специалисту и автору. */
export async function notifyReviewPublished(rv: Review) {
  const m = await adminGetMaster(rv.master_id);
  if (m?.tg_chat_id) {
    const b = botDict(m.lang);
    await sendTo(m.tg_chat_id, b.reviewPublishedMaster("★".repeat(rv.rating) + "☆".repeat(5 - rv.rating)), [
      [{ text: b.btnCabinet, url: `${siteUrl()}/${m.lang}/cabinet` }],
    ]);
  }
  if (m) await sendTo(rv.author_chat_id, botDict(m.lang).reviewPublishedClient(esc(m.name)));
}

async function onText(msg: TgMessage) {
  const chatId = msg.chat.id;
  const text = (msg.text ?? "").trim();
  const masters = await getMastersByChatId(chatId);
  const lang = masters[0]?.lang ?? guessLang(msg.from);
  const b = botDict(lang);

  if (text === "/cabinet" || text.startsWith("/cabinet@")) {
    if (masters[0]) return sendCabinetLink(masters[0]);
    return sendTo(chatId, b.notSpecialist, [[{ text: b.btnJoin, url: `${siteUrl()}/${lang}/join` }]]);
  }
  if (text === "/help" || text.startsWith("/help@")) return sendTo(chatId, b.help);
  if (text === "/pause" || text.startsWith("/pause@")) {
    if (!masters[0]) return sendTo(chatId, b.notSpecialistShort);
    return sendTo(chatId, b.pauseAsk, [
      [
        { text: b.btnWeek, callback_data: "away:7" },
        { text: b.btn2Weeks, callback_data: "away:14" },
      ],
      [
        { text: b.btnMonth, callback_data: "away:30" },
        { text: b.btnNoEnd, callback_data: "away:0" },
      ],
    ]);
  }
  if (text === "/resume" || text.startsWith("/resume@")) {
    if (!masters[0]) return sendTo(chatId, b.notSpecialistShort);
    for (const m of masters) await adminUpdateMaster(m.id, { is_away: false, away_until: null });
    await notifyAdmin(`▶️ <b>${esc(masters[0].name)}</b> снова принимает заявки`);
    return sendTo(chatId, b.resumed);
  }

  // Человек вставил ссылку t.me/бот?start=… текстом, а не нажал её — понимаем и так
  const pasted = text.match(/[?&]start=([mr]_[a-f0-9]{16,})/i);
  if (pasted) return onStart(msg, pasted[1]);

  // Человек набрал номер телефона текстом вместо кнопки «Поделиться номером» — подсказываем
  const looksLikePhone = !/\p{L}/u.test(text) && (text.match(/\d/g) ?? []).length >= 9;
  if (looksLikePhone && !masters[0]) {
    await tg("sendMessage", {
      chat_id: chatId,
      text: b.typedPhone,
      parse_mode: "HTML",
      reply_markup: { keyboard: [[{ text: b.btnShareContact, request_contact: true }]], resize_keyboard: true, one_time_keyboard: true },
    });
    const who0 = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ");
    const tag0 = msg.from?.username ? ` @${msg.from.username}` : "";
    await notifyAdmin(`📱 ${esc(who0 || "—")}${esc(tag0)} ввёл(а) номер текстом вместо кнопки — бот подсказал нажать «Поделиться номером»:\n\n${esc(text)}`);
    return;
  }

  // Любое другое сообщение — пересылаем владельцу сайта
  const who = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ");
  const tag = msg.from?.username ? ` @${msg.from.username}` : "";
  const spec = masters[0] ? ` (специалист: ${masters[0].name})` : "";
  await notifyAdmin(`💬 <b>Сообщение боту</b> от ${esc(who || "—")}${esc(tag)}${esc(spec)}:\n\n${esc(text)}`);
  await sendTo(chatId, b.forwarded);
}

export async function handleUpdate(u: TgUpdate): Promise<void> {
  // Любое действие специалиста в боте = он на связи
  const fromId = u.callback_query?.from.id ?? u.message?.from?.id;
  if (fromId) {
    const mine = await getMastersByChatId(fromId).catch(() => []);
    if (mine.length) await touchActive(mine);
  }
  if (u.callback_query) {
    const data = u.callback_query.data ?? "";
    if (data.startsWith("take:")) return void (await onTake(u.callback_query, data.slice(5)));
    if (data === "alive") return void (await onAlive(u.callback_query));
    if (data === "unarchive") return void (await onUnarchive(u.callback_query));
    if (data.startsWith("away:")) return void (await onAway(u.callback_query, Number(data.slice(5))));
    if (/^(close|deal|later|nohelp|resend):/.test(data)) return void (await onClientAnswer(u.callback_query, data));
    await tg("answerCallbackQuery", { callback_query_id: u.callback_query.id });
    return;
  }
  const msg = u.message;
  if (!msg || msg.chat.type !== "private") return;
  if (msg.contact) return void (await onContact(msg));
  const text = msg.text ?? "";
  if (text.startsWith("/start")) return void (await onStart(msg, text.split(/\s+/)[1] ?? ""));
  if (text) return void (await onText(msg));
}

/* ---------- подключение бота к сайту ---------- */

export async function setupBot(baseUrl: string, secret: string): Promise<{ ok: boolean; url: string }> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/telegram/webhook`;
  const ok = await tg("setWebhook", { url, secret_token: secret, allowed_updates: ["message", "callback_query"] });
  for (const lang of ["ru", "en", "ka"] as const) {
    const b = botDict(lang);
    await tg("setMyCommands", {
      commands: [
        { command: "cabinet", description: b.commands.cabinet },
        { command: "pause", description: b.commands.pause },
        { command: "resume", description: b.commands.resume },
        { command: "help", description: b.commands.help },
      ],
      ...(lang === "ru" ? {} : { language_code: lang }),
    });
  }
  return { ok: ok !== null, url };
}

/** Ссылка для подключения Telegram специалистом (для админки и после анкеты). */
export async function masterTelegramLink(m: Pick<Master, "tg_link_token">): Promise<string | null> {
  const { botLink } = await import("./telegram");
  return botLink(`m_${m.tg_link_token}`);
}
