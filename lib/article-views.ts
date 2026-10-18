import "server-only";
import { dbMode, readLocal, supabase, writeLocal } from "./db";

type Local = { article_views?: { slug: string; visitor: string; day: string }[]; article_counts?: Record<string, number> };

/** Отметить просмотр статьи (один посетитель — один раз в день). */
export async function trackArticleView(slug: string, visitor: string): Promise<void> {
  const sb = supabase();
  if (sb) {
    await sb.rpc("track_article_view", { p_slug: slug, p_visitor: visitor });
    return;
  }
  if (dbMode() === "none") return;
  const d = (await readLocal()) as unknown as Local;
  const day = new Date().toISOString().slice(0, 10);
  d.article_views ??= [];
  if (d.article_views.some((v) => v.slug === slug && v.visitor === visitor && v.day === day)) return;
  d.article_views.push({ slug, visitor, day });
  d.article_counts = { ...(d.article_counts ?? {}), [slug]: (d.article_counts?.[slug] ?? 0) + 1 };
  await writeLocal(d as never);
}

/** Просмотры статей: { slug: число }. */
export async function articleViews(slugs?: string[]): Promise<Record<string, number>> {
  const sb = supabase();
  if (sb) {
    let q = sb.from("article_counts").select("slug,views");
    if (slugs?.length) q = q.in("slug", slugs);
    const r = await q;
    if (r.error) return {};
    return Object.fromEntries((r.data as { slug: string; views: number }[]).map((x) => [x.slug, x.views]));
  }
  if (dbMode() === "none") return {};
  return ((await readLocal()) as unknown as Local).article_counts ?? {};
}
