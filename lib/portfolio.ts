import { SUBCATS } from "./subcats";
import type { Locale } from "./i18n/config";

/** Сколько фото работ можно загрузить: фотографам, художникам и дизайнерам — больше. */
export const PORTFOLIO_BIG = ["photo", "art"];
export function portfolioLimit(m: { category: string; extra_categories?: string[] | null }): number {
  return [m.category, ...(m.extra_categories ?? [])].some((c) => PORTFOLIO_BIG.includes(c)) ? 40 : 12;
}

/** Разделы портфолио: виды работ основного направления (у фотографа — интерьерная, репортажная…). */
export function portfolioSections(m: { category: string; extra_categories?: string[] | null }, lang: Locale): { id: string; label: string }[] {
  const cat = PORTFOLIO_BIG.find((c) => c === m.category || (m.extra_categories ?? []).includes(c)) ?? m.category;
  return (SUBCATS[cat] ?? []).map((s) => ({ id: s.id, label: s.label[lang] }));
}
