import "server-only";
import { randomBytes } from "crypto";
import { dbMode, readLocal, supabase, writeLocal } from "./db";

/* История цены за м² по ЖК и подписки «сообщить о новых квартирах» (миграция 0061). */
export type PricePoint = { slug: string; day: string; per_m2: number | null; from_price: number | null; free_units: number | null };
export type ReAlert = {
  id: string;
  token: string;
  chat_id: number | null;
  city: string | null;
  rooms: number | null;
  max_price: number | null;
  project: string | null;
  deal: string;
  active: boolean;
  created_at: string;
  last_sent_at: string | null;
};
type L = { project_prices?: PricePoint[]; re_alerts?: ReAlert[] };
const local = async () => (dbMode() === "none" ? ({} as L) : ((await readLocal()) as unknown as L));
const save = async (d: L) => writeLocal(d as never);

export async function priceHistory(slug: string): Promise<PricePoint[]> {
  const sb = supabase();
  let v: PricePoint[];
  if (sb) {
    const r = await sb.from("project_prices").select("*").eq("slug", slug).order("day").limit(400);
    v = r.error ? [] : (r.data as PricePoint[]);
  } else v = ((await local()).project_prices ?? []).filter((p) => p.slug === slug).sort((a, b) => a.day.localeCompare(b.day));
  return v.map((p) => ({ ...p, per_m2: p.per_m2 == null ? null : Number(p.per_m2), from_price: p.from_price == null ? null : Number(p.from_price) }));
}

/** Записать цену дня (если та же, что в последней записи, — не пишем: история только из изменений + раз в 30 дней). */
export async function recordPrice(p: PricePoint): Promise<boolean> {
  const hist = await priceHistory(p.slug);
  const last = hist.at(-1);
  if (last && last.day === p.day) return false;
  const same = last && last.per_m2 === p.per_m2 && last.from_price === p.from_price && last.free_units === p.free_units;
  if (same && Date.now() - Date.parse(last.day) < 30 * 86400_000) return false;
  const sb = supabase();
  if (sb) {
    const r = await sb.from("project_prices").upsert(p, { onConflict: "slug,day" });
    return !r.error;
  }
  const d = await local();
  d.project_prices = [...(d.project_prices ?? []).filter((x) => !(x.slug === p.slug && x.day === p.day)), p];
  await save(d);
  return true;
}

export async function createAlert(a: Pick<ReAlert, "city" | "rooms" | "max_price" | "project" | "deal">): Promise<ReAlert> {
  const row: ReAlert = { ...a, id: crypto.randomUUID(), token: randomBytes(9).toString("hex"), chat_id: null, active: false, created_at: new Date().toISOString(), last_sent_at: null };
  const sb = supabase();
  if (sb) {
    const r = await sb.from("re_alerts").insert(row).select("*").single();
    if (r.error) throw new Error(r.error.message);
    return r.data as ReAlert;
  }
  const d = await local();
  d.re_alerts = [...(d.re_alerts ?? []), row];
  await save(d);
  return row;
}

export async function alertByToken(token: string): Promise<ReAlert | null> {
  if (!/^[a-f0-9]{18}$/.test(token)) return null;
  const sb = supabase();
  if (sb) return ((await sb.from("re_alerts").select("*").eq("token", token).maybeSingle()).data as ReAlert) ?? null;
  return ((await local()).re_alerts ?? []).find((x) => x.token === token) ?? null;
}

export async function updateAlert(id: string, patch: Partial<ReAlert>) {
  const sb = supabase();
  if (sb) {
    await sb.from("re_alerts").update(patch).eq("id", id);
    return;
  }
  const d = await local();
  d.re_alerts = (d.re_alerts ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x));
  await save(d);
}

export async function activeAlerts(chatId?: number): Promise<ReAlert[]> {
  const sb = supabase();
  if (sb) {
    let q = sb.from("re_alerts").select("*").eq("active", true);
    if (chatId) q = q.eq("chat_id", chatId);
    const r = await q.limit(5000);
    return r.error ? [] : (r.data as ReAlert[]);
  }
  return ((await local()).re_alerts ?? []).filter((x) => x.active && (!chatId || x.chat_id === chatId));
}
