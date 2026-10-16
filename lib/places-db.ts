import "server-only";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import type { Place } from "./places";

/*
 * «Места» — хранение и выборки. Supabase (таблица places) или локальный файл для проверки.
 * Если таблицы ещё нет (миграция 0021 не выполнена) — всё возвращает пусто, сайт не падает.
 */

const PAGE = 30;

async function localAll(): Promise<Place[]> {
  if (dbMode() === "none") return [];
  return (await readLocal()).places ?? [];
}

function matches(p: Place, q: string) {
  const s = q.toLowerCase();
  return [p.name, p.name_en, p.name_ka, p.sub, p.addr].some((x) => (x ?? "").toLowerCase().includes(s));
}
const rank = (p: Place) => (p.owner_verified_at ? 0 : 2) + (p.desc_ru || p.desc_en ? 0 : 1);
const qSafe = (q: string) => q.replace(/[%,()*\\]/g, " ").trim().slice(0, 60);

export async function listPlaces(opts: { cat?: string; q?: string; page?: number; admin?: { status?: string } }): Promise<{ items: Place[]; total: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const q = qSafe(opts.q ?? "");
  const status = opts.admin ? opts.admin.status : "published";
  const sb = supabase();
  if (sb) {
    let req = sb.from("places").select("*", { count: "exact" });
    if (status) req = req.eq("status", status);
    if (opts.cat) req = req.eq("cat", opts.cat);
    if (q) req = req.or(["name", "name_en", "name_ka", "sub", "addr"].map((c) => `${c}.ilike.%${q}%`).join(","));
    const r = await req
      .order("owner_verified_at", { ascending: false, nullsFirst: false })
      .order("desc_ru", { ascending: true, nullsFirst: false })
      .order("name")
      .range((page - 1) * PAGE, page * PAGE - 1);
    if (r.error) return { items: [], total: 0 };
    return { items: (r.data as Place[]) ?? [], total: r.count ?? 0 };
  }
  let all = (await localAll()).filter((p) => (!status || p.status === status) && (!opts.cat || p.cat === opts.cat) && (!q || matches(p, q)));
  all = all.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  return { items: all.slice((page - 1) * PAGE, page * PAGE), total: all.length };
}
export const PLACES_PAGE = PAGE;

let countsCache: { at: number; v: Record<string, number> } | null = null;
/** Сколько опубликованных мест в каждом разделе (кэш 10 минут). */
export async function placeCounts(): Promise<Record<string, number>> {
  if (countsCache && Date.now() - countsCache.at < 600_000) return countsCache.v;
  const { PLACE_CATS } = await import("./places");
  const sb = supabase();
  const v: Record<string, number> = {};
  if (sb) {
    await Promise.all(
      PLACE_CATS.map(async (c) => {
        const r = await sb.from("places").select("id", { count: "exact", head: true }).eq("status", "published").eq("cat", c.id);
        v[c.id] = r.error ? 0 : r.count ?? 0;
      }),
    );
  } else {
    for (const p of await localAll()) if (p.status === "published") v[p.cat] = (v[p.cat] ?? 0) + 1;
  }
  countsCache = { at: Date.now(), v };
  return v;
}

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("places").select("*").eq("slug", slug).maybeSingle();
    return r.error ? null : ((r.data as Place) ?? null);
  }
  return (await localAll()).find((p) => p.slug === slug) ?? null;
}

export async function getPlace(id: string): Promise<Place | null> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("places").select("*").eq("id", id).maybeSingle();
    return r.error ? null : ((r.data as Place) ?? null);
  }
  return (await localAll()).find((p) => p.id === id) ?? null;
}

/** Места по списку id или адресов (slug) — для подборок. Порядок как в списке. */
export async function placesByRefs(refs: string[]): Promise<Place[]> {
  if (!refs.length) return [];
  const sb = supabase();
  let found: Place[] = [];
  if (sb) {
    const a = await sb.from("places").select("*").in("id", refs);
    const b = await sb.from("places").select("*").in("slug", refs);
    found = [...((a.data as Place[]) ?? []), ...((b.data as Place[]) ?? [])];
  } else {
    found = (await localAll()).filter((p) => refs.includes(p.id) || refs.includes(p.slug));
  }
  const out: Place[] = [];
  for (const r of refs) {
    const p = found.find((x) => x.id === r || x.slug === r);
    if (p && p.status === "published" && !out.includes(p)) out.push(p);
  }
  return out;
}

/** Ближайшие места того же раздела (примерно в пределах километра). */
export async function nearbyPlaces(p: Place, limit = 6): Promise<Place[]> {
  if (p.lat == null || p.lng == null) return [];
  const d = 0.01;
  const sb = supabase();
  let list: Place[];
  if (sb) {
    const r = await sb
      .from("places")
      .select("*")
      .eq("status", "published")
      .eq("cat", p.cat)
      .neq("id", p.id)
      .gte("lat", p.lat - d)
      .lte("lat", p.lat + d)
      .gte("lng", p.lng - d)
      .lte("lng", p.lng + d)
      .limit(40);
    list = (r.data as Place[]) ?? [];
  } else {
    list = (await localAll()).filter((x) => x.status === "published" && x.cat === p.cat && x.id !== p.id && x.lat != null && Math.abs(x.lat - p.lat!) < d && Math.abs(x.lng! - p.lng!) < d);
  }
  const dist = (x: Place) => (x.lat! - p.lat!) ** 2 + (x.lng! - p.lng!) ** 2;
  return list.sort((a, b) => dist(a) - dist(b)).slice(0, limit);
}

/** Опубликованные места с описанием — для карты сайта. */
export async function indexablePlaces(): Promise<Pick<Place, "slug" | "updated_at">[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("places").select("slug,updated_at").eq("status", "published").or("desc_ru.not.is.null,desc_en.not.is.null").limit(5000);
    return (r.data as Place[]) ?? [];
  }
  return (await localAll()).filter((p) => p.status === "published" && (p.desc_ru || p.desc_en));
}

export async function updatePlace(id: string, patch: Partial<Place>): Promise<void> {
  const now = new Date().toISOString();
  const sb = supabase();
  if (sb) {
    const r = await sb.from("places").update({ ...patch, updated_at: now }).eq("id", id);
    if (r.error) throw new Error(r.error.message);
    countsCache = null;
    return;
  }
  const d = await readLocal();
  d.places = (d.places ?? []).map((p) => (p.id === id ? { ...p, ...patch, updated_at: now } : p));
  await writeLocal(d);
  countsCache = null;
}

/** Место, которое этот Telegram сейчас подтверждает (нажал «Это моё заведение» в последний час). */
export async function placeClaimedBy(chatId: number): Promise<Place | null> {
  const since = new Date(Date.now() - 3600_000).toISOString();
  const sb = supabase();
  if (sb) {
    const r = await sb.from("places").select("*").eq("claim_chat_id", chatId).gte("claim_at", since).order("claim_at", { ascending: false }).limit(1);
    return ((r.data as Place[]) ?? [])[0] ?? null;
  }
  return (await localAll()).find((p) => p.claim_chat_id === chatId && (p.claim_at ?? "") >= since) ?? null;
}

const DATA_FIELDS = ["name", "name_en", "name_ka", "cat", "sub", "addr", "lat", "lng", "phones", "site", "ig", "socials", "email", "hours", "desc_ru", "desc_en", "src", "links", "area", "checked"] as const;

/**
 * Импорт мест из файла data/places-*.json.
 * Новые — добавляет. Существующие — обновляет данными из файла, но НЕ трогает те, что правили вручную (edited),
 * и никогда не меняет статус, фото и владельца.
 */
export async function importPlaces(rows: (Partial<Place> & { id: string; slug: string; name: string; cat: string; whatsapp?: boolean })[]): Promise<{ added: number; updated: number; skipped: number }> {
  const now = new Date().toISOString();
  const clean = rows.map((r) => {
    const o: Record<string, unknown> = { id: r.id, slug: r.slug };
    for (const k of DATA_FIELDS) o[k] = (r as Record<string, unknown>)[k] ?? (k === "phones" || k === "socials" || k === "links" ? [] : null);
    return { row: o, status: r.status ?? "published" };
  });
  const sb = supabase();
  let added = 0;
  let updated = 0;
  let skipped = 0;
  if (sb) {
    const existing = new Map<string, { edited: boolean }>();
    for (let from = 0; ; from += 1000) {
      const r = await sb.from("places").select("id,edited").range(from, from + 999);
      if (r.error) throw new Error(/does not exist|schema cache/i.test(r.error.message) ? "Таблица мест ещё не создана (миграция 0021) — дождитесь обновления сайта" : r.error.message);
      for (const x of r.data as { id: string; edited: boolean }[]) existing.set(x.id, x);
      if ((r.data ?? []).length < 1000) break;
    }
    const fresh = clean.filter((c) => !existing.has(c.row.id as string)).map((c) => ({ ...c.row, status: c.status, created_at: now, updated_at: now }));
    const upd = clean.filter((c) => existing.has(c.row.id as string) && !existing.get(c.row.id as string)!.edited).map((c) => ({ ...c.row, updated_at: now }));
    skipped = clean.length - fresh.length - upd.length;
    for (let i = 0; i < fresh.length; i += 500) {
      const r = await sb.from("places").insert(fresh.slice(i, i + 500));
      if (r.error) throw new Error(r.error.message);
      added += Math.min(500, fresh.length - i);
    }
    for (let i = 0; i < upd.length; i += 500) {
      const r = await sb.from("places").upsert(upd.slice(i, i + 500), { onConflict: "id" });
      if (r.error) throw new Error(r.error.message);
      updated += Math.min(500, upd.length - i);
    }
  } else {
    const d = await readLocal();
    const map = new Map((d.places ?? []).map((p) => [p.id, p]));
    for (const c of clean) {
      const prev = map.get(c.row.id as string);
      if (!prev) {
        map.set(c.row.id as string, { ...(c.row as unknown as Place), status: c.status as Place["status"], created_at: now, updated_at: now });
        added++;
      } else if (prev.edited) skipped++;
      else {
        map.set(prev.id, { ...prev, ...(c.row as unknown as Place), updated_at: now });
        updated++;
      }
    }
    d.places = [...map.values()];
    await writeLocal(d);
  }
  countsCache = null;
  return { added, updated, skipped };
}

export async function adminPlaceStats(): Promise<{ total: number; published: number; withDesc: number; owners: number }> {
  const sb = supabase();
  if (sb) {
    const head = () => sb.from("places").select("id", { count: "exact", head: true });
    const [t, p, d, o] = await Promise.all([
      head(),
      head().eq("status", "published"),
      head().not("desc_ru", "is", null),
      head().not("owner_verified_at", "is", null),
    ]);
    return { total: t.count ?? 0, published: p.count ?? 0, withDesc: d.count ?? 0, owners: o.count ?? 0 };
  }
  const all = await localAll();
  return { total: all.length, published: all.filter((p) => p.status === "published").length, withDesc: all.filter((p) => p.desc_ru).length, owners: all.filter((p) => p.owner_verified_at).length };
}
