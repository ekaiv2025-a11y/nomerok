import type { Locale } from "./i18n/config";

/* Районы Батуми — для страниц «услуга + район» (поиск Google/Яндекс). */
type District = { id: string; name: Record<Locale, string>; inName: Record<Locale, string>; re: RegExp };

export const DISTRICTS: District[] = [
  { id: "old-batumi", name: { ru: "Старый Батуми", en: "Old Batumi", ka: "ძველი ბათუმი" }, inName: { ru: "в Старом Батуми", en: "in Old Batumi", ka: "ძველ ბათუმში" }, re: /стар\w* (город|батуми)|old (town|batumi)|ძველი|пьяцц|piazza|руставели|rustaveli|горгиладзе|gorgiladze|мемед абашидзе|memed abashidze|европ\w* площад|europe square/i },
  { id: "new-boulevard", name: { ru: "Новый бульвар", en: "New Boulevard", ka: "ახალი ბულვარი" }, inName: { ru: "на Новом бульваре", en: "on the New Boulevard", ka: "ახალ ბულვარზე" }, re: /нов\w* бульвар|new boulevard|ახალი ბულვარ|шериф химшиашвили|химшиашвили|khimshiashvili|аэропорт|airport|ангиса|angisa/i },
  { id: "aghmashenebeli", name: { ru: "Агмашенебели", en: "Aghmashenebeli", ka: "აღმაშენებელი" }, inName: { ru: "на Агмашенебели", en: "on Aghmashenebeli", ka: "აღმაშენებელზე" }, re: /агмашенебел|aghmashenebeli|აღმაშენებ|тамар|tamar/i },
  { id: "boni", name: { ru: "Бони-Городок", en: "Boni-Gorodok", ka: "ბონი-გოროდოკი" }, inName: { ru: "в Бони-Городке", en: "in Boni-Gorodok", ka: "ბონი-გოროდოკში" }, re: /бони|городок|boni|gorodok|ბონი/i },
  { id: "makhinjauri", name: { ru: "Махинджаури", en: "Makhinjauri", ka: "მახინჯაური" }, inName: { ru: "в Махинджаури", en: "in Makhinjauri", ka: "მახინჯაურში" }, re: /махинджаур|makhinjauri|მახინჯაურ|чаква|chakvi|зелен\w* мыс|green cape/i },
  { id: "gonio", name: { ru: "Гонио и Квариати", en: "Gonio & Kvariati", ka: "გონიო და კვარიათი" }, inName: { ru: "в Гонио и Квариати", en: "in Gonio & Kvariati", ka: "გონიოსა და კვარიათში" }, re: /гонио|квариати|сарпи|gonio|kvariati|sarpi|გონიო|კვარიათ/i },
];

export function districtOf(id: string) {
  return DISTRICTS.find((d) => d.id === id) ?? null;
}

type M = { work_mode?: string; place_address?: string | null; service_area?: string | null };

/** Работает ли специалист в районе: принимает там или явно выезжает туда (или «по всему Батуми»). */
export function servesDistrict(m: M, d: District): "exact" | "city" | null {
  const addr = m.place_address ?? "";
  const area = m.service_area ?? "";
  if ((m.work_mode === "at_place" || m.work_mode === "both") && d.re.test(addr)) return "exact";
  if ((m.work_mode === "at_client" || m.work_mode === "both") && d.re.test(area)) return "exact";
  if ((m.work_mode === "at_client" || m.work_mode === "both") && (!area.trim() || /весь|всему|любой|whole|all|მთელ/i.test(area))) return "city";
  return null;
}
