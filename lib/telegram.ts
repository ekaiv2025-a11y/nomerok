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

/**
 * Отправляет сообщение владельцу сайта в Telegram.
 * Если бот не настроен или Telegram недоступен — просто пишет в лог и не ломает сайт.
 */
export async function notifyAdmin(html: string): Promise<boolean> {
  const token = telegramToken();
  const chatId = telegramChatId();
  if (!token || !chatId) {
    console.log(`[telegram] бот не настроен (токен: ${token ? "ok" : "нет"}, chat id: ${chatId ? "ok" : "нет"}), уведомление:\n` + html);
    return false;
  }
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
