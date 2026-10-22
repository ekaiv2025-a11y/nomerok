import "server-only";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import { todayTbilisi } from "./availability";

/* Посетители сайта (один раз в день на человека, с источником) и поисковые запросы — для админа. */
type Visit = { day: string; visitor: string; source: string; path: string | null; created_at: string };
type Search = { q: string; cat: string | null; found: number; visitor: string | null; created_at: string };
type L = { site_visits?: Visit[]; search_log?: Search[] };

/** Откуда пришёл человек: по метке utm_source или по сайту, с которого перешёл. */
export function sourceOf(ref: string, utm: string, host: string): string {
  const u = utm.trim().toLowerCase().slice(0, 40);
  if (u) return u;
  let h = "";
  try {
    h = new URL(ref).hostname.replace(/^www\.|^m\.|^l\./, "");
  } catch {}
  if (!h || h === host || h.endsWith("nomerok.ge")) return "прямой заход";
  if (/google\./.test(h)) return "Google";
  if (/yandex\.|ya\.ru/.test(h)) return "Яндекс";
  if (/bing\./.test(h)) return "Bing";
  if (/instagram\./.test(h)) return "Instagram";
  if (/facebook\.|fb\./.test(h)) return "Facebook";
  if (/threads\./.test(h)) return "Threads";
  if (/t\.me|telegram/.test(h)) return "Telegram";
  if (/yesbatumi/.test(h)) return "YesBatumi";
  if (/vk\.com/.test(h)) return "VK";
  return h.slice(0, 40);
}

export async function recordVisit(visitor: string, source: string, path: string) {
  const row: Visit = { day: todayTbilisi(), visitor, source, path: path.slice(0, 200), created_at: new Date().toISOString() };
  const sb = supabase();
  if (sb) {
    await sb.from("site_visits").upsert(row, { onConflict: "day,visitor", ignoreDuplicates: true });
    return;
  }
  if (dbMode() === "none") return;
  const d = (await readLocal()) as unknown as L;
  d.site_visits ??= [];
  if (!d.site_visits.some((v) => v.day === row.day && v.visitor === visitor)) {
    d.site_visits.push(row);
    await writeLocal(d as never);
  }
}

export async function recordSearch(q: string, cat: string | null, found: number, visitor: string) {
  const row: Search = { q: q.slice(0, 80), cat, found, visitor, created_at: new Date().toISOString() };
  const sb = supabase();
  if (sb) {
    await sb.from("search_log").insert(row);
    return;
  }
  if (dbMode() === "none") return;
  const d = (await readLocal()) as unknown as L;
  (d.search_log ??= []).push(row);
  await writeLocal(d as never);
}

export type SiteSummary = {
  visitors: number;
  byDay: { day: string; n: number }[];
  sources: { source: string; n: number }[];
  searches: { q: string; n: number; found: number }[]; // что искали (схожие запросы склеены)
};

/** Сводка за `days` дней. */
export async function siteSummary(days: number): Promise<SiteSummary> {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  let visits: Visit[] = [];
  let searches: Search[] = [];
  const sb = supabase();
  if (sb) {
    const all = async <T,>(table: string, cols: string): Promise<T[]> => {
      const out: T[] = [];
      for (let from = 0; from < 100000; from += 1000) {
        const r = await sb.from(table).select(cols).gte("created_at", since).order("created_at").range(from, from + 999);
        if (r.error) break;
        out.push(...(r.data as T[]));
        if (r.data.length < 1000) break;
      }
      return out;
    };
    [visits, searches] = await Promise.all([all<Visit>("site_visits", "day,visitor,source,created_at"), all<Search>("search_log", "q,cat,found,visitor,created_at")]);
  } else if (dbMode() !== "none") {
    const d = (await readLocal()) as unknown as L;
    visits = (d.site_visits ?? []).filter((v) => v.created_at >= since);
    searches = (d.search_log ?? []).filter((v) => v.created_at >= since);
  }
  const dayMap = new Map<string, number>();
  const srcMap = new Map<string, number>();
  for (const v of visits) {
    dayMap.set(v.day, (dayMap.get(v.day) ?? 0) + 1);
    srcMap.set(v.source, (srcMap.get(v.source) ?? 0) + 1);
  }
  // Один человек — один раз каждый запрос; запросы приводим к простому виду
  const seen = new Set<string>();
  const qMap = new Map<string, { q: string; n: number; found: number }>();
  for (const s of searches) {
    const key = s.q.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim();
    if (key.length < 3 || seen.has(key + "|" + s.visitor)) continue;
    seen.add(key + "|" + s.visitor);
    const x = qMap.get(key) ?? { q: key, n: 0, found: 0 };
    x.n++;
    x.found = Math.max(x.found, s.found);
    qMap.set(key, x);
  }
  return {
    visitors: new Set(visits.map((v) => v.visitor)).size,
    byDay: [...dayMap.entries()].map(([day, n]) => ({ day, n })).sort((a, b) => a.day.localeCompare(b.day)),
    sources: [...srcMap.entries()].map(([source, n]) => ({ source, n })).sort((a, b) => b.n - a.n),
    searches: [...qMap.values()].sort((a, b) => b.n - a.n),
  };
}
