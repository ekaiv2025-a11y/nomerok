import "server-only";
import { escapeHtml, notifyAdmin, sendTo, telegramChatId } from "./telegram";
import { SITE_URL } from "./site";
import { cityLabel } from "./cities";
import { projectBySlug } from "./projects";
import type { DevProject } from "./dev-projects";

/* Проверка ЖК из кабинета застройщика: первая публикация — только после одобрения администратора. */
export async function notifyDevPending(d: DevProject, units: number) {
  const linked = d.linked_slug ? projectBySlug(d.linked_slug) : null;
  const text = [
    "🏗 <b>ЖК от застройщика — на проверке</b>",
    `<b>${escapeHtml(d.name)}</b> · ${escapeHtml(d.developer || "—")} · ${cityLabel(d.city, "ru")}`,
    linked ? `Дополняет ЖК из каталога: ${SITE_URL}/ru/novostroyki/${linked.slug} — проверьте, что это правда застройщик` : "Новый ЖК (в каталоге его не было)",
    d.completion ? `Сдача: ${escapeHtml(d.completion)}` : "",
    `Квартир: ${units} · фото: ${d.photos.length} · записей хода стройки: ${d.progress.length}`,
    `Контакт: ${escapeHtml(d.contact_name || "—")}, ${escapeHtml(d.contact_phone || "—")}`,
    `${SITE_URL}/admin/projects#dev`,
  ]
    .filter(Boolean)
    .join("\n");
  const chat = telegramChatId();
  if (chat) {
    const ok = await sendTo(chat, text, [[{ text: "✅ Опубликовать", callback_data: `dp:${d.id}` }, { text: "🗑 Отклонить", callback_data: `dr:${d.id}` }]]).catch(() => false);
    if (ok) return;
  }
  await notifyAdmin(text);
}

export async function tellDev(d: DevProject, ok: boolean) {
  let chat = d.owner_chat_id ?? null;
  if (!chat && d.master_id) {
    const { adminGetMaster } = await import("./db");
    chat = (await adminGetMaster(d.master_id).catch(() => null))?.tg_chat_id ?? null;
  }
  if (!chat) return;
  const page = `${SITE_URL}/ru/novostroyki/${d.linked_slug ?? d.slug}`;
  await sendTo(
    chat,
    ok
      ? `✅ ЖК «${escapeHtml(d.name)}» опубликован на NomerOk:\n${page}\n\nКвартиры, цены и статусы («свободна / бронь / продана») меняйте в кабинете — на сайте они обновятся сразу.`
      : `ЖК «${escapeHtml(d.name)}» пока не опубликован. Мы свяжемся с вами по телефону из карточки, чтобы уточнить детали.`,
    [[{ text: "Кабинет застройщика", url: `${SITE_URL}/ru/realty/dev/${d.id}` }]],
  ).catch(() => null);
}
