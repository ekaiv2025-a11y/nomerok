import "server-only";
import { randomUUID } from "crypto";
import { dbMode, readLocal, supabase, writeLocal } from "./db";

/*
 * «Поднимем анкету за сторис»: специалист выкладывает свою карточку NomerOk в сторис и присылает скриншот.
 * Администратор проверяет → анкета 7 дней выше в каталоге. Новый скриншот — не чаще раза в 7 дней.
 */
export type Boost = { id: string; master_id: string; image_url: string; status: "pending" | "approved" | "rejected"; created_at: string; decided_at: string | null; until: string | null };

export const BOOST_DAYS = 7;

async function all(filter?: { master?: string; status?: Boost["status"] }): Promise<Boost[]> {
  const sb = supabase();
  if (sb) {
    let q = sb.from("story_boosts").select("*").order("created_at", { ascending: false }).limit(300);
    if (filter?.master) q = q.eq("master_id", filter.master);
    if (filter?.status) q = q.eq("status", filter.status);
    const r = await q;
    return r.error ? [] : (r.data as Boost[]);
  }
  if (dbMode() === "none") return [];
  return ((await readLocal()).story_boosts ?? [])
    .filter((b) => (!filter?.master || b.master_id === filter.master) && (!filter?.status || b.status === filter.status))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Последняя заявка специалиста и можно ли прислать новую. */
export async function boostState(masterId: string): Promise<{ last: Boost | null; activeUntil: string | null; canSend: boolean }> {
  const list = await all({ master: masterId });
  const last = list[0] ?? null;
  const now = Date.now();
  const active = list.find((b) => b.status === "approved" && b.until && Date.parse(b.until) > now) ?? null;
  const recent = last && now - Date.parse(last.created_at) < BOOST_DAYS * 86400_000 && last.status !== "rejected";
  return { last, activeUntil: active?.until ?? null, canSend: !recent && last?.status !== "pending" };
}

export async function addBoost(masterId: string, imageUrl: string): Promise<Boost> {
  const row: Boost = { id: randomUUID(), master_id: masterId, image_url: imageUrl, status: "pending", created_at: new Date().toISOString(), decided_at: null, until: null };
  const sb = supabase();
  if (sb) {
    const r = await sb.from("story_boosts").insert(row);
    if (r.error) throw new Error(r.error.message);
    return row;
  }
  const d = await readLocal();
  d.story_boosts = [...(d.story_boosts ?? []), row];
  await writeLocal(d);
  return row;
}

export const pendingBoosts = () => all({ status: "pending" });

export async function getBoost(id: string): Promise<Boost | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const sb = supabase();
  if (sb) {
    const r = await sb.from("story_boosts").select("*").eq("id", id).maybeSingle();
    return r.error ? null : ((r.data as Boost) ?? null);
  }
  return ((await readLocal()).story_boosts ?? []).find((b) => b.id === id) ?? null;
}

export async function decideBoost(id: string, ok: boolean): Promise<Boost | null> {
  const b = await getBoost(id);
  if (!b || b.status !== "pending") return null;
  const now = new Date();
  const patch = { status: ok ? ("approved" as const) : ("rejected" as const), decided_at: now.toISOString(), until: ok ? new Date(now.getTime() + BOOST_DAYS * 86400_000).toISOString() : null };
  const sb = supabase();
  if (sb) await sb.from("story_boosts").update(patch).eq("id", id);
  else {
    const d = await readLocal();
    d.story_boosts = (d.story_boosts ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x));
    await writeLocal(d);
  }
  return { ...b, ...patch };
}

/** Кто сейчас поднят в каталоге. */
export async function boostedIds(): Promise<Set<string>> {
  const now = new Date().toISOString();
  const sb = supabase();
  let rows: Pick<Boost, "master_id" | "until">[] = [];
  if (sb) {
    const r = await sb.from("story_boosts").select("master_id,until").eq("status", "approved").gt("until", now);
    if (r.error) return new Set();
    rows = r.data as typeof rows;
  } else if (dbMode() !== "none") rows = ((await readLocal()).story_boosts ?? []).filter((b) => b.status === "approved" && (b.until ?? "") > now);
  return new Set(rows.map((r) => r.master_id));
}
