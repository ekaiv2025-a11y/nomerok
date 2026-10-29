import "server-only";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import { PLACE_CATS } from "./places";
import { CITY_IDS } from "./cities";

/*
 * SEO-тексты разделов «Мест»: для пары «город + раздел» (или «all» — все города).
 * Готовит внешний ассистент по заданию «Задание — тексты разделов мест.txt», загружается в админке одним JSON-файлом.
 */
export type CatText = {
  city: string; // batumi | tbilisi | … | all
  cat: string; // health | food | public …
  title?: string; // SEO-заголовок страницы (до 70 знаков)
  description?: string; // мета-описание (до 160)
  intro: string; // 2–3 предложения над списком
  body: ({ h2: string } | { p: string } | { list: string[] })[]; // статья под списком
  faq?: { q: string; a: string }[];
};

type L = { place_cat_texts?: { key: string; data: CatText; updated_at: string }[] };
const keyOf = (city: string, cat: string) => `${city}:${cat}`;

let cache: { at: number; map: Map<string, CatText> } | null = null;
async function all(): Promise<Map<string, CatText>> {
  if (cache && Date.now() - cache.at < 300_000) return cache.map;
  const map = new Map<string, CatText>();
  const sb = supabase();
  if (sb) {
    const r = await sb.from("place_cat_texts").select("key,data");
    if (!r.error) for (const x of r.data as { key: string; data: CatText }[]) map.set(x.key, x.data);
  } else if (dbMode() === "local") {
    for (const x of ((await readLocal()) as unknown as L).place_cat_texts ?? []) map.set(x.key, x.data);
  }
  cache = { at: Date.now(), map };
  return map;
}

/** Текст для раздела в городе; если для города нет — общий («all»). */
export async function catText(cat: string, city?: string | null): Promise<CatText | null> {
  const m = await all().catch(() => new Map<string, CatText>());
  return (city ? m.get(keyOf(city, cat)) : null) ?? m.get(keyOf("all", cat)) ?? null;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Проверить и сохранить файл с текстами. Возвращает отчёт. */
export async function importCatTexts(json: unknown): Promise<{ saved: number; errors: string[] }> {
  const list = Array.isArray(json) ? json : Array.isArray((json as { items?: unknown })?.items) ? (json as { items: unknown[] }).items : null;
  if (!list) throw new Error("Нужен JSON-массив текстов (см. задание)");
  const errors: string[] = [];
  const rows: { key: string; data: CatText; updated_at: string }[] = [];
  const now = new Date().toISOString();
  list.forEach((x, i) => {
    const o = (x ?? {}) as Record<string, unknown>;
    const city = str(o.city, 20) || "all";
    const cat = str(o.cat, 30);
    const at = `#${i + 1} (${city}:${cat})`;
    if (!PLACE_CATS.some((c) => c.id === cat)) return errors.push(`${at}: неизвестный раздел cat`);
    if (city !== "all" && !(CITY_IDS as readonly string[]).includes(city)) return errors.push(`${at}: неизвестный город`);
    const intro = str(o.intro, 600);
    if (intro.length < 60) return errors.push(`${at}: intro короче 60 знаков`);
    const body = (Array.isArray(o.body) ? o.body : [])
      .map((b) => {
        const bb = (b ?? {}) as Record<string, unknown>;
        if (typeof bb.h2 === "string") return { h2: str(bb.h2, 120) };
        if (typeof bb.p === "string") return { p: str(bb.p, 2000) };
        if (Array.isArray(bb.list)) return { list: bb.list.map((s) => str(s, 400)).filter(Boolean).slice(0, 20) };
        return null;
      })
      .filter((b): b is CatText["body"][number] => !!b);
    if (!body.length) return errors.push(`${at}: пустой body`);
    const faq = (Array.isArray(o.faq) ? o.faq : []).map((f) => ({ q: str((f as { q?: unknown })?.q, 200), a: str((f as { a?: unknown })?.a, 800) })).filter((f) => f.q && f.a).slice(0, 10);
    const text = JSON.stringify(o);
    if (/лучш(ий|ие|ая|ее) |проверенн|whatsapp/i.test(text)) return errors.push(`${at}: запрещённые слова («лучшие», «проверенные», WhatsApp)`);
    rows.push({ key: keyOf(city, cat), data: { city, cat, title: str(o.title, 90) || undefined, description: str(o.description, 200) || undefined, intro, body, faq }, updated_at: now });
  });
  const sb = supabase();
  if (sb && rows.length) {
    const r = await sb.from("place_cat_texts").upsert(rows, { onConflict: "key" });
    if (r.error) throw new Error(/does not exist|schema cache/i.test(r.error.message) ? "Таблица ещё не создана (миграция 0041) — дождитесь обновления сайта" : r.error.message);
  } else if (!sb && dbMode() === "local" && rows.length) {
    const d = (await readLocal()) as unknown as L & Record<string, unknown>;
    const m = new Map((d.place_cat_texts ?? []).map((x) => [x.key, x]));
    for (const r of rows) m.set(r.key, r);
    d.place_cat_texts = [...m.values()];
    await writeLocal(d as never);
  }
  cache = null;
  return { saved: rows.length, errors };
}
