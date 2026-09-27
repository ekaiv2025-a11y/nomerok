import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes, randomUUID } from "crypto";
import { makeSlug } from "./slug";
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

type LocalData = {
  masters: Master[];
  requests: ClientRequest[];
  contact_views: { master_id: string; visitor: string; created_at: string }[];
  responses: RequestResponse[];
  login_tokens: { token: string; master_id: string; expires_at: string }[];
};
const LOCAL_FILE = path.join(process.cwd(), ".data", "db.json");

async function readLocal(): Promise<LocalData> {
  try {
    const d = JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
    return { masters: [], requests: [], contact_views: [], responses: [], login_tokens: [], ...d };
  } catch {
    return { masters: [], requests: [], contact_views: [], responses: [], login_tokens: [] };
  }
}
async function writeLocal(d: LocalData) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(d, null, 2));
}

/* ---------- общие помощники ---------- */

type PublicRow = Omit<PublicMaster, "verified"> & { phone_verified_at: string | null };

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
    verified: !!m.phone_verified_at,
  };
}

export function newToken(): string {
  return randomBytes(12).toString("hex");
}

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

const PUBLIC_COLUMNS =
  "id,slug,name,category,services,about,credentials,experience_years,languages,price_from,price_unit,photo_url,phone_verified_at,created_at,updated_at";

/* ---------- мастера: публичная часть ---------- */

export async function listPublishedMasters(): Promise<PublicMaster[]> {
  const sb = supabase();
  if (sb) {
    const rows = check(
      await sb.from("masters").select(PUBLIC_COLUMNS).eq("status", "published").order("created_at", { ascending: false }),
    );
    return (rows as unknown as PublicRow[]).map(toPublic);
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
    return row ? toPublic(row as unknown as PublicRow) : null;
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
    notify_requests: true,
    id: randomUUID(),
    created_at: now,
    updated_at: now,
  };
  d.masters.push(m);
  await writeLocal(d);
  return m;
}

export async function createRequest(input: NewRequest): Promise<ClientRequest> {
  const row = { ...input, lang: input.lang ?? "ru", client_link_token: newToken() };
  const sb = supabase();
  if (sb) return check(await sb.from("requests").insert(row).select("*").single()) as ClientRequest;
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const r: ClientRequest = {
    ...row,
    id: randomUUID(),
    status: "new",
    admin_note: "",
    client_tg_chat_id: null,
    sent_count: 0,
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
export async function listMastersForRequests(category: string): Promise<Master[]> {
  const sb = supabase();
  if (sb) {
    return check(
      await sb
        .from("masters")
        .select("*")
        .eq("status", "published")
        .eq("category", category)
        .eq("notify_requests", true)
        .not("tg_chat_id", "is", null)
        .not("phone_verified_at", "is", null),
    ) as Master[];
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).masters.filter(
    (m) => m.status === "published" && m.category === category && m.notify_requests && m.tg_chat_id && m.phone_verified_at,
  );
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
