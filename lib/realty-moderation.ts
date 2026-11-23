import "server-only";
import { escapeHtml, sendTo, telegramChatId, notifyAdmin } from "./telegram";
import { DEALS, KINDS, POSTER_KINDS, priceLabel, type Listing } from "./realty";
import { cityLabel } from "./cities";
import { SITE_URL } from "./site";

/*
 * Проверка объектов недвижимости администратором (решение владельца, 23.11.2026):
 * новое объявление уходит на сайт только после «✅ Опубликовать» в Telegram или в админке.
 */
export async function notifyListingPending(l: Listing, realtorName: string | null) {
  const who = realtorName ? `риелтор ${escapeHtml(realtorName)}` : `${POSTER_KINDS[l.poster_kind ?? "owner"].ru}: ${escapeHtml(l.contact_name || "—")}, ${escapeHtml(l.contact_phone || "")}`;
  const text = [
    "🏠 <b>Новый объект — на проверке</b>",
    `${DEALS[l.deal].ru} · ${KINDS[l.kind].ru} · ${cityLabel(l.city, "ru")}${l.district ? `, ${escapeHtml(l.district)}` : ""}`,
    `<b>${escapeHtml(l.title)}</b> — ${escapeHtml(priceLabel(l, "ru"))}`,
    l.description ? escapeHtml(l.description.slice(0, 400)) : "",
    `📷 Фото: ${l.photos.length}`,
    `<b>Кто разместил:</b> ${who}`,
    `${SITE_URL}/admin/realty?s=pending`,
  ]
    .filter(Boolean)
    .join("\n");
  const chat = telegramChatId();
  if (chat) {
    const ok = await sendTo(chat, text, [[{ text: "✅ Опубликовать", callback_data: `lp:${l.id}` }, { text: "🗑 Отклонить", callback_data: `lr:${l.id}` }]]).catch(() => false);
    if (ok) return;
  }
  await notifyAdmin(text);
}

/** Сообщить автору, что объект опубликован или отклонён (Telegram или письмо — через внутренний id чата). */
export async function tellPoster(l: Listing, ok: boolean) {
  let chat = l.owner_chat_id ?? null;
  if (!chat && l.master_id) {
    const { adminGetMaster } = await import("./db");
    chat = (await adminGetMaster(l.master_id).catch(() => null))?.tg_chat_id ?? null;
  }
  if (!chat) return;
  const link = `${SITE_URL}/ru/realty/${l.id}`;
  await sendTo(
    chat,
    ok
      ? `✅ Ваш объект опубликован на NomerOk: «${escapeHtml(l.title)}».\n${link}\n\nОбъявление живёт 60 дней — продлить можно одной кнопкой в «Моих объявлениях».`
      : `Ваш объект «${escapeHtml(l.title)}» не прошёл проверку. Частые причины: нет фото самого объекта, нет цены или это не недвижимость. Исправьте и отправьте снова в «Моих объявлениях».`,
    [[{ text: "Мои объявления", url: `${SITE_URL}/ru/${l.master_id ? "cabinet?tab=realty" : "realty/my"}` }]],
  ).catch(() => null);
}
