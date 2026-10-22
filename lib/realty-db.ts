import "server-only";
import { randomUUID } from "crypto";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import { LISTING_DAYS, type Listing, type RealtyChannel } from "./realty";

/* Объявления недвижимости (только от риелторов с анкетой) и Telegram-каналы риелторов. */
type L = { listings?: Listing[]; realty_channels?: RealtyChannel[] };
const local = async () => (dbMode() === "none" ? ({} as L) : ((await readLocal()) as unknown as L));
const save = async (d: L) => writeLocal(d as never);
const expiry = () => new Date(Date.now() + LISTING_DAYS * 86400_000).toISOString();

export type ListingFilter = { city?: string; deal?: string; rooms?: number; maxPrice?: number; district?: string; page?: number };
const PAGE = 24;

export async function listListings(f: ListingFilter): Promise<{ items: Listing[]; total: number }> {
  const page = Math.max(1, f.page ?? 1);
  const sb = supabase();
  if (sb) {
    let q = sb.from("listings").select("*", { count: "exact" }).eq("status", "published");
    if (f.city) q = q.eq("city", f.city);
    if (f.deal) q = q.eq("deal", f.deal);
    if (f.rooms != null) q = f.rooms >= 3 ? q.gte("rooms", 3) : q.eq("rooms", f.rooms);
    if (f.maxPrice) q = q.lte("price", f.maxPrice);
    if (f.district) q = q.eq("district", f.district);
    const r = await q.order("created_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
    return r.error ? { items: [], total: 0 } : { items: r.data as Listing[], total: r.count ?? 0 };
  }
  let all = ((await local()).listings ?? []).filter((l) => l.status === "published");
  if (f.city) all = all.filter((l) => l.city === f.city);
  if (f.deal) all = all.filter((l) => l.deal === f.deal);
  if (f.rooms != null) all = all.filter((l) => (f.rooms! >= 3 ? (l.rooms ?? -1) >= 3 : l.rooms === f.rooms));
  if (f.maxPrice) all = all.filter((l) => l.price != null && l.price <= f.maxPrice!);
  if (f.district) all = all.filter((l) => l.district === f.district);
  all.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { items: all.slice((page - 1) * PAGE, page * PAGE), total: all.length };
}

export async function getListing(id: string): Promise<Listing | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const sb = supabase();
  if (sb) {
    const r = await sb.from("listings").select("*").eq("id", id).maybeSingle();
    return r.error ? null : ((r.data as Listing) ?? null);
  }
  return ((await local()).listings ?? []).find((l) => l.id === id) ?? null;
}

export async function listingByTgKey(key: string): Promise<Listing | null> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("listings").select("*").eq("tg_key", key).maybeSingle();
    return r.error ? null : ((r.data as Listing) ?? null);
  }
  return ((await local()).listings ?? []).find((l) => l.tg_key === key) ?? null;
}

export async function listingsOf(masterId: string): Promise<Listing[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("listings").select("*").eq("master_id", masterId).order("created_at", { ascending: false }).limit(200);
    return r.error ? [] : (r.data as Listing[]);
  }
  return ((await local()).listings ?? []).filter((l) => l.master_id === masterId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createListing(data: Omit<Listing, "id" | "created_at" | "updated_at" | "reports" | "expires_at"> & { expires_at?: string | null }): Promise<Listing> {
  const now = new Date().toISOString();
  const row: Listing = { ...data, id: randomUUID(), reports: 0, created_at: now, updated_at: now, expires_at: data.status === "published" ? expiry() : null };
  const sb = supabase();
  if (sb) {
    const r = await sb.from("listings").insert(row).select("*").single();
    if (r.error) throw new Error(r.error.message);
    return r.data as Listing;
  }
  const d = await local();
  d.listings = [row, ...(d.listings ?? [])];
  await save(d);
  return row;
}

export async function updateListing(id: string, patch: Partial<Listing>): Promise<void> {
  const p = { ...patch, updated_at: new Date().toISOString() };
  if (patch.status === "published" && !("expires_at" in patch)) p.expires_at = expiry();
  const sb = supabase();
  if (sb) {
    const r = await sb.from("listings").update(p).eq("id", id);
    if (r.error) throw new Error(r.error.message);
    return;
  }
  const d = await local();
  d.listings = (d.listings ?? []).map((l) => (l.id === id ? { ...l, ...p } : l));
  await save(d);
}

export async function deleteListing(id: string): Promise<void> {
  const sb = supabase();
  if (sb) {
    await sb.from("listings").delete().eq("id", id);
    return;
  }
  const d = await local();
  d.listings = (d.listings ?? []).filter((l) => l.id !== id);
  await save(d);
}

/** Истёк срок — в архив; за 3 дня до конца — предупредить (один раз). */
export async function listingsToExpire(): Promise<{ expired: Listing[]; soon: Listing[] }> {
  const now = new Date().toISOString();
  const soonAt = new Date(Date.now() + 3 * 86400_000).toISOString();
  const sb = supabase();
  let pub: Listing[];
  if (sb) {
    const r = await sb.from("listings").select("*").eq("status", "published").lt("expires_at", soonAt).limit(500);
    pub = r.error ? [] : (r.data as Listing[]);
  } else pub = ((await local()).listings ?? []).filter((l) => l.status === "published" && (l.expires_at ?? "9") < soonAt);
  return { expired: pub.filter((l) => (l.expires_at ?? "9") < now), soon: pub.filter((l) => (l.expires_at ?? "9") >= now && !l.expire_warned_at) };
}

/* ---------- каналы ---------- */

export async function getChannel(chatId: number): Promise<RealtyChannel | null> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("realty_channels").select("*").eq("chat_id", chatId).maybeSingle();
    return r.error ? null : ((r.data as RealtyChannel) ?? null);
  }
  return ((await local()).realty_channels ?? []).find((c) => c.chat_id === chatId) ?? null;
}

export async function channelsOf(masterId: string): Promise<RealtyChannel[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("realty_channels").select("*").eq("master_id", masterId);
    return r.error ? [] : (r.data as RealtyChannel[]);
  }
  return ((await local()).realty_channels ?? []).filter((c) => c.master_id === masterId);
}

export async function saveChannel(c: Omit<RealtyChannel, "connected_at" | "auto_publish"> & { auto_publish?: boolean }): Promise<void> {
  const row = { auto_publish: true, connected_at: new Date().toISOString(), ...c };
  const sb = supabase();
  if (sb) {
    await sb.from("realty_channels").upsert(row, { onConflict: "chat_id" });
    return;
  }
  const d = await local();
  d.realty_channels = [...(d.realty_channels ?? []).filter((x) => x.chat_id !== c.chat_id), row as RealtyChannel];
  await save(d);
}

export async function updateChannel(chatId: number, patch: Partial<RealtyChannel>): Promise<void> {
  const sb = supabase();
  if (sb) {
    await sb.from("realty_channels").update(patch).eq("chat_id", chatId);
    return;
  }
  const d = await local();
  d.realty_channels = (d.realty_channels ?? []).map((c) => (c.chat_id === chatId ? { ...c, ...patch } : c));
  await save(d);
}

export async function removeChannel(chatId: number): Promise<void> {
  const sb = supabase();
  if (sb) {
    await sb.from("realty_channels").delete().eq("chat_id", chatId);
    return;
  }
  const d = await local();
  d.realty_channels = (d.realty_channels ?? []).filter((c) => c.chat_id !== chatId);
  await save(d);
}

/** Все опубликованные объявления — для карты сайта. */
export async function indexableListings(): Promise<Pick<Listing, "id" | "updated_at">[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("listings").select("id,updated_at").eq("status", "published").limit(5000);
    return r.error ? [] : (r.data as Pick<Listing, "id" | "updated_at">[]);
  }
  return ((await local()).listings ?? []).filter((l) => l.status === "published");
}

/** Админка: последние объявления (все статусы). */
export async function adminListings(status?: string): Promise<Listing[]> {
  const sb = supabase();
  if (sb) {
    let q = sb.from("listings").select("*");
    if (status) q = q.eq("status", status);
    const r = await q.order("created_at", { ascending: false }).limit(300);
    return r.error ? [] : (r.data as Listing[]);
  }
  return ((await local()).listings ?? []).filter((l) => !status || l.status === status);
}
