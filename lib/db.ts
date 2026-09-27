import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { makeSlug } from "./slug";
import type {
  ClientRequest,
  Master,
  MasterContacts,
  MasterStatus,
  NewMaster,
  NewRequest,
  PublicMaster,
  RequestStatus,
} from "./types";

/*
 * Вся работа с базой — только здесь и только на сервере.
 *
 * Два режима:
 *  1. Supabase — когда заданы SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY (боевой сайт).
 *  2. Локальный файл .data/db.json — только для проверки на своём компьютере,
 *     когда Supabase ещё не подключён. На боевом сервере этот режим выключен.
 */

export class DbNotConfiguredError extends Error {
  constructor() {
    super("База данных не подключена: задайте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY");
  }
}

let client: SupabaseClient | null = null;

/**
 * Приводит адрес Supabase к правильному виду, даже если при копировании
 * попали пробелы, переносы строк, кавычки или хвост /rest/v1/.
 */
export function cleanSupabaseUrl(raw: string | undefined): string {
  let u = (raw ?? "").replace(/[\s"'`«»]/g, "");
  u = u.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
}

export function cleanKey(raw: string | undefined): string {
  return (raw ?? "").replace(/[\s"'`«»]/g, "");
}

function supabase(): SupabaseClient | null {
  const url = cleanSupabaseUrl(process.env.SUPABASE_URL);
  const key = cleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

/** Проверка подключения для страницы /api/health — без раскрытия секретов. */
export async function healthCheck() {
  const rawUrl = process.env.SUPABASE_URL ?? "";
  const url = cleanSupabaseUrl(rawUrl);
  const key = cleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  // eslint-disable-next-line no-control-regex
  const nonAscii = [...url].filter((c) => /[^\x00-\x7F]/.test(c));
  let validUrl = false;
  try {
    validUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) && !!new URL(url);
  } catch {}
  const keyType = key.startsWith("sb_secret_")
    ? "secret (sb_secret_…) — подходит"
    : key.startsWith("sb_publishable_")
      ? "publishable — НЕ ТОТ ключ, нужен secret"
      : key.startsWith("eyJ")
        ? "legacy JWT (service_role или anon)"
        : key
          ? "неизвестный формат"
          : "не задан";
  let db = "не проверялась";
  if (validUrl && key) {
    try {
      const sb = createClient(url, key, { auth: { persistSession: false } });
      const { error } = await sb.from("masters").select("id").limit(1);
      db = error ? "ошибка: " + error.message : "ok — таблицы найдены";
    } catch (e) {
      db = "ошибка: " + (e instanceof Error ? e.message : String(e));
    }
  }
  return {
    SUPABASE_URL: {
      задан: !!rawUrl,
      после_очистки: validUrl ? url : "(скрыто, неверный формат)",
      формат_верный: validUrl,
      русские_или_особые_символы: nonAscii.length ? nonAscii.join(" ") : "нет",
    },
    SUPABASE_SERVICE_ROLE_KEY: { задан: !!key, длина: key.length, тип: keyType },
    ADMIN_PASSWORD_задан: (process.env.ADMIN_PASSWORD ?? "").length >= 8,
    база: db,
  };
}

export function dbMode(): "supabase" | "local" | "none" {
  if (supabase()) return "supabase";
  if (process.env.NODE_ENV !== "production" || process.env.LOCAL_DB === "1") return "local";
  return "none";
}

/* ---------- локальный режим (только для разработки) ---------- */

type LocalData = { masters: Master[]; requests: ClientRequest[]; contact_views: { master_id: string; visitor: string; created_at: string }[] };
const LOCAL_FILE = path.join(process.cwd(), ".data", "db.json");

async function readLocal(): Promise<LocalData> {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
  } catch {
    return { masters: [], requests: [], contact_views: [] };
  }
}
async function writeLocal(d: LocalData) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(d, null, 2));
}

/* ---------- общие помощники ---------- */

function toPublic(m: Master): PublicMaster {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { phone, telegram, whatsapp, admin_note, consent_at, status, ...rest } = m;
  return rest;
}

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

const PUBLIC_COLUMNS =
  "id,slug,name,category,services,about,credentials,experience_years,languages,price_from,price_unit,photo_url,created_at,updated_at";

/* ---------- мастера: публичная часть ---------- */

export async function listPublishedMasters(): Promise<PublicMaster[]> {
  const sb = supabase();
  if (sb) {
    const rows = check(
      await sb.from("masters").select(PUBLIC_COLUMNS).eq("status", "published").order("created_at", { ascending: false }),
    );
    return rows as unknown as PublicMaster[];
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  return d.masters
    .filter((m) => m.status === "published")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(toPublic);
}

export async function getPublishedMasterBySlug(slug: string): Promise<PublicMaster | null> {
  const sb = supabase();
  if (sb) {
    const row = check(
      await sb.from("masters").select(PUBLIC_COLUMNS).eq("slug", slug).eq("status", "published").maybeSingle(),
    );
    return (row as unknown as PublicMaster) ?? null;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const m = (await readLocal()).masters.find((x) => x.slug === slug && x.status === "published");
  return m ? toPublic(m) : null;
}

/** Отдаёт контакты опубликованного мастера и записывает факт просмотра. */
export async function revealContacts(masterId: string, visitor: string): Promise<(MasterContacts & { name: string; slug: string }) | null> {
  const sb = supabase();
  if (sb) {
    const m = check(
      await sb
        .from("masters")
        .select("id,name,slug,phone,telegram,whatsapp")
        .eq("id", masterId)
        .eq("status", "published")
        .maybeSingle(),
    ) as { id: string; name: string; slug: string; phone: string; telegram: string | null; whatsapp: boolean } | null;
    if (!m) return null;
    // Один посетитель = один просмотр в сутки, чтобы счётчик был честным.
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const recent = check(
      await sb.from("contact_views").select("id").eq("master_id", masterId).eq("visitor", visitor).gte("created_at", since).limit(1),
    ) as unknown[];
    if (recent.length === 0) check(await sb.from("contact_views").insert({ master_id: masterId, visitor }));
    return { phone: m.phone, telegram: m.telegram, whatsapp: m.whatsapp, name: m.name, slug: m.slug };
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const m = d.masters.find((x) => x.id === masterId && x.status === "published");
  if (!m) return null;
  const since = Date.now() - 24 * 3600 * 1000;
  if (!d.contact_views.some((v) => v.master_id === masterId && v.visitor === visitor && Date.parse(v.created_at) > since)) {
    d.contact_views.push({ master_id: masterId, visitor, created_at: new Date().toISOString() });
    await writeLocal(d);
  }
  return { phone: m.phone, telegram: m.telegram, whatsapp: m.whatsapp, name: m.name, slug: m.slug };
}

/* ---------- создание записей из форм ---------- */

export async function createMaster(input: NewMaster): Promise<Master> {
  const row = { ...input, slug: makeSlug(input.name, input.category), admin_note: input.admin_note ?? "" };
  const sb = supabase();
  if (sb) return check(await sb.from("masters").insert(row).select("*").single()) as Master;
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const now = new Date().toISOString();
  const m: Master = { ...row, id: randomUUID(), created_at: now, updated_at: now };
  d.masters.push(m);
  await writeLocal(d);
  return m;
}

export async function createRequest(input: NewRequest): Promise<ClientRequest> {
  const sb = supabase();
  if (sb) return check(await sb.from("requests").insert(input).select("*").single()) as ClientRequest;
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const r: ClientRequest = { ...input, id: randomUUID(), status: "new", admin_note: "", created_at: new Date().toISOString() };
  d.requests.push(r);
  await writeLocal(d);
  return r;
}

/* ---------- админка ---------- */

export async function adminListMasters(): Promise<Master[]> {
  const sb = supabase();
  if (sb) return check(await sb.from("masters").select("*").order("created_at", { ascending: false })) as Master[];
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).masters.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function adminGetMaster(id: string): Promise<Master | null> {
  const sb = supabase();
  if (sb) return (check(await sb.from("masters").select("*").eq("id", id).maybeSingle()) as Master) ?? null;
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).masters.find((m) => m.id === id) ?? null;
}

export async function adminGetMasterSlug(id: string): Promise<string | null> {
  return (await adminGetMaster(id))?.slug ?? null;
}

export async function adminUpdateMaster(id: string, patch: Partial<Omit<Master, "id" | "created_at">>): Promise<void> {
  const sb = supabase();
  if (sb) {
    check(await sb.from("masters").update(patch).eq("id", id));
    return;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const i = d.masters.findIndex((m) => m.id === id);
  if (i >= 0) d.masters[i] = { ...d.masters[i], ...patch, updated_at: new Date().toISOString() };
  await writeLocal(d);
}

export async function adminSetMasterStatus(id: string, status: MasterStatus) {
  await adminUpdateMaster(id, { status });
}

export async function adminDeleteMaster(id: string) {
  const sb = supabase();
  if (sb) {
    check(await sb.from("masters").delete().eq("id", id));
    return;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  d.masters = d.masters.filter((m) => m.id !== id);
  d.contact_views = d.contact_views.filter((v) => v.master_id !== id);
  d.requests = d.requests.map((r) => (r.master_id === id ? { ...r, master_id: null } : r));
  await writeLocal(d);
}

export async function adminListRequests(): Promise<ClientRequest[]> {
  const sb = supabase();
  if (sb) return check(await sb.from("requests").select("*").order("created_at", { ascending: false }).limit(300)) as ClientRequest[];
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).requests.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function adminSetRequestStatus(id: string, status: RequestStatus) {
  const sb = supabase();
  if (sb) {
    check(await sb.from("requests").update({ status }).eq("id", id));
    return;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const r = d.requests.find((x) => x.id === id);
  if (r) r.status = status;
  await writeLocal(d);
}

/** Сколько раз открывали контакты каждого мастера с начала текущего месяца. */
export async function adminContactViewsThisMonth(): Promise<Record<string, number>> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const counts: Record<string, number> = {};
  const sb = supabase();
  let rows: { master_id: string }[];
  if (sb) {
    rows = check(await sb.from("contact_views").select("master_id").gte("created_at", start.toISOString()).limit(10000)) as {
      master_id: string;
    }[];
  } else {
    if (dbMode() === "none") throw new DbNotConfiguredError();
    rows = (await readLocal()).contact_views.filter((v) => Date.parse(v.created_at) >= start.getTime());
  }
  for (const r of rows) counts[r.master_id] = (counts[r.master_id] ?? 0) + 1;
  return counts;
}
