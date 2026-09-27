import "server-only";

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

/** Отправка в Telegram. */
async function sendTelegram(html: string): Promise<boolean | null> {
  const token = telegramToken();
  const chatId = telegramChatId();
  if (!token || !chatId) return null; // не настроено
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
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
  const subject = text.split("\n")[0].replace(/^[^\p{L}]+/u, "").slice(0, 120) || "Nomerok";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM?.trim() || "Nomerok <onboarding@resend.dev>",
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
export async function notifyAdmin(html: string): Promise<boolean> {
  const [tg, mail] = await Promise.all([sendTelegram(html), sendEmail(html)]);
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
      const r = await fetch(`https://api.telegram.org/bot${token}/getMe`, { signal: AbortSignal.timeout(5000) });
      const j = await r.json();
      bot = j.ok ? `ok — @${j.result.username}` : `ошибка: ${j.description}`;
    } catch (e) {
      bot = "ошибка связи: " + (e instanceof Error ? e.message : String(e));
    }
  }
  return { бот: bot, chat_id: chatId ? `ok (${chatId.length} цифр)` : "не найден в TELEGRAM_ADMIN_CHAT_ID" };
}
