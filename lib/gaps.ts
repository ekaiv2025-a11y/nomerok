import "server-only";
import { listMastersForRequests, listPublishedMasters } from "./db";
import { listOrders } from "./orders-db";
import { siteSummary } from "./site-stats";
import { servesCategory } from "./availability";
import { CATEGORIES } from "./categories";
import type { PublicMaster } from "./types";

/*
 * «Пробелы»: где клиенты ищут специалистов, а их мало или нет.
 * Нужно, чтобы звать специалистов туда, где их ждут заявки, а не всех подряд.
 */

export type GapRow = {
  cat: string;
  city: string;
  requests: number; // общих заявок за 30 дней
  noResponse: number; // из них без единого отклика
  catalog: number; // анкет в каталоге (основное или доп. направление)
  receivers: number; // получают заявки в Telegram прямо сейчас
  level: "red" | "orange" | "green";
};

export function catalogCount(masters: PublicMaster[], cat: string, city: string): number {
  return masters.filter((m) => !m.demo && (m.city ?? "batumi") === city && servesCategory(m, cat)).length;
}

export async function computeGaps() {
  const [orders, masters, site] = await Promise.all([
    listOrders().catch(() => []),
    listPublishedMasters().catch(() => [] as PublicMaster[]),
    siteSummary(30).catch(() => null),
  ]);
  const pairs = new Map<string, { cat: string; city: string; requests: number; noResponse: number }>();
  for (const o of orders) {
    if (o.status === "spam") continue;
    const city = o.city ?? "batumi";
    const k = `${o.category}|${city}`;
    const x = pairs.get(k) ?? { cat: o.category, city, requests: 0, noResponse: 0 };
    x.requests++;
    if (!o.responses) x.noResponse++;
    pairs.set(k, x);
  }
  const rows: GapRow[] = await Promise.all(
    [...pairs.values()].map(async (p) => {
      const receivers = (await listMastersForRequests(p.cat, p.city).catch(() => [])).length;
      const catalog = catalogCount(masters, p.cat, p.city);
      const level: GapRow["level"] = receivers === 0 ? "red" : p.noResponse > 0 || receivers < 3 ? "orange" : "green";
      return { ...p, catalog, receivers, level };
    }),
  );
  const order = { red: 0, orange: 1, green: 2 };
  rows.sort((a, b) => order[a.level] - order[b.level] || b.noResponse - a.noResponse || b.requests - a.requests);

  // Направления, где в Батуми меньше 2 анкет, даже если заявок пока не было
  const thinBatumi = CATEGORIES.map((c) => ({ cat: c.id, catalog: catalogCount(masters, c.id, "batumi") }))
    .filter((x) => x.catalog < 2)
    .sort((a, b) => a.catalog - b.catalog);

  // Что искали в каталоге и не нашли
  const notFound = (site?.searches ?? []).filter((s) => s.found === 0).slice(0, 30);

  return { rows, thinBatumi, notFound };
}
