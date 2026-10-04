import type { Locale } from "./i18n/config";

/*
 * Уточнения внутри широких направлений («Красота», «Спорт и тренеры»).
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
  realtor: [
    { id: "rent", label: { ru: "Аренда", en: "Rentals", ka: "ქირავნობა" }, re: /аренд|снять|сдать|сда[её]м|посуточ|долгосроч|rent|lease|ქირა/i },
    { id: "sale", label: { ru: "Покупка и продажа", en: "Buying & selling", ka: "ყიდვა-გაყიდვა" }, re: /покуп|продаж|прода[тюё]|купит|buy|sell|purchase|sale|ყიდვ|გაყიდ/i },
    { id: "newbuild", label: { ru: "Новостройки", en: "New builds", ka: "ახალი მშენებლობა" }, re: /новостро|застройщик|котлован|new[- ]?build|off[- ]plan|developer|ახალ\S* მშენებ/i },
    { id: "commercial", label: { ru: "Коммерческая", en: "Commercial", ka: "კომერციული" }, re: /коммерч|офис|помещени|склад|commercial|office|retail|კომერც/i },
    { id: "deal", label: { ru: "Сопровождение сделок", en: "Deal support", ka: "გარიგების მხარდაჭერა" }, re: /сопровожд|сделк|юридическ\S* провер|оформлени|нотари|deal|closing|legal check|გარიგ/i },
  ],
  fitness: [
    { id: "gym", label: { ru: "Фитнес", en: "Fitness", ka: "ფიტნესი" }, re: /фитнес|тренаж?[её]рн|персональн\w* тренир|похуд|набор\w* масс|кроссфит|функционал|fitness|gym|workout|crossfit|ფიტნეს/i },
    { id: "yoga", label: { ru: "Йога и пилатес", en: "Yoga & pilates", ka: "იოგა და პილატესი" }, re: /йог|пилатес|стретчинг|растяжк|yoga|pilates|stretch|იოგ/i },
    { id: "martial", label: { ru: "Единоборства", en: "Martial arts", ka: "ორთაბრძოლა" }, re: /айкидо|карате|бокс|кикбокс|дзюдо|самбо|джиу|борьб|тхэквондо|ушу|мма\b|единоборств|самооборон|aikido|karate|boxing|judo|mma|martial|კარატე|კრივ|ჭიდაობ/i },
    { id: "swim", label: { ru: "Плавание", en: "Swimming", ka: "ცურვა" }, re: /плаван|бассейн|swim|ცურვ/i },
    { id: "dance", label: { ru: "Танцы", en: "Dance", ka: "ცეკვა" }, re: /танц|хореограф|dance|ცეკვ/i },
    { id: "games", label: { ru: "Теннис, футбол и др.", en: "Tennis, football etc.", ka: "ჩოგბურთი, ფეხბურთი" }, re: /теннис|футбол|баскетбол|волейбол|шахмат|сёрф|серф|сап\b|tennis|football|soccer|basketball|volleyball|chess|surf|ჩოგბურთ|ფეხბურთ/i },
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

/** Где уточнения сами по себе непонятны («Аренда») — перед ними пишем профессию. */
const PREFIX: Record<string, Record<Locale, string>> = {
  realtor: { ru: "Риелтор", en: "Agent", ka: "რიელტორი" },
};

/** Короткая подпись для карточки: «Парикмахер, Барбер» вместо «Красота». */
export function subcatLine(m: M, lang: Locale, max = 2): string | null {
  const ids = subcatsOf(m);
  if (!ids.length) return null;
  const list = ids.slice(0, max).map((id) => subcatLabel(m.category, id, lang)).join(", ") + (ids.length > max ? ` +${ids.length - max}` : "");
  const pre = PREFIX[m.category]?.[lang];
  return pre ? `${pre}: ${list.toLowerCase()}` : list;
}
