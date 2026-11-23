import "server-only";
import { randomUUID } from "crypto";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import type { DevProject, DevUnit } from "./dev-projects";

/* ЖК и квартиры из кабинета застройщика (таблицы dev_projects и dev_units, миграция 0060). */
type L = { dev_projects?: DevProject[]; dev_units?: DevUnit[] };
const local = async () => (dbMode() === "none" ? ({} as L) : ((await readLocal()) as unknown as L));
const save = async (d: L) => writeLocal(d as never);

const norm = (d: DevProject): DevProject => ({
  ...d,
  amenities: d.amenities ?? [],
  payment: d.payment ?? [],
  photos: Array.isArray(d.photos) ? d.photos : [],
  progress: Array.isArray(d.progress) ? d.progress : [],
});

export async function getDevProject(id: string): Promise<DevProject | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const sb = supabase();
  if (sb) {
    const r = await sb.from("dev_projects").select("*").eq("id", id).maybeSingle();
    return r.error || !r.data ? null : norm(r.data as DevProject);
  }
  const x = ((await local()).dev_projects ?? []).find((d) => d.id === id);
  return x ? norm(x) : null;
}

export async function devProjectsOfOwner(chatId: number): Promise<DevProject[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("dev_projects").select("*").eq("owner_chat_id", chatId).order("created_at", { ascending: false });
    return r.error ? [] : (r.data as DevProject[]).map(norm);
  }
  return ((await local()).dev_projects ?? []).filter((d) => d.owner_chat_id === chatId).map(norm);
}

export async function devProjectsOfMaster(masterId: string): Promise<DevProject[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("dev_projects").select("*").eq("master_id", masterId).order("created_at", { ascending: false });
    return r.error ? [] : (r.data as DevProject[]).map(norm);
  }
  return ((await local()).dev_projects ?? []).filter((d) => d.master_id === masterId).map(norm);
}

/** Опубликованные ЖК застройщиков (кэш 60 с — страницы каталога открываются часто). */
let pubCache: { at: number; v: DevProject[] } | null = null;
export async function publishedDevProjects(): Promise<DevProject[]> {
  if (pubCache && Date.now() - pubCache.at < 60_000) return pubCache.v;
  const sb = supabase();
  let v: DevProject[] = [];
  if (sb) {
    const r = await sb.from("dev_projects").select("*").eq("mod_status", "published");
    v = r.error ? [] : (r.data as DevProject[]).map(norm);
  } else v = ((await local()).dev_projects ?? []).filter((d) => d.mod_status === "published").map(norm);
  pubCache = { at: Date.now(), v };
  return v;
}

export async function adminDevProjects(): Promise<DevProject[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("dev_projects").select("*").order("updated_at", { ascending: false }).limit(300);
    return r.error ? [] : (r.data as DevProject[]).map(norm);
  }
  return ((await local()).dev_projects ?? []).map(norm);
}

export async function slugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("dev_projects").select("id").eq("slug", slug).limit(1);
    return !!r.data?.some((x: { id: string }) => x.id !== exceptId);
  }
  return ((await local()).dev_projects ?? []).some((d) => d.slug === slug && d.id !== exceptId);
}

export async function createDevProject(data: Omit<DevProject, "id" | "created_at" | "updated_at">): Promise<DevProject> {
  const now = new Date().toISOString();
  const row: DevProject = { ...data, id: randomUUID(), created_at: now, updated_at: now };
  const sb = supabase();
  pubCache = null;
  if (sb) {
    const r = await sb.from("dev_projects").insert(row).select("*").single();
    if (r.error) throw new Error(r.error.message);
    return norm(r.data as DevProject);
  }
  const d = await local();
  d.dev_projects = [row, ...(d.dev_projects ?? [])];
  await save(d);
  return row;
}

export async function updateDevProject(id: string, patch: Partial<DevProject>): Promise<void> {
  const p = { ...patch, updated_at: new Date().toISOString() };
  delete (p as Partial<DevProject>).id;
  pubCache = null;
  const sb = supabase();
  if (sb) {
    const r = await sb.from("dev_projects").update(p).eq("id", id);
    if (r.error) throw new Error(r.error.message);
    return;
  }
  const d = await local();
  d.dev_projects = (d.dev_projects ?? []).map((x) => (x.id === id ? { ...x, ...p } : x));
  await save(d);
}

export async function deleteDevProject(id: string): Promise<void> {
  pubCache = null;
  const sb = supabase();
  if (sb) {
    await sb.from("dev_projects").delete().eq("id", id);
    return;
  }
  const d = await local();
  d.dev_projects = (d.dev_projects ?? []).filter((x) => x.id !== id);
  d.dev_units = (d.dev_units ?? []).filter((u) => u.project_id !== id);
  await save(d);
}

export async function unitsOf(projectId: string): Promise<DevUnit[]> {
  const sb = supabase();
  let v: DevUnit[];
  if (sb) {
    const all: DevUnit[] = [];
    for (let from = 0; from < 5000; from += 1000) {
      const r = await sb.from("dev_units").select("*").eq("project_id", projectId).range(from, from + 999);
      if (r.error) break;
      all.push(...(r.data as DevUnit[]));
      if ((r.data ?? []).length < 1000) break;
    }
    v = all;
  } else v = ((await local()).dev_units ?? []).filter((u) => u.project_id === projectId);
  return v.map((u) => ({ ...u, area: u.area == null ? null : Number(u.area), price: u.price == null ? null : Number(u.price) })).sort(
    (a, b) => a.building.localeCompare(b.building) || (b.floor ?? 0) - (a.floor ?? 0) || a.number.localeCompare(b.number, "ru", { numeric: true }),
  );
}

/**
 * Сохранить квартиры ЖК целиком: новые добавляются, изменённые обновляются, убранные из списка удаляются.
 * (Застройщик редактирует таблицу и сохраняет её разом.)
 */
export async function saveUnits(projectId: string, units: (Omit<DevUnit, "id" | "project_id" | "updated_at"> & { id?: string })[]): Promise<number> {
  const now = new Date().toISOString();
  const rows: DevUnit[] = units.map((u) => ({ ...u, id: u.id && /^[0-9a-f-]{36}$/.test(u.id) ? u.id : randomUUID(), project_id: projectId, updated_at: now }));
  pubCache = null;
  const sb = supabase();
  if (sb) {
    const prev = await unitsOf(projectId);
    const keep = new Set(rows.map((r) => r.id));
    const gone = prev.filter((u) => !keep.has(u.id)).map((u) => u.id);
    for (let i = 0; i < gone.length; i += 200) await sb.from("dev_units").delete().in("id", gone.slice(i, i + 200));
    for (let i = 0; i < rows.length; i += 500) {
      const r = await sb.from("dev_units").upsert(rows.slice(i, i + 500), { onConflict: "id" });
      if (r.error) throw new Error(r.error.message);
    }
    return rows.length;
  }
  const d = await local();
  d.dev_units = [...(d.dev_units ?? []).filter((u) => u.project_id !== projectId), ...rows];
  await save(d);
  return rows.length;
}

/** Быстро поменять статус одной квартиры (свободна / бронь / продана). */
export async function setUnitStatus(projectId: string, unitId: string, status: DevUnit["status"]): Promise<void> {
  const sb = supabase();
  if (sb) {
    await sb.from("dev_units").update({ status, updated_at: new Date().toISOString() }).eq("id", unitId).eq("project_id", projectId);
    return;
  }
  const d = await local();
  d.dev_units = (d.dev_units ?? []).map((u) => (u.id === unitId && u.project_id === projectId ? { ...u, status } : u));
  await save(d);
}
