import "server-only";
import type { Locale } from "./i18n/config";

/*
 * Машинный перевод текстов (ru / ka / en).
 * Если в Vercel задан GOOGLE_TRANSLATE_API_KEY — официальный Google Cloud Translation (первые 500 тыс. символов в месяц бесплатно).
 * Если ключа нет — бесплатный открытый адрес Google Переводчика (без гарантий: может временно отказать — тогда попробуем позже).
 */
const KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const FREE = process.env.TRANSLATE_FREE_API || "https://translate.googleapis.com/translate_a/single";

/** Язык текста по алфавиту: грузинские буквы → ka, кириллица → ru, латиница → en. */
export function detectLang(text: string): Locale | null {
  const ka = (text.match(/[Ⴀ-ჿ]/g) ?? []).length;
  const ru = (text.match(/[А-Яа-яЁё]/g) ?? []).length;
  const en = (text.match(/[A-Za-z]/g) ?? []).length;
  const max = Math.max(ka, ru, en);
  if (max < 3) return null;
  return max === ka ? "ka" : max === ru ? "ru" : "en";
}

/** Режем длинный текст по предложениям, чтобы запрос был небольшим. */
function chunks(text: string, max = 600): string[] {
  const parts = text.split(/(?<=[.!?\n])/);
  const out: string[] = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + p).length > max && cur) {
      out.push(cur);
      cur = "";
    }
    if (p.length > max) {
      for (let i = 0; i < p.length; i += max) out.push(p.slice(i, i + max));
    } else cur += p;
  }
  if (cur) out.push(cur);
  return out;
}

async function freeOne(text: string, from: Locale, to: Locale): Promise<string> {
  const out: string[] = [];
  for (const c of chunks(text)) {
    if (!c.trim()) {
      out.push(c);
      continue;
    }
    const u = `${FREE}?${new URLSearchParams({ client: "gtx", sl: from, tl: to, dt: "t", q: c })}`;
    const r = await fetch(u, { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!r.ok) throw new Error(`translate ${r.status}`);
    const j = (await r.json()) as [[string, string][]];
    const lead = c.match(/^\s*/)?.[0] ?? "";
    const tail = c.match(/\s*$/)?.[0] ?? "";
    out.push(lead + (j?.[0] ?? []).map((x) => x[0]).join("").trim() + tail);
  }
  return out.join("");
}

async function official(texts: string[], from: Locale, to: Locale): Promise<string[]> {
  const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, source: from, target: to, format: "text" }),
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`translate ${r.status}`);
  const j = (await r.json()) as { data?: { translations?: { translatedText: string }[] } };
  return (j.data?.translations ?? []).map((t) => t.translatedText);
}

/** Перевести несколько текстов с одного языка на другой. Пустые строки остаются пустыми. */
export async function translateMany(texts: string[], from: Locale, to: Locale): Promise<string[]> {
  if (from === to) return texts;
  const idx = texts.map((t, i) => (t.trim() ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return texts;
  const res = [...texts];
  if (KEY) {
    const tr = await official(idx.map((i) => texts[i]), from, to);
    idx.forEach((i, k) => (res[i] = tr[k] ?? texts[i]));
  } else {
    for (const i of idx) res[i] = await freeOne(texts[i], from, to);
  }
  return res;
}
