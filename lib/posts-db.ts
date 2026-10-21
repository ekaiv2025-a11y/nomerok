import "server-only";
import { randomBytes } from "crypto";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import type { Article, Block, Rubric } from "./articles";
import { categoryPlural } from "./categories";

/*
 * Журнал: записи, которые админ публикует сам (новости, заметки, статьи).
 * Текст пишется простым форматом (см. parsePostBody), без HTML.
 */
export type Post = {
  id: string;
  slug: string;
  title: string;
  lead: string;
  body: string;
  rubric: string;
  emoji: string;
  cover_url: string | null;
  photos?: string[];
  source_name: string | null;
  source_url: string | null;
  cats: string[];
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const TR: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
export function slugify(title: string): string {
  const s = title
    .toLowerCase()
    .split("")
    .map((c) => TR[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/, "");
  return s || "post-" + randomBytes(3).toString("hex");
}

/**
 * Простой формат текста:
 *   пустая строка — новый абзац
 *   ## Заголовок
 *   - пункт списка   (или 1. пункт — нумерованный)
 *   ! важная подсказка (жёлтая плашка)
 *   @места: id-или-адрес, id2, … — карточки мест (для подборок)
 */
export function parsePostBody(text: string): Block[] {
  const out: Block[] = [];
  const chunks = text.replace(/\r/g, "").split(/\n\s*\n/);
  for (const raw of chunks) {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    let para: string[] = [];
    let list: string[] = [];
    let ordered = false;
    const flush = () => {
      if (para.length) out.push({ p: para.join("\n") });
      if (list.length) out.push({ list, ordered });
      para = [];
      list = [];
    };
    for (const l of lines) {
      if (/^@(места|places)\s*:/i.test(l)) {
        flush();
        out.push({ places: l.replace(/^@(места|places)\s*:/i, "").split(/[,\s]+/).map((x) => x.trim().replace(/^.*\/places\//, "")).filter(Boolean) });
      } else if (/^#{2,3}\s+/.test(l)) {
        flush();
        out.push({ h2: l.replace(/^#{2,3}\s+/, "") });
      } else if (/^!\s*/.test(l)) {
        flush();
        out.push({ tip: l.replace(/^!\s*/, "") });
      } else if (/^[-•*]\s+/.test(l)) {
        if (para.length) flush();
        ordered = false;
        list.push(l.replace(/^[-•*]\s+/, ""));
      } else if (/^\d+[.)]\s+/.test(l)) {
        if (para.length) flush();
        ordered = true;
        list.push(l.replace(/^\d+[.)]\s+/, ""));
      } else {
        if (list.length) flush();
        para.push(l);
      }
    }
    flush();
  }
  return out;
}

/** Запись журнала → формат статьи для общей ленты и страницы. */
export function postToArticle(p: Post): Article {
  return {
    slug: p.slug,
    title: p.title,
    description: (p.lead || p.body).replace(/\s+/g, " ").slice(0, 160),
    h1: p.title,
    lead: p.lead,
    emoji: p.emoji || "📰",
    date: (p.published_at ?? p.created_at).slice(0, 10),
    rubric: (p.rubric as Rubric) || "news",
    cats: p.cats ?? [],
    body: [...parsePostBody(p.body), ...(p.cats?.[0] ? [{ cta: `${categoryPlural(p.cats[0], "ru")} на NomerOk — фото работ, цены, отзывы`, cat: p.cats[0] } as Block] : [])],
    // Обложка: отдельное фото или первое из галереи
    cover: p.cover_url || p.photos?.[0] || null,
    photos: p.cover_url ? (p.photos ?? []) : (p.photos ?? []).slice(1),
    source: p.source_url ? { name: p.source_name || new URL(p.source_url).hostname, url: p.source_url } : null,
  };
}

async function all(): Promise<Post[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("posts").select("*").order("created_at", { ascending: false });
    return r.error ? [] : (r.data as Post[]); // нет таблицы — пусто
  }
  if (dbMode() === "none") return [];
  return (await readLocal()).posts ?? [];
}

export async function adminListPosts(): Promise<Post[]> {
  return all();
}

export async function publishedPosts(): Promise<Post[]> {
  return (await all().catch(() => [])).filter((p) => p.status === "published");
}

export async function getPost(id: string): Promise<Post | null> {
  return (await all()).find((p) => p.id === id) ?? null;
}

export async function publishedPostBySlug(slug: string): Promise<Post | null> {
  return (await publishedPosts()).find((p) => p.slug === slug) ?? null;
}

export async function savePost(input: Omit<Post, "id" | "created_at" | "updated_at" | "published_at"> & { id?: string }): Promise<Post> {
  const now = new Date().toISOString();
  const list = await all();
  const prev = input.id ? list.find((p) => p.id === input.id) : undefined;
  // уникальный адрес
  let slug = input.slug;
  for (let i = 2; list.some((p) => p.slug === slug && p.id !== input.id); i++) slug = `${input.slug}-${i}`;
  const row: Post = {
    ...(prev ?? { id: crypto.randomUUID(), created_at: now, published_at: null }),
    ...input,
    id: prev?.id ?? input.id ?? crypto.randomUUID(),
    slug,
    created_at: prev?.created_at ?? now,
    updated_at: now,
    published_at: input.status === "published" ? (prev?.published_at ?? now) : prev?.published_at ?? null,
  };
  const sb = supabase();
  if (sb) {
    let r = await sb.from("posts").upsert(row).select("*").single();
    // колонки «photos» ещё нет (миграция 0020 не выполнена) — сохраняем без галереи
    if (r.error && /photos/i.test(r.error.message)) {
      const { photos: _skip, ...rest } = row; // eslint-disable-line @typescript-eslint/no-unused-vars
      r = await sb.from("posts").upsert(rest).select("*").single();
    }
    if (r.error) throw new Error(/does not exist|schema cache/i.test(r.error.message) ? "Таблица журнала ещё не создана — откройте админку → Telegram-бот → проверка базы (миграция 0019)" : r.error.message);
    return r.data as Post;
  }
  const d = await readLocal();
  d.posts = [row, ...(d.posts ?? []).filter((p) => p.id !== row.id)];
  await writeLocal(d);
  return row;
}

export async function deletePost(id: string): Promise<void> {
  const sb = supabase();
  if (sb) {
    await sb.from("posts").delete().eq("id", id);
    return;
  }
  const d = await readLocal();
  d.posts = (d.posts ?? []).filter((p) => p.id !== id);
  await writeLocal(d);
}
