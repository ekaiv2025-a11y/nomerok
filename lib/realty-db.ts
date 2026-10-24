import "server-only";
import { randomUUID } from "crypto";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import { LISTING_DAYS, listingQuality, rankAt, type Listing, type RealtyChannel } from "./realty";

/* Объявления недвижимости (только от риелторов с анкетой) и Telegram-каналы риелторов. */
type L = { listings?: Listing[]; realty_channels?: RealtyChannel[]; listing_templates?: ListingTemplate[] };
export type ListingTemplate = { id: string; master_id: string; name: string; data: Record<string, unknown>; created_at: string; updated_at: string };
export const MAX_TEMPLATES = 10;
const local = async () => (dbMode() === "none" ? ({} as L) : ((await readLocal()) as unknown as L));
const save = async (d: L) => writeLocal(d as never);
const expiry = () => new Date(Date.now() + LISTING_DAYS * 86400_000).toISOString();

export type ListingFilter = {
  city?: string;
  deal?: string;
  kind?: string;
  rooms?: number;
  maxPrice?: number;
  minArea?: number;
  district?: string;
  building?: string;
  renovated?: boolean;
  amenity?: string;
  page?: number;
};
const RENOVATED = ["new_renovation", "renovated"];
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
    if (f.kind) q = q.eq("kind", f.kind);
    if (f.minArea) q = q.gte("area", f.minArea);
    if (f.building) q = q.eq("building", f.building);
    if (f.renovated) q = q.in("condition", RENOVATED);
    if (f.amenity) q = q.contains("amenities", [f.amenity]);
    // порядок: свежесть + бонус за заполненность (rank_at), для старых записей — дата создания
    let r = await q.order("rank_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
    if (r.error && /rank_at|column/i.test(r.error.message)) r = await q.order("created_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
    return r.error ? { items: [], total: 0 } : { items: r.data as Listing[], total: r.count ?? 0 };
  }
  let all = ((await local()).listings ?? []).filter((l) => l.status === "published");
  if (f.city) all = all.filter((l) => l.city === f.city);
  if (f.deal) all = all.filter((l) => l.deal === f.deal);
  if (f.rooms != null) all = all.filter((l) => (f.rooms! >= 3 ? (l.rooms ?? -1) >= 3 : l.rooms === f.rooms));
  if (f.maxPrice) all = all.filter((l) => l.price != null && l.price <= f.maxPrice!);
  if (f.district) all = all.filter((l) => l.district === f.district);
  if (f.kind) all = all.filter((l) => l.kind === f.kind);
  if (f.minArea) all = all.filter((l) => (l.area ?? 0) >= f.minArea!);
  if (f.building) all = all.filter((l) => l.building === f.building);
  if (f.renovated) all = all.filter((l) => RENOVATED.includes(l.condition ?? ""));
  if (f.amenity) all = all.filter((l) => (l.amenities ?? []).includes(f.amenity!));
  all.sort((a, b) => (b.rank_at ?? b.created_at).localeCompare(a.rank_at ?? a.created_at));
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
  const quality = data.quality ?? listingQuality(data).percent;
  const row: Listing = { ...data, id: randomUUID(), reports: 0, created_at: now, updated_at: now, expires_at: data.status === "published" ? expiry() : null, quality, rank_at: data.rank_at ?? rankAt(now, quality) };
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

/** Пересчитать заполненность и место в списке (после правок из Telegram). */
export async function refreshQuality(id: string): Promise<void> {
  const l = await getListing(id);
  if (!l) return;
  const q = listingQuality(l).percent;
  const base = l.rank_at ? new Date(Date.parse(l.rank_at) - ((l.quality ?? 0) / 100) * 48 * 3600_000).toISOString() : l.created_at;
  await updateListing(id, { quality: q, rank_at: rankAt(base, q) });
}

/** «Поднять» бесплатно — не чаще раза в 7 дней: объявление снова как свежее. Возвращает false, если рано. */
export async function bumpListing(l: Listing): Promise<boolean> {
  const base = l.rank_at ? Date.parse(l.rank_at) - ((l.quality ?? 0) / 100) * 48 * 3600_000 : Date.parse(l.created_at);
  if (Date.now() - base < 7 * 86400_000) return false;
  const q = listingQuality(l).percent;
  await updateListing(l.id, { quality: q, rank_at: rankAt(new Date().toISOString(), q), status: "published", expire_warned_at: null });
  return true;
}
/** Когда можно поднять снова (ISO) — для кнопки в кабинете. */
export function nextBumpAt(l: Listing): string {
  const base = l.rank_at ? Date.parse(l.rank_at) - ((l.quality ?? 0) / 100) * 48 * 3600_000 : Date.parse(l.created_at);
  return new Date(base + 7 * 86400_000).toISOString();
}

/** Счётчики: просмотр объявления, нажатие «Показать телефон» / «Написать». */
export async function countListing(id: string, field: "views" | "contacts"): Promise<void> {
  const sb = supabase();
  if (sb) {
    const r = await sb.rpc("listing_bump", { lid: id, field });
    if (r.error) {
      const l = await getListing(id);
      if (l) await sb.from("listings").update({ [field]: (l[field] ?? 0) + 1 }).eq("id", id);
    }
    return;
  }
  const d = await local();
  d.listings = (d.listings ?? []).map((l) => (l.id === id ? { ...l, [field]: (l[field] ?? 0) + 1 } : l));
  await save(d);
}

/** Копия объявления (черновик) — для похожих квартир в том же доме. */
export async function duplicateListing(l: Listing): Promise<Listing> {
  const { id: _id, created_at: _c, updated_at: _u, reports: _r, expires_at: _e, views: _v, contacts: _ct, rank_at: _rk, ...rest } = l;
  void _id; void _c; void _u; void _r; void _e; void _v; void _ct; void _rk;
  return createListing({ ...rest, title: `${l.title} (копия)`.slice(0, 120), status: "draft", source: "site", tg_key: null, tg_link: null, expire_warned_at: null, views: 0, contacts: 0 });
}

/* ---------- шаблоны объявлений ---------- */

export async function templatesOf(masterId: string): Promise<ListingTemplate[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("listing_templates").select("*").eq("master_id", masterId).order("created_at").limit(MAX_TEMPLATES);
    return r.error ? [] : (r.data as ListingTemplate[]);
  }
  return ((await local()).listing_templates ?? []).filter((x) => x.master_id === masterId);
}

/** Создать или обновить шаблон. null — достигнут лимит. */
export async function saveTemplate(masterId: string, t: { id?: string; name: string; data?: Record<string, unknown> }): Promise<ListingTemplate | null> {
  const now = new Date().toISOString();
  const list = await templatesOf(masterId);
  const old = t.id ? list.find((x) => x.id === t.id) : null;
  if (!old && list.length >= MAX_TEMPLATES) return null;
  const row: ListingTemplate = old
    ? { ...old, name: t.name, data: t.data ?? old.data, updated_at: now }
    : { id: randomUUID(), master_id: masterId, name: t.name, data: t.data ?? {}, created_at: now, updated_at: now };
  const sb = supabase();
  if (sb) {
    const r = await sb.from("listing_templates").upsert(row);
    if (r.error) throw new Error(r.error.message);
    return row;
  }
  const d = await local();
  d.listing_templates = [...(d.listing_templates ?? []).filter((x) => x.id !== row.id), row];
  await save(d);
  return row;
}

export async function deleteTemplate(masterId: string, id: string): Promise<void> {
  const sb = supabase();
  if (sb) {
    await sb.from("listing_templates").delete().eq("id", id).eq("master_id", masterId);
    return;
  }
  const d = await local();
  d.listing_templates = (d.listing_templates ?? []).filter((x) => !(x.id === id && x.master_id === masterId));
  await save(d);
}
