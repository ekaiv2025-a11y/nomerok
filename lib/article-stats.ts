import "server-only";
import { dbMode, readLocal, supabase } from "./db";

/*
 * Чтение статей журнала: один человек — одна статья в день (повторные открытия не считаем).
 * Источник — откуда человек пришёл на статью: Google, Яндекс, Telegram… или «внутри сайта».
 * Сравниваем с просмотрами профилей и контактов в тот же день — видно, ведёт ли статья к специалистам.
 */
type View = { day: string; visitor: string; slug: string; source: string; created_at: string | null };
type L = { article_views?: View[]; site_visits?: { day: string; visitor: string; source: string; path: string | null; created_at: string }[] };

const SEARCH = new Set(["Google", "Яндекс", "Bing"]);
export type ArticleRow = { slug: string; views: number; search: number; social: number; entry: number; toProfiles: number };
export type JournalStats = {
  views: number;
  readers: number;
  fromSearch: number;
  /** сколько посетителей сайта пришли сразу на статью (статья — входная страница) */
  entries: number;
  siteVisitors: number;
  /** читатели статей, которые в тот же день открыли профиль специалиста / контакты */
  toProfiles: number;
  toContacts: number;
  sources: { source: string; n: number }[];
  byDay: { day: string; n: number }[];
  rows: ArticleRow[];
};

export async function journalStats(days: number): Promise<JournalStats> {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  let views: View[] = [];
  let visits: { day: string; visitor: string; source: string; path: string | null }[] = [];
  let pviews: { visitor: string; created_at: string }[] = [];
  let contacts: { visitor: string; created_at: string }[] = [];
  const sb = supabase();
  if (sb) {
    const all = async <T,>(table: string, cols: string): Promise<T[]> => {
      const out: T[] = [];
      for (let from = 0; from < 200000; from += 1000) {
        const r = await sb.from(table).select(cols).gte("created_at", since).order("created_at").range(from, from + 999);
        if (r.error) break;
        out.push(...(r.data as T[]));
        if (r.data.length < 1000) break;
      }
      return out;
    };
    const sinceDay = since.slice(0, 10);
    const viewsAll = async (): Promise<View[]> => {
      const out: View[] = [];
      for (let from = 0; from < 200000; from += 1000) {
        let r = await sb.from("article_views").select("day,visitor,slug,source,created_at").gte("day", sinceDay).order("day").range(from, from + 999);
        if (r.error) r = (await sb.from("article_views").select("day,visitor,slug").gte("day", sinceDay).order("day").range(from, from + 999)) as typeof r;
        if (r.error) break;
        out.push(...(r.data as View[]).map((v) => ({ ...v, source: v.source || "", created_at: v.created_at ?? null })));
        if (r.data.length < 1000) break;
      }
      return out;
    };
    [views, visits, pviews, contacts] = await Promise.all([
      viewsAll(),
      all<{ day: string; visitor: string; source: string; path: string | null }>("site_visits", "day,visitor,source,path"),
      all<{ visitor: string; created_at: string }>("profile_views", "visitor,created_at"),
      all<{ visitor: string; created_at: string }>("contact_views", "visitor,created_at"),
    ]);
  } else if (dbMode() !== "none") {
    const d = (await readLocal()) as unknown as L & Awaited<ReturnType<typeof readLocal>>;
    views = (d.article_views ?? []).filter((v) => v.day >= since.slice(0, 10)).map((v) => ({ ...v, source: v.source ?? "", created_at: v.created_at ?? null }));
    visits = (d.site_visits ?? []).filter((v) => v.created_at >= since);
    pviews = d.profile_views.filter((v) => v.created_at >= since);
    contacts = d.contact_views.filter((v) => v.created_at >= since);
  }
  const dayOf = (iso: string) => new Date(Date.parse(iso) + 4 * 3600_000).toISOString().slice(0, 10);
  // первый просмотр профиля / контактов человеком в каждый день
  const firstProfile = new Map<string, string>();
  for (const p of pviews) {
    const k = `${p.visitor}|${dayOf(p.created_at)}`;
    if (!firstProfile.has(k) || p.created_at < firstProfile.get(k)!) firstProfile.set(k, p.created_at);
  }
  const contactDays = new Set(contacts.map((c) => `${c.visitor}|${dayOf(c.created_at)}`));
  const entrySet = new Set<string>();
  for (const v of visits) {
    const m = /^\/(?:ru|en|ka)\/guide\/([a-z0-9-]+)/.exec(v.path ?? "");
    if (m) entrySet.add(`${v.visitor}|${v.day}|${m[1]}`);
  }
  const rows = new Map<string, ArticleRow>();
  const src = new Map<string, number>();
  const dayMap = new Map<string, number>();
  const readers = new Set<string>();
  const toProf = new Set<string>();
  const toCont = new Set<string>();
  let fromSearch = 0;
  for (const v of views) {
    const r = rows.get(v.slug) ?? { slug: v.slug, views: 0, search: 0, social: 0, entry: 0, toProfiles: 0 };
    r.views++;
    if (SEARCH.has(v.source)) {
      r.search++;
      fromSearch++;
    } else if (v.source && v.source !== "внутри сайта" && v.source !== "прямой заход") r.social++;
    if (entrySet.has(`${v.visitor}|${v.day}|${v.slug}`)) r.entry++;
    const fp = firstProfile.get(`${v.visitor}|${v.day}`);
    if (fp && (!v.created_at || fp >= v.created_at)) {
      r.toProfiles++;
      toProf.add(`${v.visitor}|${v.day}`);
    }
    if (contactDays.has(`${v.visitor}|${v.day}`)) toCont.add(`${v.visitor}|${v.day}`);
    rows.set(v.slug, r);
    const sk = v.source || "до 26.10 (не записывали)";
    src.set(sk, (src.get(sk) ?? 0) + 1);
    dayMap.set(v.day, (dayMap.get(v.day) ?? 0) + 1);
    readers.add(v.visitor);
  }
  return {
    views: views.length,
    readers: readers.size,
    fromSearch,
    entries: entrySet.size,
    siteVisitors: new Set(visits.map((v) => v.visitor)).size,
    toProfiles: toProf.size,
    toContacts: toCont.size,
    sources: [...src.entries()].map(([source, n]) => ({ source, n })).sort((a, b) => b.n - a.n),
    byDay: [...dayMap.entries()].map(([day, n]) => ({ day, n })).sort((a, b) => a.day.localeCompare(b.day)),
    rows: [...rows.values()].sort((a, b) => b.views - a.views),
  };
}
