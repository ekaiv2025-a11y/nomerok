import type { Locale } from "./i18n/config";

/** Города Грузии. Батуми — основной; остальные показываем в каталоге, когда там есть специалисты. */
export const CITIES = [
  { id: "batumi", label: { ru: "Батуми", ka: "ბათუმი", en: "Batumi" }, in: { ru: "в Батуми", ka: "ბათუმში", en: "in Batumi" }, center: [41.6413, 41.6359] },
  { id: "tbilisi", label: { ru: "Тбилиси", ka: "თბილისი", en: "Tbilisi" }, in: { ru: "в Тбилиси", ka: "თბილისში", en: "in Tbilisi" }, center: [41.7151, 44.8271] },
  { id: "kutaisi", label: { ru: "Кутаиси", ka: "ქუთაისი", en: "Kutaisi" }, in: { ru: "в Кутаиси", ka: "ქუთაისში", en: "in Kutaisi" }, center: [42.2679, 42.6946] },
  { id: "rustavi", label: { ru: "Рустави", ka: "რუსთავი", en: "Rustavi" }, in: { ru: "в Рустави", ka: "რუსთავში", en: "in Rustavi" }, center: [41.5495, 44.9932] },
  { id: "kobuleti", label: { ru: "Кобулети", ka: "ქობულეთი", en: "Kobuleti" }, in: { ru: "в Кобулети", ka: "ქობულეთში", en: "in Kobuleti" }, center: [41.8214, 41.7792] },
  { id: "zugdidi", label: { ru: "Зугдиди", ka: "ზუგდიდი", en: "Zugdidi" }, in: { ru: "в Зугдиди", ka: "ზუგდიდში", en: "in Zugdidi" }, center: [42.5088, 41.8709] },
  { id: "poti", label: { ru: "Поти", ka: "ფოთი", en: "Poti" }, in: { ru: "в Поти", ka: "ფოთში", en: "in Poti" }, center: [42.1462, 41.6719] },
  { id: "gori", label: { ru: "Гори", ka: "გორი", en: "Gori" }, in: { ru: "в Гори", ka: "გორში", en: "in Gori" }, center: [41.9842, 44.1158] },
  { id: "telavi", label: { ru: "Телави", ka: "თელავი", en: "Telavi" }, in: { ru: "в Телави", ka: "თელავში", en: "in Telavi" }, center: [41.9198, 45.4731] },
  { id: "borjomi", label: { ru: "Боржоми", ka: "ბორჯომი", en: "Borjomi" }, in: { ru: "в Боржоми", ka: "ბორჯომში", en: "in Borjomi" }, center: [41.8386, 43.3799] },
] as const;

export type CityId = (typeof CITIES)[number]["id"];
export const DEFAULT_CITY: CityId = "batumi";
export const CITY_IDS = CITIES.map((c) => c.id) as [CityId, ...CityId[]];

export function isCity(v: unknown): v is CityId {
  return typeof v === "string" && CITY_IDS.includes(v as CityId);
}
export function cityOf(v: unknown): CityId {
  return isCity(v) ? v : DEFAULT_CITY;
}
export function cityLabel(id: string | null | undefined, lang: Locale): string {
  return CITIES.find((c) => c.id === id)?.label[lang] ?? CITIES[0].label[lang];
}
export function cityIn(id: string | null | undefined, lang: Locale): string {
  return CITIES.find((c) => c.id === id)?.in[lang] ?? CITIES[0].in[lang];
}
export function cityCenter(id: string | null | undefined): [number, number] {
  const c = CITIES.find((x) => x.id === id)?.center ?? CITIES[0].center;
  return [c[0], c[1]];
}
