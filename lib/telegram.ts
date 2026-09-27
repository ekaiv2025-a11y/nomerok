import "server-only";

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Отправляет сообщение владельцу сайта в Telegram.
 * Если бот не настроен или Telegram недоступен — просто пишет в лог и не ломает сайт.
 */
export async function notifyAdmin(html: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) {
    console.log("[telegram] бот не настроен, уведомление:\n" + html);
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
