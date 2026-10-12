import "server-only";
import { ARTICLES, type Article } from "./articles";
import { postToArticle, publishedPostBySlug, publishedPosts } from "./posts-db";

/** Вся лента журнала: статьи из кода + записи из админки, новые сверху. */
export async function journalArticles(): Promise<Article[]> {
  const posts = (await publishedPosts().catch(() => [])).map(postToArticle);
  const slugs = new Set(posts.map((p) => p.slug));
  return [...posts, ...ARTICLES.filter((a) => !slugs.has(a.slug))].sort((a, b) => b.date.localeCompare(a.date));
}

export async function journalArticle(slug: string): Promise<Article | null> {
  const p = await publishedPostBySlug(slug).catch(() => null);
  if (p) return postToArticle(p);
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}
