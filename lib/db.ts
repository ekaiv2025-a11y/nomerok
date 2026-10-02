import { cleanSlots, type Slot } from "./slots";
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes, randomUUID } from "crypto";
import { makeSlug } from "./slug";
import { isAwayNow, servesCategory } from "./availability";
import { DEMO_MASTERS, DEMO_PREFIX, DEMO_UNTIL, demoPublicMasters, isDemoSlug } from "./demo";
import type {
  ClientRequest,
  Master,
  MasterContacts,
  MasterStatus,
  NewMaster,
  NewRequest,
  PublicMaster,
  RequestResponse,
  RequestStatus,
  Review,
  Complaint,
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

export function supabase(): SupabaseClient | null {
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
  let migrations: Record<string, string> | null = null;
  if (validUrl && key) {
    try {
      const sb = createClient(url, key, { auth: { persistSession: false } });
      const { error } = await sb.from("masters").select("id").limit(1);
      db = error ? "ошибка: " + error.message : "ok — таблицы найдены";
      if (!error) {
        // Какие обновления базы выполнены (проверяем по одной колонке/таблице из каждого)
        const probes: [string, string, string][] = [
          ["0002 Telegram", "masters", "tg_chat_id"],
          ["0003 отзывы и жалобы", "reviews", "id"],
          ["0004 пауза и направления", "masters", "is_away"],
          ["0005 активность и архив", "masters", "archived_at"],
          ["0006 фото работ и карта", "masters", "portfolio"],
          ["0007 документы", "masters", "documents"],
          ["0008 просмотры профилей", "profile_views", "id"],
          ["0009 города", "masters", "city"],
          ["0010 соцсети", "masters", "links"],
          ["0011 приглашения", "outreach", "tg_user_id"],
          ["0012 другой номер в Telegram", "masters", "tg_verified_at"],
          ["0013 избранное клиентов", "client_favs", "slug"],
          ["0014 заявки по подписке", "_nm_once", "key"],
          ["0015 короткие ссылки", "masters", "short"],
          ["0016 фото в заявке", "requests", "photos"],
          ["0017 свободные окна", "masters", "slots"],
        ];
        const res: Record<string, string> = {};
        for (const [name, table, col] of probes) {
          const r = await sb.from(table).select(col).limit(1);
          res[name] = r.error ? "НЕ выполнено" : "✓";
        }
        migrations = res;
      }
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
    обновления_базы: migrations,
    автообновление_базы: (process.env.DATABASE_URL ?? "").length > 10 ? "включено (DATABASE_URL задан)" : "выключено (DATABASE_URL не задан)",
  };
}

export function dbMode(): "supabase" | "local" | "none" {
  if (supabase()) return "supabase";
  if (process.env.NODE_ENV !== "production" || process.env.LOCAL_DB === "1") return "local";
  return "none";
}

/* ---------- локальный режим (только для разработки) ---------- */

type LocalData = {
  masters: Master[];
  requests: ClientRequest[];
  contact_views: { master_id: string; visitor: string; created_at: string }[];
  responses: RequestResponse[];
  login_tokens: { token: string; master_id: string; expires_at: string }[];
  reviews: Review[];
  complaints: Complaint[];
  profile_views: { master_id: string; visitor: string; day: string; created_at: string }[];
  outreach?: { tg_user_id: string; name: string; category: string; status: string; created_at: string }[];
};
const LOCAL_FILE = path.join(process.cwd(), ".data", "db.json");

export async function readLocal(): Promise<LocalData> {
  try {
    const d = JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
    return { masters: [], requests: [], contact_views: [], responses: [], login_tokens: [], reviews: [], complaints: [], profile_views: [], ...d };
  } catch {
    return { masters: [], requests: [], contact_views: [], responses: [], login_tokens: [], reviews: [], complaints: [], profile_views: [] };
  }
}
export async function writeLocal(d: LocalData & Record<string, unknown>) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(d, null, 2));
}

/* ---------- общие помощники ---------- */

type PublicRow = Omit<
  PublicMaster,
  "verified" | "has_tg" | "away" | "extra_categories" | "away_until" | "portfolio" | "work_mode" | "place_address" | "place_lat" | "place_lng" | "service_area" | "work_hours"
> &
  Partial<Pick<Master, "portfolio" | "work_mode" | "place_address" | "place_lat" | "place_lng" | "service_area" | "work_hours" | "documents">> & {
  phone_verified_at: string | null;
  extra_categories?: string[] | null;
  is_away?: boolean | null;
  away_until?: string | null;
  archived_at?: string | null;
};

/** «Telegram-канал», совпадающий с личным ником, — это не канал, а тот же контакт: не показываем дважды. */
function withoutPersonalTg(links: Master["links"], personal: string | null | undefined): Master["links"] {
  const ch = links?.tg_channel;
  if (!ch || !personal) return links;
  const handle = ch.replace(/^https?:\/\/(www\.)?(t|telegram)\.me\//i, "").replace(/[/?#].*$/, "").replace(/^@/, "").toLowerCase();
  if (handle !== personal.replace(/^@/, "").toLowerCase()) return links;
  const rest = { ...links };
  delete rest.tg_channel;
  return rest;
}

/** «На связи»: специалист заходил в кабинет или писал боту сегодня / на этой неделе. */
function activeLevel(at: string | null | undefined): "today" | "week" | null {
  if (!at) return null;
  const h = (Date.now() - Date.parse(at)) / 3600000;
  return h < 24 ? "today" : h < 24 * 7 ? "week" : null;
}

/** Сколько дней назад специалист заходил (0 — сегодня по Тбилиси); дольше месяца — не показываем. */
function seenDays(at: string | null | undefined): number | null {
  if (!at) return null;
  const day = (t: number) => Math.floor((t + 4 * 3600000) / 86400000);
  const d = day(Date.now()) - day(Date.parse(at));
  return d >= 0 && d <= 30 ? d : null;
}

function toPublic(m: Master | PublicRow): PublicMaster {
  return {
    id: m.id,
    slug: m.slug,
    name: m.name,
    category: m.category,
    services: m.services,
    about: m.about,
    credentials: m.credentials,
    experience_years: m.experience_years,
    languages: m.languages,
    price_from: m.price_from,
    price_unit: m.price_unit,
    photo_url: m.photo_url,
    created_at: m.created_at,
    updated_at: m.updated_at,
    extra_categories: m.extra_categories ?? [],
    away_until: m.away_until ?? null,
    portfolio: Array.isArray(m.portfolio) ? m.portfolio : [],
    work_mode: m.work_mode ?? "at_client",
    place_address: m.place_address ?? "",
    place_lat: m.place_lat ?? null,
    place_lng: m.place_lng ?? null,
    service_area: m.service_area ?? "",
    work_hours: m.work_hours ?? "",
    city: m.city ?? "batumi",
    links: withoutPersonalTg(m.links && typeof m.links === "object" ? m.links : {}, (m as { telegram?: string | null }).telegram),
    has_tg: !!(m as { telegram?: string | null }).telegram,
    active: activeLevel((m as { last_active_at?: string | null }).last_active_at),
    seen_days: seenDays((m as { last_active_at?: string | null }).last_active_at),
    slots: cleanSlots((m as { slots?: unknown }).slots),
    short: (m as { short?: string | null }).short ?? null,
    docs_verified: Array.isArray(m.documents) && m.documents.some((d) => d.public && d.status !== "rejected"),
    away: isAwayNow(m),
    verified: !!m.phone_verified_at,
    demo: isDemoSlug(m.slug),
    rating: null,
    reviews: 0,
  };
}

export function newToken(): string {
  return randomBytes(12).toString("hex");
}

export function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

const BASE_COLUMNS =
  "id,slug,name,category,services,about,credentials,experience_years,languages,price_from,price_unit,photo_url,phone_verified_at,created_at,updated_at,telegram";
const COLUMNS_0004 = BASE_COLUMNS + ",extra_categories,is_away,away_until";
const COLUMNS_0005 = COLUMNS_0004 + ",archived_at,last_active_at";
const COLUMNS_0006 = COLUMNS_0005 + ",portfolio,work_mode,place_address,place_lat,place_lng,service_area,work_hours";
const COLUMNS_0007 = COLUMNS_0006 + ",documents";
const COLUMNS_0009 = COLUMNS_0007 + ",city";
const PUBLIC_COLUMNS = COLUMNS_0009 + ",links";
/** Наборы колонок от новых к старым: если какую-то миграцию ещё не выполнили, сайт не падает. */
const COLUMNS_0017 = PUBLIC_COLUMNS + ",short,slots";
const COLUMN_SETS = [COLUMNS_0017, PUBLIC_COLUMNS, COLUMNS_0009, COLUMNS_0007, COLUMNS_0006, COLUMNS_0005, COLUMNS_0004, BASE_COLUMNS];

/** Если миграция 0004 ещё не выполнена — читаем без новых колонок, чтобы сайт не падал. */
function isMissingColumn(err: { message: string } | null): boolean {
  return !!err && /column .* does not exist|could not find .* column/i.test(err.message);
}

/* ---------- мастера: публичная часть ---------- */

/** Каталог: настоящие специалисты + примеры, пока настоящих мало. */
export async function listPublishedMasters(): Promise<PublicMaster[]> {
  // Кто на паузе (в отпуске) — в каталоге не показываем
  const real = (await withRatings(await listPublishedFromDb())).filter((m) => !m.away);
  if (real.filter((m) => !m.demo).length >= DEMO_UNTIL) return real.filter((m) => !m.demo);
  const have = new Set(real.map((m) => m.slug));
  return [...real, ...demoPublicMasters().filter((m) => !have.has(m.slug))];
}

async function listPublishedFromDb(): Promise<PublicMaster[]> {
  const sb = supabase();
  if (sb) {
    const q = (cols: string) => sb.from("masters").select(cols).eq("status", "published").order("created_at", { ascending: false });
    let res = await q(COLUMN_SETS[0]);
    for (const cols of COLUMN_SETS.slice(1)) if (isMissingColumn(res.error)) res = await q(cols);
    return (check(res) as unknown as PublicRow[]).filter((m) => !m.archived_at).map(toPublic);
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  return d.masters
    .filter((m) => m.status === "published" && !m.archived_at)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(toPublic);
}

export async function getPublishedMasterBySlug(slug: string): Promise<PublicMaster | null> {
  if (isDemoSlug(slug)) return (await listPublishedMasters()).find((m) => m.slug === slug) ?? null;
  const m = await getPublishedFromDb(slug);
  return m ? (await withRatings([m]))[0] : null;
}

/** Средняя оценка и число опубликованных отзывов. Если таблицы отзывов ещё нет — просто без оценок. */
async function withRatings(list: PublicMaster[]): Promise<PublicMaster[]> {
  const { reviewStats } = await import("./reviews-db");
  const stats = await reviewStats().catch(() => new Map<string, { sum: number; n: number }>());
  return list.map((m) => {
    const st = stats.get(m.id);
    return st ? { ...m, rating: Math.round((st.sum / st.n) * 10) / 10, reviews: st.n } : m;
  });
}

async function getPublishedFromDb(slug: string): Promise<PublicMaster | null> {
  const sb = supabase();
  if (sb) {
    const q = (cols: string) => sb.from("masters").select(cols).eq("slug", slug).eq("status", "published").maybeSingle();
    let res = await q(COLUMN_SETS[0]);
    for (const cols of COLUMN_SETS.slice(1)) if (isMissingColumn(res.error)) res = await q(cols);
    const row = check(res) as unknown as PublicRow | null;
    return row && !row.archived_at ? toPublic(row) : null;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const m = (await readLocal()).masters.find((x) => x.slug === slug && x.status === "published" && !x.archived_at);
  return m ? toPublic(m) : null;
}

/** Отдаёт контакты опубликованного мастера и записывает факт просмотра. */
export async function revealContacts(masterId: string, visitor: string): Promise<(MasterContacts & { name: string; slug: string; instagram: string | null }) | null> {
  if (isDemoSlug(masterId)) return null;
  const probe = await adminGetMaster(masterId);
  if (!probe || isDemoSlug(probe.slug) || probe.archived_at || isAwayNow(probe)) return null;
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
    return { phone: m.phone, telegram: m.telegram, whatsapp: m.whatsapp, name: m.name, slug: m.slug, instagram: probe.links?.instagram ?? null };
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
  return { phone: m.phone, telegram: m.telegram, whatsapp: m.whatsapp, name: m.name, slug: m.slug, instagram: m.links?.instagram ?? null };
}

/* ---------- создание записей из форм ---------- */

export async function createMaster(input: NewMaster): Promise<Master> {
  const row = {
    ...input,
    lang: input.lang ?? "ru",
    slug: makeSlug(input.name, input.category),
    admin_note: input.admin_note ?? "",
    tg_link_token: newToken(),
  };
  const sb = supabase();
  if (sb) return check(await sb.from("masters").insert(row).select("*").single()) as Master;
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const now = new Date().toISOString();
  const m: Master = {
    ...row,
    tg_chat_id: null,
    tg_username: null,
    phone_verified_at: null,
    notify_requests: false,
    extra_categories: [],
    is_away: false,
    away_until: null,
    last_active_at: now,
    inactive_warned_at: null,
    archived_at: null,
    archived_reason: null,
    missed_direct: 0,
    portfolio: [],
    work_mode: "at_client",
    place_address: "",
    place_lat: null,
    place_lng: null,
    service_area: "",
    work_hours: "",
    city: "batumi",
    links: {},
    documents: [],
    stats_sent_at: null,
    id: randomUUID(),
    created_at: now,
    updated_at: now,
  };
  d.masters.push(m);
  await writeLocal(d);
  return m;
}

export async function createRequest(input: NewRequest): Promise<ClientRequest> {
  const row = { ...input, city: input.city ?? "batumi", lang: input.lang ?? "ru", client_link_token: newToken() };
  const sb = supabase();
  if (sb) {
    let res = await sb.from("requests").insert(row).select("*").single();
    // Миграция 0009 ещё не выполнена — сохраняем без города
    if (isMissingColumn(res.error)) {
      const { city: _c, ...noCity } = row; // eslint-disable-line @typescript-eslint/no-unused-vars
      res = await sb.from("requests").insert(noCity).select("*").single();
    }
    const saved = check(res) as ClientRequest;
    return { ...saved, city: saved.city ?? "batumi" };
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const r: ClientRequest = {
    ...row,
    id: randomUUID(),
    status: "new",
    admin_note: "",
    client_tg_chat_id: null,
    sent_count: 0,
    followup_at: null,
    outcome: null,
    outcome_master_id: null,
    outcome_at: null,
    review_invited_at: null,
    direct_checked_at: null,
    created_at: new Date().toISOString(),
  };
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

export async function adminDeleteRequest(id: string) {
  const sb = supabase();
  if (sb) {
    check(await sb.from("requests").delete().eq("id", id));
    return;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  d.requests = d.requests.filter((r) => r.id !== id);
  d.responses = d.responses.filter((r) => r.request_id !== id);
  await writeLocal(d);
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

/* ---------- Telegram, отклики, кабинет ---------- */

export async function getMasterByLinkToken(token: string): Promise<Master | null> {
  const sb = supabase();
  if (sb) return (check(await sb.from("masters").select("*").eq("tg_link_token", token).maybeSingle()) as Master) ?? null;
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).masters.find((m) => m.tg_link_token === token) ?? null;
}

export async function getMastersByChatId(chatId: number): Promise<Master[]> {
  const sb = supabase();
  if (sb) return check(await sb.from("masters").select("*").eq("tg_chat_id", chatId).order("created_at", { ascending: false })) as Master[];
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).masters.filter((m) => m.tg_chat_id === chatId);
}

/** Подтверждённые специалисты категории, которые принимают заявки. */
/** Заявки получают те, кто подтвердил номер — или подключил Telegram с другим номером (tg_verified_at). */
export function canGetRequests(m: Pick<Master, "phone_verified_at" | "tg_verified_at">): boolean {
  return !!(m.phone_verified_at || m.tg_verified_at);
}

export async function listMastersForRequests(category: string, city = "batumi"): Promise<Master[]> {
  const sb = supabase();
  let list: Master[];
  if (sb) {
    list = check(
      await sb
        .from("masters")
        .select("*")
        .eq("status", "published")
        .eq("notify_requests", true)
        .not("tg_chat_id", "is", null),
    ) as Master[];
    list = list.filter(canGetRequests);
  } else {
    if (dbMode() === "none") throw new DbNotConfiguredError();
    list = (await readLocal()).masters.filter((m) => m.status === "published" && m.notify_requests && m.tg_chat_id && canGetRequests(m));
  }
  // Основное или дополнительное направление; кто в отпуске — не получает
  return list.filter((m) => servesCategory(m, category) && (m.city ?? "batumi") === city && !isAwayNow(m) && !m.archived_at);
}

export async function getRequest(id: string): Promise<ClientRequest | null> {
  const sb = supabase();
  if (sb) return (check(await sb.from("requests").select("*").eq("id", id).maybeSingle()) as ClientRequest) ?? null;
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).requests.find((r) => r.id === id) ?? null;
}

export async function getRequestByLinkToken(token: string): Promise<ClientRequest | null> {
  const sb = supabase();
  if (sb) return (check(await sb.from("requests").select("*").eq("client_link_token", token).maybeSingle()) as ClientRequest) ?? null;
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).requests.find((r) => r.client_link_token === token) ?? null;
}

export async function updateRequest(id: string, patch: Partial<Omit<ClientRequest, "id" | "created_at">>): Promise<void> {
  const sb = supabase();
  if (sb) {
    check(await sb.from("requests").update(patch).eq("id", id));
    return;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const i = d.requests.findIndex((r) => r.id === id);
  if (i >= 0) d.requests[i] = { ...d.requests[i], ...patch };
  await writeLocal(d);
}

/** Записывает отклик специалиста. created=false — если он уже откликался. */
export async function addResponse(requestId: string, masterId: string): Promise<{ created: boolean; total: number }> {
  const sb = supabase();
  if (sb) {
    const ins = await sb.from("request_responses").insert({ request_id: requestId, master_id: masterId });
    const created = !ins.error;
    if (ins.error && !/duplicate|unique/i.test(ins.error.message)) throw new Error(ins.error.message);
    const { count } = await sb.from("request_responses").select("id", { count: "exact", head: true }).eq("request_id", requestId);
    return { created, total: count ?? 0 };
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const exists = d.responses.some((r) => r.request_id === requestId && r.master_id === masterId);
  if (!exists) d.responses.push({ id: d.responses.length + 1, request_id: requestId, master_id: masterId, created_at: new Date().toISOString() });
  await writeLocal(d);
  return { created: !exists, total: d.responses.filter((r) => r.request_id === requestId).length };
}

export async function hasResponse(requestId: string, masterId: string): Promise<boolean> {
  const sb = supabase();
  if (sb) {
    const rows = check(await sb.from("request_responses").select("id").eq("request_id", requestId).eq("master_id", masterId).limit(1)) as unknown[];
    return rows.length > 0;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).responses.some((r) => r.request_id === requestId && r.master_id === masterId);
}

export async function countResponses(requestId: string): Promise<number> {
  const sb = supabase();
  if (sb) {
    const { count } = await sb.from("request_responses").select("id", { count: "exact", head: true }).eq("request_id", requestId);
    return count ?? 0;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).responses.filter((r) => r.request_id === requestId).length;
}

/** Для админки: кто откликнулся на какие заявки. */
export async function adminListResponses(): Promise<RequestResponse[]> {
  const sb = supabase();
  if (sb) return check(await sb.from("request_responses").select("*").order("created_at", { ascending: false }).limit(2000)) as RequestResponse[];
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).responses;
}

/** Ссылка для входа в кабинет: действует 24 часа. */
export async function createLoginToken(masterId: string): Promise<string> {
  const token = newToken() + newToken();
  const expires_at = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const sb = supabase();
  if (sb) {
    await sb.from("login_tokens").delete().lt("expires_at", new Date().toISOString());
    check(await sb.from("login_tokens").insert({ token, master_id: masterId, expires_at }));
    return token;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  d.login_tokens = d.login_tokens.filter((t) => t.expires_at > new Date().toISOString());
  d.login_tokens.push({ token, master_id: masterId, expires_at });
  await writeLocal(d);
  return token;
}

export async function resolveLoginToken(token: string): Promise<string | null> {
  const now = new Date().toISOString();
  const sb = supabase();
  if (sb) {
    const row = check(await sb.from("login_tokens").select("master_id,expires_at").eq("token", token).maybeSingle()) as {
      master_id: string;
      expires_at: string;
    } | null;
    return row && row.expires_at > now ? row.master_id : null;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const t = (await readLocal()).login_tokens.find((x) => x.token === token);
  return t && t.expires_at > now ? t.master_id : null;
}

/** Загрузка фото специалиста. Возвращает публичную ссылку. */
export async function uploadPhoto(masterId: string, file: Blob, ext: string): Promise<string> {
  const sb = supabase();
  if (sb) {
    const key = `${masterId}/${Date.now()}.${ext}`;
    const up = await sb.storage.from("photos").upload(key, file, { contentType: file.type, upsert: true });
    if (up.error) throw new Error(up.error.message);
    return sb.storage.from("photos").getPublicUrl(key).data.publicUrl;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  // Локальный режим: храним картинку прямо в базе как data-URL
  const buf = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buf.toString("base64")}`;
}

/* ---------- демо-профили ---------- */

export async function adminAddDemoMasters(): Promise<number> {
  const existing = new Set((await adminListMasters()).map((m) => m.slug));
  let added = 0;
  for (const [i, d] of DEMO_MASTERS.entries()) {
    const slug = DEMO_PREFIX + d.slugBase;
    if (existing.has(slug)) continue;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { slugBase, photo, place, works, area, hours, both, ...rest } = d; // eslint-disable-line @typescript-eslint/no-unused-vars
    const m = await createMaster({
      ...rest,
      phone: `+99500000000${i}`,
      telegram: null,
      whatsapp: false,
      photo_url: photo,
      status: "published",
      consent_at: null,
      admin_note: "[DEMO] пример профиля",
    });
    await adminUpdateMaster(m.id, { slug, notify_requests: false });
    added++;
  }
  return added;
}

export async function adminRemoveDemoMasters(): Promise<number> {
  const demos = (await adminListMasters()).filter((m) => isDemoSlug(m.slug));
  for (const m of demos) await adminDeleteMaster(m.id);
  return demos.length;
}

/* ---------- активность специалистов ---------- */

/** Отмечает, что специалист был активен (не чаще раза в час, чтобы не писать в базу лишний раз). */
export async function touchActive(masters: Pick<Master, "id" | "last_active_at" | "inactive_warned_at">[]): Promise<void> {
  const now = Date.now();
  for (const m of masters) {
    const last = m.last_active_at ? new Date(m.last_active_at).getTime() : 0;
    if (now - last < 3600 * 1000 && !m.inactive_warned_at) continue;
    await adminUpdateMaster(m.id, { last_active_at: new Date(now).toISOString(), inactive_warned_at: null }).catch(() => null);
  }
}
