import "server-only";
import { createHash } from "crypto";

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Достаёт токен бота из того, что вставили в настройки: работает, даже если
 * случайно попали пробелы, кавычки, слово "bot" или вся ссылка целиком.
 */
export function telegramToken(): string | null {
  const raw = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const m = raw.match(/(\d{5,}:[A-Za-z0-9_-]{30,})/);
  return m ? m[1] : null;
}

/** ID чата: только цифры (у групп — с минусом впереди). */
export function telegramChatId(): string | null {
  const raw = process.env.TELEGRAM_ADMIN_CHAT_ID ?? "";
  const m = raw.match(/-?\d{5,}/);
  return m ? m[0] : null;
}

const API_BASE = (process.env.TELEGRAM_API_BASE || "https://api.telegram.org").replace(/\/$/, "");

/** Вызов любого метода Telegram Bot API. Возвращает result или null при ошибке. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function tg<T = any>(method: string, payload: Record<string, unknown> = {}): Promise<T | null> {
  const token = telegramToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    const j = await res.json().catch(() => null);
    if (!j?.ok) {
      console.error(`[telegram] ${method} ошибка`, res.status, JSON.stringify(j));
      return null;
    }
    return j.result as T;
  } catch (e) {
    console.error(`[telegram] ${method} не удалось`, e);
    return null;
  }
}

type Button = { text: string; url?: string; callback_data?: string };

/** Сообщение пользователю бота. buttons — ряды кнопок под сообщением. */
export async function sendTo(chatId: number | string, html: string, buttons?: Button[][], extra: Record<string, unknown> = {}) {
  return tg("sendMessage", {
    chat_id: chatId,
    text: html,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
    ...extra,
  });
}

let cachedUsername: string | null = null;
/** Имя бота (для ссылок t.me/…). */
export async function botUsername(): Promise<string | null> {
  const env = (process.env.TELEGRAM_BOT_USERNAME ?? "").replace(/^@/, "").trim();
  if (env) return env;
  if (cachedUsername) return cachedUsername;
  const me = await tg<{ username: string }>("getMe");
  cachedUsername = me?.username ?? null;
  return cachedUsername;
}

export async function botLink(payload: string): Promise<string | null> {
  const u = await botUsername();
  return u ? `https://t.me/${u}?start=${payload}` : null;
}

/** Секрет, которым Telegram подписывает запросы к нашему вебхуку. */
export function webhookSecret(): string | null {
  const token = telegramToken();
  if (!token) return null;
  return createHash("sha256").update("nomerok-webhook|" + token).digest("hex").slice(0, 48);
}

/** Отправка в Telegram владельцу. */
async function sendTelegram(html: string, silent = false): Promise<boolean | null> {
  const token = telegramToken();
  const chatId = telegramChatId();
  if (!token || !chatId) return null; // не настроено
  try {
    const res = await fetch(`${API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true, disable_notification: silent }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("[telegram] ошибка", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("[telegram] не удалось отправить", e);
    return false;
  }
}

/**
 * Отправка на почту через сервис Resend (resend.com) — необязательно.
 * Включается, если в настройках заданы RESEND_API_KEY и NOTIFY_EMAIL.
 */
async function sendEmail(html: string): Promise<boolean | null> {
  const key = (process.env.RESEND_API_KEY ?? "").trim();
  const to = (process.env.NOTIFY_EMAIL ?? "").trim();
  if (!key || !to) return null; // не настроено
  const text = html.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  const subject = text.split("\n")[0].replace(/^[^\p{L}]+/u, "").slice(0, 120) || "NomerOk"
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM?.trim() || "NomerOk <onboarding@resend.dev>",
        to: to.split(/[,;\s]+/).filter(Boolean),
        subject,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[email] ошибка", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("[email] не удалось отправить", e);
    return false;
  }
}

/**
 * Уведомляет владельца сайта: в Telegram и/или на почту — что настроено.
 * Возвращает true, если хотя бы один способ сработал. Сайт при ошибке не ломается.
 */
/** silent: без звука в Telegram и без письма (для мелких событий вроде правки профиля). */
export async function notifyAdmin(html: string, opts: { silent?: boolean } = {}): Promise<boolean> {
  const [tg, mail] = await Promise.all([sendTelegram(html, !!opts.silent), opts.silent ? Promise.resolve(null) : sendEmail(html)]);
  if (tg === null && mail === null) {
    console.log("[уведомления] ни Telegram, ни почта не настроены. Сообщение:\n" + html);
    return false;
  }
  return tg === true || mail === true;
}

/** Для /api/health: проверяет токен (getMe), ничего не отправляя. */
export async function telegramHealth() {
  const token = telegramToken();
  const chatId = telegramChatId();
  let bot = "токен не найден в настройке TELEGRAM_BOT_TOKEN";
  if (token) {
    try {
      const r = await fetch(`${API_BASE}/bot${token}/getMe`, { signal: AbortSignal.timeout(5000) });
      const j = await r.json();
      bot = j.ok ? `ok — @${j.result.username}` : `ошибка: ${j.description}`;
    } catch (e) {
      bot = "ошибка связи: " + (e instanceof Error ? e.message : String(e));
    }
  }
  const wh = token ? await tg<{ url: string; last_error_message?: string; pending_update_count: number }>("getWebhookInfo") : null;
  return {
    бот: bot,
    chat_id: chatId ? `ok (${chatId.length} цифр)` : "не найден в TELEGRAM_ADMIN_CHAT_ID",
    вебхук: wh ? (wh.url ? `подключён: ${wh.url}${wh.last_error_message ? ` (последняя ошибка: ${wh.last_error_message})` : ""}` : "не подключён — нажмите «Подключить бота» в админке") : "—",
  };
}

/** Скачивает файл из Telegram по file_id (например, аватарку). */
export async function downloadTelegramFile(fileId: string): Promise<{ data: ArrayBuffer; type: string } | null> {
  const token = telegramToken();
  if (!token) return null;
  const f = await tg<{ file_path?: string }>("getFile", { file_id: fileId });
  if (!f?.file_path) return null;
  try {
    const res = await fetch(`${API_BASE}/file/bot${token}/${f.file_path}`, { cache: "no-store" });
    if (!res.ok) return null;
    const type = f.file_path.endsWith(".png") ? "image/png" : f.file_path.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return { data: await res.arrayBuffer(), type };
  } catch {
    return null;
  }
}
