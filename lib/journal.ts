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
async function withPhoto(a: Article): Promise<Article> {
  if (a.cover) return a;
  const city = articleCity(a);
  const queries = [a.photoQuery, ARTICLE_PHOTO[a.slug], CAT_PHOTO[a.cats?.[0] ?? ""], city ? CITY_PHOTO_QUERY[city] : null, CITY_PHOTO_QUERY.georgia].filter(Boolean) as string[];
  for (const q of queries) {
    const p = await commonsPhoto(q);
    if (p === undefined) return a; // Commons не отвечает — без обложки, не ждём
    if (p) return { ...a, cover: p.url, coverCredit: { credit: p.credit, license: p.license, source: p.source } };
  }
  return a;
}

/** Вся лента журнала: статьи из кода + записи из админки, новые сверху. */
export async function journalArticles(): Promise<Article[]> {
  const posts = await Promise.all((await publishedPosts().catch(() => [])).map(postToArticle).map(withPhoto));
  const slugs = new Set(posts.map((p) => p.slug));
  const code = await Promise.all([...AUTO_NEWS, ...ARTICLES].filter((a) => !slugs.has(a.slug)).map(withPhoto));
  return [...posts, ...code].sort((a, b) => b.date.localeCompare(a.date));
}

export async function journalArticle(slug: string): Promise<Article | null> {
  const p = await publishedPostBySlug(slug).catch(() => null);
  if (p) return withPhoto(postToArticle(p));
  const n = AUTO_NEWS.find((a) => a.slug === slug) ?? ARTICLES.find((a) => a.slug === slug);
  return n ? withPhoto(n) : null;
}
