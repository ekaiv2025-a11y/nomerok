import "server-only";
import { check, dbMode, DbNotConfiguredError, readLocal, supabase, writeLocal } from "./db";
import { todayTbilisi } from "./availability";

/*
 * Статистика специалиста: просмотры профиля, открытия контактов, взятые заявки.
 * Просмотр считается один раз в день на посетителя (посетитель — обезличенный код, не IP).
 */

export async function recordProfileView(masterId: string, visitor: string): Promise<void> {
  const day = todayTbilisi();
  const sb = supabase();
  if (sb) {
    await sb.from("profile_views").upsert({ master_id: masterId, visitor, day }, { onConflict: "master_id,visitor,day", ignoreDuplicates: true });
    return;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  if (!d.profile_views.some((v) => v.master_id === masterId && v.visitor === visitor && v.day === day)) {
    d.profile_views.push({ master_id: masterId, visitor, day, created_at: new Date().toISOString() });
    await writeLocal(d);
  }
}

export type MasterStats = { views: number; contacts: number; taken: number };

/** Цифры за последние `days` дней. */
export async function masterStats(masterId: string, days: number): Promise<MasterStats> {
  const since = new Date(Date.now() - days * 86400 * 1000);
  const sinceIso = since.toISOString();
  const sinceDay = sinceIso.slice(0, 10);
  const sb = supabase();
  if (sb) {
    const count = async (table: string, col: string, from: string) => {
      const r = await sb.from(table).select("id", { count: "exact", head: true }).eq("master_id", masterId).gte(col, from);
      return r.error ? 0 : (r.count ?? 0);
    };
    const [views, contacts, taken] = await Promise.all([
      count("profile_views", "day", sinceDay),
      count("contact_views", "created_at", sinceIso),
      count("request_responses", "created_at", sinceIso),
    ]);
    return { views, contacts, taken };
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  return {
    views: d.profile_views.filter((v) => v.master_id === masterId && v.day >= sinceDay).length,
    contacts: d.contact_views.filter((v) => v.master_id === masterId && v.created_at >= sinceIso).length,
    taken: d.responses.filter((v) => v.master_id === masterId && v.created_at >= sinceIso).length,
  };
}

/** Просмотры по дням за `days` дней — для маленького графика в кабинете. */
export async function viewsByDay(masterId: string, days: number): Promise<{ day: string; n: number }[]> {
  const out: { day: string; n: number }[] = [];
  const start = new Date(todayTbilisi() + "T00:00:00Z");
  start.setUTCDate(start.getUTCDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    out.push({ day: d.toISOString().slice(0, 10), n: 0 });
  }
  const from = out[0].day;
  let rows: { day: string }[] = [];
  const sb = supabase();
  if (sb) {
    const r = await sb.from("profile_views").select("day").eq("master_id", masterId).gte("day", from).limit(20000);
    rows = r.error ? [] : (check(r) as { day: string }[]);
  } else if (dbMode() !== "none") {
    rows = (await readLocal()).profile_views.filter((v) => v.master_id === masterId && v.day >= from);
  }
  for (const r of rows) {
    const x = out.find((o) => o.day === r.day);
    if (x) x.n++;
  }
  return out;
}
