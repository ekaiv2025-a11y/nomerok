import "server-only";
import { randomBytes } from "crypto";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import { transliterate } from "./slug";
import { isUpcoming, type CityEvent, type EventKind, EVENT_KINDS } from "./events";
import { notifyAdmin } from "./telegram";
import IMPORT from "@/data/events-import.json";

type L = { events?: CityEvent[] };
const KINDS = new Set<string>(EVENT_KINDS.map((k) => k.id));

function slugFor(title: string, startsAt: string) {
  const base = transliterate(title).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "event";
  return `${base}-${startsAt.slice(0, 10)}-${randomBytes(2).toString("hex")}`;
}

/** Будущие и идущие события (прошедшие — в архиве: просто не показываются). */
export async function upcomingEvents(opts: { city?: string | null; kind?: string | null; from?: Date; to?: Date } = {}): Promise<CityEvent[]> {
  const sinceIso = new Date(Date.now() - 7 * 86400000).toISOString(); // с запасом: многодневные выставки
  let list: CityEvent[] = [];
  const sb = supabase();
  if (sb) {
    let q = sb.from("events").select("*").eq("status", "published").gte("starts_at", opts.from ? new Date(opts.from.getTime() - 60 * 86400000).toISOString() : sinceIso).order("starts_at").limit(500);
    if (opts.city) q = q.eq("city", opts.city);
    if (opts.kind) q = q.eq("kind", opts.kind);
    const r = await q;
    if (r.error) return [];
    list = r.data as CityEvent[];
  } else if (dbMode() === "local") {
    list = (((await readLocal()) as unknown as L).events ?? []).filter((e) => e.status === "published" && (!opts.city || e.city === opts.city) && (!opts.kind || e.kind === opts.kind));
  }
  const now = Date.now();
  return list
    .filter((e) => isUpcoming(e, now))
    .filter((e) => !opts.to || new Date(e.starts_at) <= opts.to)
    .filter((e) => !opts.from || (e.ends_at ? new Date(e.ends_at) : new Date(e.starts_at)) >= opts.from)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export async function getEvent(slug: string): Promise<CityEvent | null> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("events").select("*").eq("slug", slug).maybeSingle();
    return (r.data as CityEvent) ?? null;
  }
  return (((await readLocal()) as unknown as L).events ?? []).find((e) => e.slug === slug) ?? null;
}

export type NewEvent = Omit<CityEvent, "id" | "slug" | "created_at" | "updated_at">;

export async function createEvent(e: NewEvent): Promise<CityEvent> {
  const now = new Date().toISOString();
  const row = { ...e, kind: (KINDS.has(e.kind) ? e.kind : "other") as EventKind, slug: slugFor(e.title, e.starts_at), created_at: now, updated_at: now };
  const sb = supabase();
  if (sb) {
    const r = await sb.from("events").insert(row).select("*").single();
    if (r.error) throw new Error(r.error.message);
    return r.data as CityEvent;
  }
  const d = (await readLocal()) as unknown as L;
  const full = { ...row, id: randomBytes(8).toString("hex") } as CityEvent;
  d.events = [...(d.events ?? []), full];
  await writeLocal(d as never);
  return full;
}

/** Мероприятия специалиста: на проверке и будущие (для кабинета и анкеты). */
export async function eventsOfMaster(masterId: string, onlyPublished = false): Promise<CityEvent[]> {
  const sb = supabase();
  let list: CityEvent[] = [];
  if (sb) {
    const r = await sb.from("events").select("*").eq("master_id", masterId).gte("starts_at", new Date(Date.now() - 60 * 86400000).toISOString()).order("starts_at").limit(50);
    if (r.error) return [];
    list = r.data as CityEvent[];
  } else list = (((await readLocal()) as unknown as L).events ?? []).filter((e) => e.master_id === masterId);
  return list.filter((e) => isUpcoming(e) && e.status !== "rejected" && (!onlyPublished || e.status === "published")).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

/** Специалист снимает своё мероприятие. */
export async function removeEventOfMaster(masterId: string, id: string) {
  const sb = supabase();
  if (sb) {
    await sb.from("events").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", id).eq("master_id", masterId);
    return;
  }
  const d = (await readLocal()) as unknown as L;
  d.events = (d.events ?? []).map((e) => (e.id === id && e.master_id === masterId ? { ...e, status: "rejected" } : e));
  await writeLocal(d as never);
}

export async function setEventStatus(id: string, status: CityEvent["status"]) {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("events").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (r.error) throw new Error(r.error.message);
    return;
  }
  const d = (await readLocal()) as unknown as L;
  d.events = (d.events ?? []).map((e) => (e.id === id ? { ...e, status } : e));
  await writeLocal(d as never);
}

/** Для админки: на проверке + ближайшие опубликованные. */
export async function adminEvents(): Promise<{ pending: CityEvent[]; published: CityEvent[] }> {
  const sb = supabase();
  let all: CityEvent[] = [];
  if (sb) {
    const r = await sb.from("events").select("*").gte("starts_at", new Date(Date.now() - 2 * 86400000).toISOString()).order("starts_at").limit(400);
    all = (r.data as CityEvent[]) ?? [];
  } else all = ((await readLocal()) as unknown as L).events ?? [];
  return { pending: all.filter((e) => e.status === "pending"), published: all.filter((e) => e.status === "published" && isUpcoming(e)) };
}

/*
 * Импорт: задача по расписанию коммитит пачки в data/events-import.json, ежедневный cron добавляет новые
 * (повтор по ссылке-источнику не создаётся, прошедшие пропускаются).
 */
type ImportEvent = { title: string; city: string; kind?: string; starts_at: string; ends_at?: string | null; venue?: string; address?: string; price?: string; url?: string; image?: string; description?: string; source: string };
export async function applyEventsImport(): Promise<{ added: number; skipped: number; images?: number }> {
  const out: { added: number; skipped: number; images?: number } = { added: 0, skipped: 0 };
  const sb = supabase();
  if (!sb) return out;
  const now = Date.now();
  const added: string[] = [];
  for (const b of (IMPORT as { batches: { id: string; events: ImportEvent[] }[] }).batches ?? []) {
    for (const e of b.events ?? []) {
      if (!e?.title || !e.source || !e.starts_at || Number.isNaN(Date.parse(e.starts_at))) continue;
      if (!isUpcoming({ starts_at: e.starts_at, ends_at: e.ends_at ?? null }, now)) {
        out.skipped++;
        continue;
      }
      const ex = await sb.from("events").select("id, image").eq("source", e.source).maybeSingle();
      if (ex.error) return out; // миграция 0049 ещё не выполнена
      if (ex.data) {
        // событие уже есть — дозаполняем афишу, если её не было
        const img = e.image && /^https:\/\//.test(e.image) ? e.image : null;
        if (img && !(ex.data as { image: string | null }).image) {
          await sb.from("events").update({ image: img, updated_at: new Date().toISOString() }).eq("id", (ex.data as { id: string }).id);
          out.images = (out.images ?? 0) + 1;
        } else out.skipped++;
        continue;
      }
      try {
        await createEvent({
          title: e.title.slice(0, 160),
          city: e.city || "batumi",
          kind: (KINDS.has(e.kind ?? "") ? e.kind : "other") as EventKind,
          starts_at: new Date(e.starts_at).toISOString(),
          ends_at: e.ends_at ? new Date(e.ends_at).toISOString() : null,
          venue: e.venue?.slice(0, 120) || null,
          address: e.address?.slice(0, 200) || null,
          price: e.price?.slice(0, 80) || null,
          url: e.url || null,
          image: e.image && /^https:\/\//.test(e.image) ? e.image : null,
          description: e.description?.slice(0, 1500) || null,
          source: e.source,
          status: "published",
          contact: null,
          master_id: null,
        });
        out.added++;
        added.push(e.title);
      } catch {
        out.skipped++;
      }
    }
  }
  if (added.length) await notifyAdmin(`🎟 В афишу добавлено событий: ${added.length}`).catch(() => null);
  return out;
}
