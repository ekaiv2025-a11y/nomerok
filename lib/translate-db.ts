import "server-only";
import { createHash } from "node:crypto";
import { after } from "next/server";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import type { Locale } from "./i18n/config";
import { georgianToRussian } from "./place-addr";
import { transliterate } from "./slug";
import { detectLang, translateMany } from "./translate";
import type { PublicMaster } from "./types";

/*
 * Автоперевод анкет: специалист пишет на своём языке, посетитель читает на своём.
 * Перевод хранится в master_translations (оригинал в анкете не меняется) и обновляется сам,
 * когда специалист правит текст: при первом показе после правки — в фоне, а также раз в день по расписанию.
 */
const LANGS: Locale[] = ["ru", "ka", "en"];
const FIELDS = ["services", "about", "credentials", "service_area", "work_hours"] as const;
type Field = (typeof FIELDS)[number];
type Texts = Partial<Record<Field, string>> & { caps?: string[] };
export type TrRow = { master_id: string; src: string; hash: string; data: Partial<Record<Locale, Texts>>; updated_at: string };

type Src = Pick<PublicMaster, "id" | Field | "portfolio">;
const srcTexts = (m: Src): Texts => ({ ...Object.fromEntries(FIELDS.map((f) => [f, m[f] ?? ""])), caps: (m.portfolio ?? []).map((p) => p.caption ?? "") });
const hashOf = (m: Src) => createHash("sha1").update(JSON.stringify(srcTexts(m))).digest("hex").slice(0, 16);
/** Язык анкеты — по самым длинным полям. */
const srcLang = (m: Src) => detectLang([m.about, m.services, m.credentials].join(" "));

let cache: { at: number; map: Map<string, TrRow> } | null = null;
async function allRows(): Promise<Map<string, TrRow>> {
  if (cache && Date.now() - cache.at < 60_000) return cache.map;
  const map = new Map<string, TrRow>();
  const sb = supabase();
  if (sb) {
    for (let from = 0; ; from += 1000) {
      const r = await sb.from("master_translations").select("*").range(from, from + 999);
      if (r.error) break; // таблицы ещё нет — просто без перевода
      for (const x of r.data as TrRow[]) map.set(x.master_id, x);
      if ((r.data ?? []).length < 1000) break;
    }
  } else if (dbMode() === "local") {
    for (const x of ((await readLocal()) as { master_translations?: TrRow[] }).master_translations ?? []) map.set(x.master_id, x);
  }
  cache = { at: Date.now(), map };
  return map;
}

async function saveRow(row: TrRow) {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("master_translations").upsert(row, { onConflict: "master_id" });
    if (r.error) throw new Error(r.error.message);
  } else if (dbMode() === "local") {
    const d = (await readLocal()) as Awaited<ReturnType<typeof readLocal>> & { master_translations?: TrRow[] };
    d.master_translations = [...(d.master_translations ?? []).filter((x) => x.master_id !== row.master_id), row];
    await writeLocal(d);
  }
  cache?.map.set(row.master_id, row);
}

/** Перевести анкету на два других языка и сохранить. */
export async function translateMaster(m: Src): Promise<TrRow | null> {
  const src = srcLang(m);
  const hash = hashOf(m);
  const texts = srcTexts(m);
  const data: TrRow["data"] = {};
  if (src) {
    const list = [...FIELDS.map((f) => texts[f] ?? ""), ...(texts.caps ?? [])];
    for (const to of LANGS.filter((l) => l !== src)) {
      const tr = await translateMany(list, src, to);
      data[to] = { ...Object.fromEntries(FIELDS.map((f, i) => [f, tr[i]])), caps: tr.slice(FIELDS.length) };
    }
  }
  const row: TrRow = { master_id: m.id, src: src ?? "", hash, data, updated_at: new Date().toISOString() };
  await saveRow(row);
  return row;
}

const inFlight = new Set<string>();
/** Перевести в фоне (после ответа страницы) тех, у кого перевода нет или текст поменялся. */
function scheduleMissing(list: Src[], rows: Map<string, TrRow>, max = 4) {
  const todo = list.filter((m) => !(m as { demo?: boolean }).demo && rows.get(m.id)?.hash !== hashOf(m) && !inFlight.has(m.id)).slice(0, max);
  if (!todo.length) return;
  todo.forEach((m) => inFlight.add(m.id));
  try {
    after(async () => {
      for (const m of todo) {
        await translateMaster(m).catch((e) => console.warn("[translate]", m.id, e instanceof Error ? e.message : e));
        inFlight.delete(m.id);
      }
    });
  } catch {
    todo.forEach((m) => inFlight.delete(m.id)); // вне запроса (сборка) — переведёт ежедневная задача
  }
}

/** Имя грузинскими буквами — для русской и английской версий показываем латиницей/кириллицей. */
export function nameFor(name: string, lang: Locale): string {
  if (lang === "ka" || !/[Ⴀ-ჿ]/.test(name) || /[A-Za-zА-Яа-яЁё]/.test(name)) return name;
  if (lang === "ru") return georgianToRussian(name);
  return transliterate(name).replace(/(^|[\s-])([a-z])/g, (_, a, b) => a + b.toUpperCase());
}

function apply<T extends PublicMaster>(m: T, lang: Locale, row: TrRow | undefined): T {
  const name = nameFor(m.name, lang);
  const t = row && row.hash === hashOf(m) && row.src && row.src !== lang ? row.data[lang] : undefined;
  if (!t) return name === m.name ? m : { ...m, name, name_orig: m.name };
  const out = { ...m, name, name_orig: name === m.name ? undefined : m.name, tr_from: row!.src as Locale } as T;
  for (const f of FIELDS) if (t[f] && m[f]) (out as Record<string, unknown>)[f] = t[f];
  if (t.caps?.length) out.portfolio = m.portfolio.map((p, i) => (t.caps?.[i] ? { ...p, caption: t.caps[i] } : p));
  return out;
}

/** Анкеты на языке посетителя. orig — показать как написал специалист. */
export async function localizeMasters<T extends PublicMaster>(list: T[], lang: Locale, opts: { orig?: boolean } = {}): Promise<T[]> {
  const rows = await allRows().catch(() => new Map<string, TrRow>());
  scheduleMissing(list, rows);
  if (opts.orig) return list;
  return list.map((m) => apply(m, lang, rows.get(m.id)));
}
export async function localizeMaster<T extends PublicMaster>(m: T | null, lang: Locale, opts: { orig?: boolean } = {}): Promise<T | null> {
  if (!m) return null;
  return (await localizeMasters([m], lang, opts))[0];
}

/** Для ежедневной задачи: перевести всех, у кого нет перевода или текст изменился. */
export async function translateStale(list: Src[], limit = 40): Promise<{ done: number; failed: number; left: number }> {
  const rows = await allRows();
  const todo = list.filter((m) => !(m as { demo?: boolean }).demo && rows.get(m.id)?.hash !== hashOf(m));
  let done = 0;
  let failed = 0;
  for (const m of todo.slice(0, limit)) {
    try {
      await translateMaster(m);
      done++;
    } catch {
      failed++;
    }
  }
  return { done, failed, left: Math.max(0, todo.length - done) };
}
