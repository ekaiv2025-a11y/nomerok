import type { Article, Block } from "./articles";
import AUTO from "./news/auto.json";

/*
 * Автоновости и афиша: заметки пишет задача по расписанию (см. scripts/news-bot.md) и добавляет в lib/news/auto.json.
 * Только факты из источников, своими словами, со ссылками на источники.
 */
export type AutoNews = {
  slug: string;
  date: string; // YYYY-MM-DD
  rubric: "news" | "events" | "travel";
  emoji?: string;
  title: string;
  description: string;
  lead: string;
  body: Block[];
  sources: { name: string; url: string }[];
  city?: string;
  cats?: string[];
  hidden?: boolean;
  faq?: { q: string; a: string }[];
};

export const AUTO_NEWS: Article[] = (AUTO as unknown as AutoNews[])
  .filter((n) => n && n.slug && n.title && !n.hidden)
  .map((n) => ({
    slug: n.slug,
    date: n.date,
    rubric: n.rubric,
    emoji: n.emoji || (n.rubric === "events" ? "🎟️" : n.rubric === "travel" ? "🧭" : "📰"),
    title: n.title,
    h1: n.title,
    description: n.description,
    lead: n.lead,
    cats: n.cats ?? [],
    body: n.body,
    source: n.sources?.[0] ?? null,
    sources: n.sources ?? [],
    faq: n.faq ?? [],
  }));
