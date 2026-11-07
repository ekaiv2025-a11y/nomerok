/* Прайс специалиста: строки «услуга — цена от». Общие функции для сайта и сервера. */
export type PriceItem = { name: string; from: number | null; unit?: string };

export const PRICE_MAX = 30;

/** Очистка того, что пришло из формы: до 30 строк, название до 80 знаков, цена 0–100000 или «по договорённости». */
export function cleanPriceList(v: unknown): PriceItem[] {
  if (!Array.isArray(v)) return [];
  const out: PriceItem[] = [];
  for (const x of v) {
    if (!x || typeof x !== "object") continue;
    const name = String((x as PriceItem).name ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
    if (name.length < 2) continue;
    const n = Number((x as PriceItem).from);
    const from = (x as PriceItem).from === null || (x as PriceItem).from === undefined || String((x as PriceItem).from).trim() === "" || !Number.isFinite(n) ? null : Math.min(100000, Math.max(0, Math.round(n)));
    const unit = String((x as PriceItem).unit ?? "").slice(0, 10);
    out.push({ name, from, ...(unit ? { unit } : {}) });
    if (out.length >= PRICE_MAX) break;
  }
  return out;
}
