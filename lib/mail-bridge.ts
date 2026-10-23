import "server-only";
import { accountByChatId } from "./accounts";
import { mailLayout, sendMail, type MailButton } from "./mail";
import { createLoginToken, getMastersByChatId } from "./db";
import { clientLoginToken } from "./client-auth";
import { SITE_URL } from "./site";

/*
 * «Мост» бот → почта. У тех, кто вошёл через почту/Google/Facebook, вместо Telegram — внутренний id чата.
 * Всё, что бот отправил бы такому человеку (заявка, отклик, код входа, напоминание), уходит письмом.
 * Кнопки-ссылки остаются ссылками; кнопки бота (взять заявку и т. п.) превращаются в ссылку в кабинет.
 */
type Btn = { text: string; url?: string; callback_data?: string };

const OPEN_CABINET: Record<string, string> = { ru: "Открыть кабинет", en: "Open my dashboard", ka: "კაბინეტის გახსნა" };
const OPEN_MY: Record<string, string> = { ru: "Мои заявки", en: "My requests", ka: "ჩემი განაცხადები" };

const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"');

/** Telegram-HTML (b, i, a, code, переносы строк) → HTML письма. */
function bodyFromTelegram(html: string): string {
  const lines = html.replace(/<tg-spoiler>|<\/tg-spoiler>|<blockquote[^>]*>|<\/blockquote>/g, "").split("\n");
  const first = lines.findIndex((x) => plain(x).trim());
  if (first >= 0) lines.splice(first, 1); // первая строка — заголовок письма
  return lines.join("<br>").replace(/^(<br>)+/, "");
}

export async function bridgeToMail(chatId: number, method: string, payload: Record<string, unknown>): Promise<{ message_id: number } | null> {
  if (method !== "sendMessage") return null; // фото, правки сообщений и т. п. письмом не дублируем
  const acc = await accountByChatId(chatId).catch(() => null);
  if (!acc?.email) return null;
  const html = String(payload.text ?? "");
  const rows = ((payload.reply_markup as { inline_keyboard?: Btn[][] } | undefined)?.inline_keyboard ?? []).flat();

  const masters = await getMastersByChatId(chatId).catch(() => []);
  const master = masters.find((m) => m.status !== "rejected") ?? masters[0] ?? null;
  const lang = master?.lang ?? (["ru", "en", "ka"].includes(acc.lang) ? acc.lang : "ru");

  const buttons: MailButton[] = [];
  let cabinetAdded = false;
  for (const b of rows) {
    if (b.url) {
      buttons.push({ text: plain(b.text), url: b.url });
      continue;
    }
    if (!b.callback_data || cabinetAdded) continue;
    cabinetAdded = true;
    if (master) {
      const token = await createLoginToken(master.id).catch(() => null);
      const tab = b.callback_data.startsWith("take:") ? "orders" : "home";
      if (token) buttons.push({ text: tab === "orders" ? plain(b.text) : OPEN_CABINET[lang], url: `${SITE_URL}/api/cabinet/login?t=${token}&lang=${lang}&tab=${tab}` });
    } else {
      buttons.push({ text: OPEN_MY[lang], url: `${SITE_URL}/api/my/login?t=${encodeURIComponent(clientLoginToken(chatId, acc.name, 72))}&lang=${lang}` });
    }
  }

  const firstLine = plain(html).split("\n").find((x) => x.trim()) ?? "NomerOk";
  const subject = firstLine.replace(/^[^\p{L}\p{N}]+/u, "").trim().slice(0, 90) || "NomerOk";
  const ok = await sendMail({ to: acc.email, subject, html: mailLayout({ title: subject, bodyHtml: bodyFromTelegram(html), buttons }) });
  return ok ? { message_id: 0 } : null;
}
