import "server-only";
import { adminUpdateMaster, dbMode, DbNotConfiguredError, readLocal, supabase } from "./db";

/* Короткие ссылки на профиль: nomerok.ge/anna → профиль специалиста. */

// Эти слова заняты разделами сайта
const RESERVED = new Set([
  "ru", "en", "ka", "api", "admin", "master", "masters", "services", "join", "request", "requests", "cabinet", "my", "favorites", "recommend",
  "how", "rules", "contacts", "complaint", "review", "reviews", "search", "nomerok", "support", "help", "about", "blog", "login", "telegram",
]);

export function normalizeShort(raw: string): string | null {
  const s = raw.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?nomerok\.ge\//i, "").toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{2,29}$/.test(s) || RESERVED.has(s)) return null;
  return s;
}

type Row = { id: string; slug: string; status: string; short?: string | null };

export async function findByShort(short: string): Promise<Row | null> {
  const s = short.replace(/^@/, "").toLowerCase();
  const sb = supabase();
  if (sb) {
    const r = await sb.from("masters").select("id,slug,status,short").ilike("short", s).limit(1);
    return r.error ? null : ((r.data as Row[])[0] ?? null);
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return ((await readLocal()).masters as Row[]).find((m) => (m.short ?? "").toLowerCase() === s) ?? null;
}

/** Сохраняет короткую ссылку. Возвращает ошибку: "invalid" | "taken" | null. */
export async function setShort(id: string, raw: string): Promise<"invalid" | "taken" | null> {
  if (!raw.trim()) {
    await adminUpdateMaster(id, { short: null });
    return null;
  }
  const s = normalizeShort(raw);
  if (!s) return "invalid";
  const other = await findByShort(s);
  if (other && other.id !== id) return "taken";
  try {
    await adminUpdateMaster(id, { short: s });
  } catch (e) {
    if (/duplicate|unique/i.test(String(e))) return "taken";
    throw e;
  }
  return null;
}

