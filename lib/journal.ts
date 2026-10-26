import "server-only";
import { ARTICLES, type Article } from "./articles";
import { postToArticle, publishedPostBySlug, publishedPosts } from "./posts-db";
import { AUTO_NEWS } from "./news-auto";
import { CITY_PHOTO_QUERY, commonsPhoto } from "./commons";
import { ARTICLE_PHOTO, CAT_PHOTO } from "./article-photos";
import { articleCity } from "./related";

/**
 * Обложка для любой статьи без фото: запрос из статьи (photoQuery) → из списка для статей (ARTICLE_PHOTO)
 * → по разделу каталога → фото города → общий вид Грузии. Всё — с Wikimedia Commons со свободной лицензией.
 */
// Страница не ждёт фото дольше этого: что не успело — покажется со следующего открытия (поиск продолжается в фоне)
const PHOTO_WAIT_MS = 1200;
const late = (ms: number) => new Promise<"late">((r) => setTimeout(() => r("late"), Math.max(0, ms)));

async function withPhoto(a: Article, deadline = Date.now() + PHOTO_WAIT_MS): Promise<Article> {
  if (a.cover) return a;
  const city = articleCity(a);
  const queries = [a.photoQuery, ARTICLE_PHOTO[a.slug], CAT_PHOTO[a.cats?.[0] ?? ""], city ? CITY_PHOTO_QUERY[city] : null, CITY_PHOTO_QUERY.georgia].filter(Boolean) as string[];
  for (const q of queries) {
    const p = await Promise.race([commonsPhoto(q), late(deadline - Date.now())]);
    if (p === "late") return a; // долго — без обложки сейчас, не держим страницу
    if (p === undefined) return a; // Commons не отвечает — без обложки, не ждём
    if (p) return { ...a, cover: p.url, coverCredit: { credit: p.credit, license: p.license, source: p.source } };
  }
  return a;
}

/** Вся лента журнала: статьи из кода + записи из админки, новые сверху. */
export async function journalArticles(): Promise<Article[]> {
  const deadline = Date.now() + PHOTO_WAIT_MS;
  const posts = await Promise.all((await publishedPosts().catch(() => [])).map(postToArticle).map((a) => withPhoto(a, deadline)));
  const slugs = new Set(posts.map((p) => p.slug));
  const code = await Promise.all([...AUTO_NEWS, ...ARTICLES].filter((a) => !slugs.has(a.slug)).map((a) => withPhoto(a, deadline)));
  return [...posts, ...code].sort((a, b) => b.date.localeCompare(a.date));
}

export async function journalArticle(slug: string): Promise<Article | null> {
  const p = await publishedPostBySlug(slug).catch(() => null);
  if (p) return withPhoto(postToArticle(p));
  const n = AUTO_NEWS.find((a) => a.slug === slug) ?? ARTICLES.find((a) => a.slug === slug);
  return n ? withPhoto(n) : null;
}
