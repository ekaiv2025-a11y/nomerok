import "server-only";
import { ARTICLES, type Article } from "./articles";
import { postToArticle, publishedPostBySlug, publishedPosts } from "./posts-db";
import { AUTO_NEWS } from "./news-auto";
import { CITY_PHOTO_QUERY, commonsPhoto } from "./commons";

/** Обложка автоновости: фото по теме с Commons, иначе — фото её города (тоже с Commons). */
async function withPhoto(a: Article): Promise<Article> {
  if (a.cover || !(a.photoQuery || a.rubric === "news" || a.rubric === "events" || a.rubric === "travel")) return a;
  const p = (a.photoQuery ? await commonsPhoto(a.photoQuery) : null) ?? (await commonsPhoto(CITY_PHOTO_QUERY[a.city ?? ""] ?? CITY_PHOTO_QUERY.georgia));
  return p ? { ...a, cover: p.url, coverCredit: { credit: p.credit, license: p.license, source: p.source } } : a;
}

/** Вся лента журнала: статьи из кода + записи из админки, новые сверху. */
export async function journalArticles(): Promise<Article[]> {
  const posts = (await publishedPosts().catch(() => [])).map(postToArticle);
  const slugs = new Set(posts.map((p) => p.slug));
  const auto = await Promise.all(AUTO_NEWS.filter((a) => !slugs.has(a.slug)).map(withPhoto));
  const code = [...auto, ...ARTICLES];
  return [...posts, ...code.filter((a) => !slugs.has(a.slug))].sort((a, b) => b.date.localeCompare(a.date));
}

export async function journalArticle(slug: string): Promise<Article | null> {
  const p = await publishedPostBySlug(slug).catch(() => null);
  if (p) return postToArticle(p);
  const n = AUTO_NEWS.find((a) => a.slug === slug);
  if (n) return withPhoto(n);
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}
