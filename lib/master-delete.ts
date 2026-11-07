import "server-only";
import { adminDeleteMaster, adminListMasters, adminUpdateMaster } from "./db";
import { eventsOfMaster, removeEventOfMaster } from "./events-db";
import { escapeHtml, notifyAdmin, sendTo } from "./telegram";
import type { Master } from "./types";

/*
 * Специалист удаляет анкету сам (кабинет → Анкета → Удалить).
 * Сразу: анкета пропадает с сайта, заявки и напоминания больше не приходят, мероприятия снимаются с афиши.
 * 30 дней её можно восстановить (войти в кабинет → «Восстановить»), потом ежедневная проверка удаляет насовсем.
 */
export const DELETE_GRACE_DAYS = 30;

const REASONS: Record<string, string> = {
  noclients: "нет клиентов",
  stopped: "больше не работает",
  leaving: "уезжает",
  duplicate: "сделает новую анкету",
  other: "другое",
};

const TG = {
  ru: (d: string) => `🗑 Анкета удалена с сайта. Заявки больше приходить не будут.\n\nПередумаете — до ${d} её можно вернуть одной кнопкой, со всеми фото и отзывами. После этого удалим насовсем.`,
  en: (d: string) => `🗑 Your profile has been removed from the site. You won't get requests anymore.\n\nChanged your mind? Until ${d} you can restore it with one tap, with all photos and reviews. After that it is deleted for good.`,
  ka: (d: string) => `🗑 ანკეტა წაიშალა საიტიდან. განაცხადები აღარ მოგივათ.\n\nთუ გადაიფიქრებთ — ${d}-მდე შეგიძლიათ აღადგინოთ ერთი ღილაკით. ამის შემდეგ სამუდამოდ წაიშლება.`,
};
const BTN = { ru: "↩️ Восстановить анкету", en: "↩️ Restore profile", ka: "↩️ ანკეტის აღდგენა" };

export function deleteUntil(m: Pick<Master, "archived_at">): Date | null {
  return m.archived_at ? new Date(new Date(m.archived_at).getTime() + DELETE_GRACE_DAYS * 86400000) : null;
}

export async function selfDeleteMaster(m: Master, reason: string, note: string) {
  const now = new Date();
  await adminUpdateMaster(m.id, { archived_at: now.toISOString(), archived_reason: "deleted", is_away: false });
  for (const e of await eventsOfMaster(m.id).catch(() => [])) await removeEventOfMaster(m.id, e.id).catch(() => null);
  const lang = (["ru", "en", "ka"].includes(m.lang ?? "") ? m.lang : "ru") as "ru" | "en" | "ka";
  const until = deleteUntil({ archived_at: now.toISOString() })!.toLocaleDateString(lang === "en" ? "en-GB" : lang === "ka" ? "ka-GE" : "ru-RU", { day: "numeric", month: "long", timeZone: "Asia/Tbilisi" });
  if (m.tg_chat_id) await sendTo(m.tg_chat_id, TG[lang](until), [[{ text: BTN[lang], callback_data: "unarchive" }]]).catch(() => null);
  await notifyAdmin(
    `🗑 <b>${escapeHtml(m.name)}</b> удалил(а) анкету сам(а).\nПричина: ${escapeHtml(REASONS[reason] ?? "не указана")}${note ? `\n«${escapeHtml(note.slice(0, 300))}»` : ""}\nМожно восстановить до ${until}, потом удалится насовсем.`,
  ).catch(() => null);
}

/** Ежедневно: удаляем насовсем анкеты, удалённые специалистами больше 30 дней назад. */
export async function purgeDeletedMasters(): Promise<number> {
  const edge = Date.now() - DELETE_GRACE_DAYS * 86400000;
  const old = (await adminListMasters()).filter((m) => m.archived_reason === "deleted" && m.archived_at && new Date(m.archived_at).getTime() < edge);
  for (const m of old) await adminDeleteMaster(m.id).catch(() => null);
  if (old.length) await notifyAdmin(`🗑 Удалены насовсем (прошло 30 дней): ${old.map((m) => escapeHtml(m.name)).join(", ")}`).catch(() => null);
  return old.length;
}
