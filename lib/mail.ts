import "server-only";
import { SITE_URL } from "./site";

/*
 * Письма пользователям (коды входа, заявки, отклики) через сервис Resend (resend.com).
 * Нужны настройки RESEND_API_KEY и MAIL_FROM (например «NomerOk <noreply@nomerok.ge>»),
 * а домен nomerok.ge должен быть подтверждён в Resend (записи DNS) — иначе письма не уйдут или попадут в спам.
 * На компьютере разработчика (LOCAL_DB=1) без ключа письмо просто печатается в консоль.
 */
const devMode = () => process.env.LOCAL_DB === "1" && !process.env.RESEND_API_KEY;
const fromAddr = () => (process.env.MAIL_FROM || process.env.NOTIFY_FROM || "").trim();

/** Можно ли отправлять письма пользователям. */
export function mailEnabled(): boolean {
  if (devMode()) return true;
  const from = fromAddr();
  return !!(process.env.RESEND_API_KEY ?? "").trim() && !!from && !from.includes("resend.dev");
}

export type MailButton = { text: string; url: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Простое фирменное письмо: заголовок, текст (HTML-фрагмент), кнопки. */
export function mailLayout(o: { title: string; bodyHtml: string; buttons?: MailButton[]; footer?: string }): string {
  const btns = (o.buttons ?? [])
    .map((b) => `<a href="${esc(b.url)}" style="display:inline-block;margin:6px 8px 0 0;padding:12px 20px;border-radius:12px;background:#1f6b4f;color:#ffffff;text-decoration:none;font-weight:600">${esc(b.text)}</a>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f7f4ee;font-family:Arial,Helvetica,sans-serif;color:#1c1b18">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<div style="font-size:22px;font-weight:800;color:#1f6b4f;margin-bottom:16px">Nomer<span style="color:#e0a526">Ok</span>.ge</div>
<div style="background:#ffffff;border-radius:16px;padding:22px;border:1px solid #e8e4da">
<h1 style="font-size:19px;margin:0 0 12px">${esc(o.title)}</h1>
<div style="font-size:15px;line-height:1.55">${o.bodyHtml}</div>
${btns ? `<div style="margin-top:14px">${btns}</div>` : ""}
</div>
<p style="font-size:12px;color:#6b6a65;line-height:1.5;margin-top:14px">${o.footer ?? `Письмо от сайта <a href="${SITE_URL}" style="color:#6b6a65">nomerok.ge</a>. Если вы не регистрировались на NomerOk — просто проигнорируйте его.`}</p>
</div></body></html>`;
}

const toText = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|li)>/gi, "\n")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/gi, "$2: $1")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/** Отправить письмо. true — ушло, false — ошибка, null — почта не настроена. */
export async function sendMail(o: { to: string; subject: string; html: string }): Promise<boolean | null> {
  if (devMode()) {
    console.log(`[mail→${o.to}] ${o.subject}\n${toText(o.html)}`);
    return true;
  }
  if (!mailEnabled()) return null;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}` },
      body: JSON.stringify({ from: fromAddr(), to: [o.to], subject: o.subject.slice(0, 150), html: o.html, text: toText(o.html) }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) console.error("[mail] ошибка", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("[mail] не удалось отправить", e);
    return false;
  }
}
