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
} from "./db";
import { botDict } from "./i18n/bot";
import { categoryLabel } from "./categories";
import { formatPhone, normalizePhone, normalizeTelegram, telegramLink, whatsappLink } from "./phone";
import { profileSteps } from "./profile";
import { SITE_NAME, SITE_URL } from "./site";
import { escapeHtml, notifyAdmin, sendTo, tg } from "./telegram";
import type { ClientRequest, Master, MasterStatus } from "./types";

/** Сколько специалистов могут откликнуться на одну общую заявку. */
export const MAX_RESPONSES = 3;

const esc = escapeHtml;

function siteUrl(): string {
  return SITE_URL;
}

/* ---------- рассылка заявки специалистам ---------- */

/** Отправляет заявку подходящим специалистам в Telegram. Возвращает, скольким отправлено. */
export async function distributeRequest(r: ClientRequest): Promise<number> {
  let targets: Master[] = [];
  if (r.master_id) {
    const m = await adminGetMaster(r.master_id);
    if (m && m.status === "published" && m.tg_chat_id && m.phone_verified_at) targets = [m];
  } else {
    targets = await listMastersForRequests(r.category);
  }
  let sent = 0;
  for (const m of targets) {
    const b = botDict(m.lang);
    const text = r.master_id
      ? b.directRequest(esc(r.description), esc(r.when_text))
      : b.newRequest(esc(categoryLabel(r.category, m.lang)), esc(r.description), esc(r.when_text));
    const ok = await sendTo(m.tg_chat_id!, text, [[{ text: b.btnTake, callback_data: `take:${r.id}` }]]);
    if (ok) sent++;
  }
  if (sent > 0) await updateRequest(r.id, { sent_count: sent, status: "sent" });
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
    return sendTo(chatId, botDict(r.lang).clientLinked);
  }

  const masters = await getMastersByChatId(chatId);
  if (masters[0]) return sendCabinetLink(masters[0]);
  return welcome(chatId, guessLang(from));
}

async function onContact(msg: TgMessage) {
  const chatId = msg.chat.id;
  const lang = guessLang(msg.from);
  const c = msg.contact!;
  if (c.user_id && msg.from && c.user_id !== msg.from.id) return sendTo(chatId, botDict(lang).notOwnContact);

  const masters = await getMastersByChatId(chatId);
  const m = masters.find((x) => !x.phone_verified_at) ?? masters[0];
  if (!m) return sendTo(chatId, botDict(lang).noPendingProfile, undefined, removeKeyboard);
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
    masters.find((x) => x.status === "published" && x.phone_verified_at && (r?.master_id ? x.id === r.master_id : x.category === r?.category)) ??
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
    [{ text: b.btnWhatsApp, url: whatsappLink(r.phone) }],
  ]);
  await updateRequest(r.id, { status: "taken" });

  // Клиенту — контакты откликнувшегося специалиста
  if (r.client_tg_chat_id) {
    const cb2 = botDict(r.lang);
    const tgText = m.telegram ? `@${m.telegram}` : "";
    const buttons = [[{ text: cb2.btnProfile, url: `${siteUrl()}/${r.lang}/master/${m.slug}` }]];
    if (m.whatsapp) buttons.push([{ text: cb2.btnWhatsApp, url: whatsappLink(m.phone) }]);
    else buttons.push([{ text: "Telegram", url: telegramLink(m.telegram, m.phone) }]);
    await sendTo(r.client_tg_chat_id, cb2.clientResponse(esc(m.name), esc(categoryLabel(m.category, r.lang)), formatPhone(m.phone), tgText), buttons);
  }
  await notifyAdmin(
    `✋ <b>${esc(m.name)}</b> откликнулся(ась) на заявку «${esc(r.description.slice(0, 80))}» (${esc(r.name || "—")}, ${esc(formatPhone(r.phone))})${
      r.client_tg_chat_id ? "\nКлиент получил уведомление в Telegram." : ""
    }`,
  );
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

  // Человек вставил ссылку t.me/бот?start=… текстом, а не нажал её — понимаем и так
  const pasted = text.match(/[?&]start=([mr]_[a-f0-9]{16,})/i);
  if (pasted) return onStart(msg, pasted[1]);

  // Любое другое сообщение — пересылаем владельцу сайта
  const who = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ");
  const tag = msg.from?.username ? ` @${msg.from.username}` : "";
  const spec = masters[0] ? ` (специалист: ${masters[0].name})` : "";
  await notifyAdmin(`💬 <b>Сообщение боту</b> от ${esc(who || "—")}${esc(tag)}${esc(spec)}:\n\n${esc(text)}`);
  await sendTo(chatId, b.forwarded);
}

export async function handleUpdate(u: TgUpdate): Promise<void> {
  if (u.callback_query) {
    const data = u.callback_query.data ?? "";
    if (data.startsWith("take:")) return void (await onTake(u.callback_query, data.slice(5)));
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
