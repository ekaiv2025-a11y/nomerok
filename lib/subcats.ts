import type { Locale } from "./i18n/config";

/*
 * Уточнения внутри широких направлений (пока — «Красота»).
 * Определяются автоматически по тексту анкеты: услуги, «о себе», имя.
 * Так клиент сразу видит «Парикмахер» или «Маникюр», не заходя в профиль.
 */

type Sub = { id: string; label: Record<Locale, string>; re: RegExp };

export const SUBCATS: Record<string, Sub[]> = {
  beauty: [
    { id: "hair", label: { ru: "Парикмахер", en: "Hairdresser", ka: "პარიკმახერი" }, re: /парикмахер|стрижк|стригу|причес|окрашиван|колорист|волос|укладк|кератин|air ?touch|балаяж|шатуш|hair|თმ(ის|ა)/i },
    { id: "nails", label: { ru: "Маникюр и педикюр", en: "Nails", ka: "მანიკიური და პედიკიური" }, re: /маникюр|педикюр|ногт|гель[- ]?лак|nail|manicure|pedicure|მანიკ|პედიკ/i },
    { id: "brows", label: { ru: "Брови и ресницы", en: "Brows & lashes", ka: "წარბები და წამწამები" }, re: /бров|ресниц|лэшмейк|лешмейк|lash|brow|წარბ|წამწამ/i },
    { id: "cosmetology", label: { ru: "Косметолог", en: "Cosmetologist", ka: "კოსმეტოლოგი" }, re: /косметолог|чистк\w* лица|пилинг|уход\w* за лицом|биоревитал|мезотерап|cosmetolog|კოსმეტოლ/i },
    { id: "makeup", label: { ru: "Визажист", en: "Makeup", ka: "ვიზაჟისტი" }, re: /визаж|макияж|make-?up|ვიზაჟ/i },
    { id: "epilation", label: { ru: "Депиляция", en: "Hair removal", ka: "დეპილაცია" }, re: /депиляц|эпиляц|шугаринг|восков|waxing|epilat|დეპილაც|ეპილაც/i },
    { id: "barber", label: { ru: "Барбер", en: "Barber", ka: "ბარბერი" }, re: /барбер|бород|barber|ბარბერ/i },
  ],
};

type M = { category: string; extra_categories?: string[]; services?: string; about?: string; name?: string };

/** Уточнения для направления cat у специалиста (по порядку списка). */
export function subcatsOf(m: M, cat: string = m.category): string[] {
  const list = SUBCATS[cat];
  if (!list) return [];
  if (m.category !== cat && !(m.extra_categories ?? []).includes(cat)) return [];
  const text = `${m.name ?? ""}\n${m.services ?? ""}\n${m.about ?? ""}`;
  return list.filter((s) => s.re.test(text)).map((s) => s.id);
}

export function subcatLabel(cat: string, id: string, lang: Locale): string {
  return SUBCATS[cat]?.find((s) => s.id === id)?.label[lang] ?? id;
}

/** Короткая подпись для карточки: «Парикмахер, Барбер» вместо «Красота». */
export function subcatLine(m: M, lang: Locale, max = 2): string | null {
  const ids = subcatsOf(m);
  if (!ids.length) return null;
  return ids.slice(0, max).map((id) => subcatLabel(m.category, id, lang)).join(", ") + (ids.length > max ? ` +${ids.length - max}` : "");
}
