import "server-only";
import { dbMode, DbNotConfiguredError, readLocal, supabase } from "./db";

/* Статистика для админки: просмотры профилей, открытия контактов, заявки, регистрации — по дням. */

export type DayStat = { day: string; views: number; visitors: number; contacts: number; requests: number; signups: number };
export type Stats = { days: DayStat[]; top: { master_id: string; views: number; contacts: number }[] };

function dayOf(iso: string): string {
  // день по Тбилиси (UTC+4)
  return new Date(Date.parse(iso) + 4 * 3600 * 1000).toISOString().slice(0, 10);
}

export async function getStats(daysBack = 30): Promise<Stats> {
  const since = new Date(Date.now() - daysBack * 24 * 3600 * 1000).toISOString();
  let views: { master_id: string; visitor: string; created_at: string }[] = [];
  let contacts: { master_id: string; created_at: string }[] = [];
  let requests: { created_at: string }[] = [];
  let signups: { created_at: string }[] = [];
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
    [views, contacts, requests, signups] = await Promise.all([
      all<{ master_id: string; visitor: string; created_at: string }>("profile_views", "master_id,visitor,created_at"),
      all<{ master_id: string; created_at: string }>("contact_views", "master_id,created_at"),
      all<{ created_at: string }>("requests", "created_at"),
      all<{ created_at: string }>("masters", "created_at"),
    ]);
  } else {
    if (dbMode() === "none") throw new DbNotConfiguredError();
    const d = await readLocal();
    views = d.profile_views.filter((v) => v.created_at >= since);
    contacts = d.contact_views.filter((v) => v.created_at >= since);
    requests = d.requests.filter((r) => r.created_at >= since);
    signups = d.masters.filter((m) => m.created_at >= since);
  }
  const map = new Map<string, DayStat & { vis: Set<string> }>();
  for (let i = daysBack - 1; i >= 0; i--) {
    const day = dayOf(new Date(Date.now() - i * 24 * 3600 * 1000).toISOString());
    map.set(day, { day, views: 0, visitors: 0, contacts: 0, requests: 0, signups: 0, vis: new Set() });
  }
  const get = (iso: string) => map.get(dayOf(iso));
  for (const v of views) {
    const d = get(v.created_at);
    if (d) {
      d.views++;
      d.vis.add(v.visitor);
    }
  }
  for (const c of contacts) get(c.created_at) && get(c.created_at)!.contacts++;
  for (const r of requests) get(r.created_at) && get(r.created_at)!.requests++;
  for (const s of signups) get(s.created_at) && get(s.created_at)!.signups++;
  const days = [...map.values()].map(({ vis, ...d }) => ({ ...d, visitors: vis.size }));

  const per = new Map<string, { views: number; contacts: number }>();
  for (const v of views) per.set(v.master_id, { views: (per.get(v.master_id)?.views ?? 0) + 1, contacts: per.get(v.master_id)?.contacts ?? 0 });
  for (const c of contacts) per.set(c.master_id, { views: per.get(c.master_id)?.views ?? 0, contacts: (per.get(c.master_id)?.contacts ?? 0) + 1 });
  const top = [...per.entries()].map(([master_id, s]) => ({ master_id, ...s })).sort((a, b) => b.views - a.views).slice(0, 15);
  return { days, top };
}
