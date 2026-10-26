import type { Article, Block } from "./articles";
import AUTO from "./news/auto.json";

/*
 * Автоновости и афиша: заметки пишет задача по расписанию (см. scripts/news-bot.md) и добавляет в lib/news/auto.json.
 * Только факты из источников, своими словами, со ссылками на источники.
 */
export type AutoNews = {
  slug: string;
  date: string; // YYYY-MM-DD
  rubric: "news" | "events" | "travel" | "life" | "picks";
  emoji?: string;
  title: string;
  description: string;
  lead: string;
  body: Block[];
  sources: { name: string; url: string }[];
  city?: string;
  /** место словами, если это не один из городов сайта: «Местиа», «Кахетия», «Вся Грузия» */
  place?: string;
  /** что искать на Wikimedia Commons для обложки — по-английски: место, здание, предмет */
  photo?: { q: string; alt?: string };
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
    emoji: n.emoji || (n.rubric === "events" ? "🎟️" : n.rubric === "travel" ? "🧭" : n.rubric === "life" ? "🌴" : n.rubric === "picks" ? "✨" : "📰"),
    title: n.title,
    h1: n.title,
    description: n.description,
    lead: n.lead,
    // темы: явно или из ссылок на каталог внутри заметки ({cta, cat})
    cats: n.cats ?? [...new Set(n.body.filter((b) => "cat" in b && typeof (b as { cat?: string }).cat === "string").map((b) => (b as { cat: string }).cat))],
    body: n.body,
    source: n.sources?.[0] ?? null,
    sources: n.sources ?? [],
    faq: n.faq ?? [],
    cover: (n.body.find((b) => "img" in b) as { img: string } | undefined)?.img ?? null,
    city: n.city ?? null,
    place: n.place ?? null,
    photoQuery: n.photo?.q ?? null,
  }));
