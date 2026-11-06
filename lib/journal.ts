import "server-only";
import { after } from "next/server";
import { ARTICLES, type Article } from "./articles";
import { postToArticle, publishedPostBySlug, publishedPosts } from "./posts-db";
import { AUTO_NEWS } from "./news-auto";
import { CITY_PHOTO_QUERY, commonsPhotos, type CommonsPhoto } from "./commons";
import { ARTICLE_PHOTO, CAT_PHOTO } from "./article-photos";
import { articleCity } from "./related";

/**
 * Обложка для любой статьи без фото: запрос из статьи (photoQuery) → из списка для статей (ARTICLE_PHOTO)
 * → по разделу каталога → фото города → общий вид Грузии. Всё — с Wikimedia Commons со свободной лицензией.
 */
// Страница не ждёт фото дольше этого: что не успело — покажется со следующего открытия (поиск продолжается в фоне)
const PHOTO_WAIT_MS = 1200;

/* Запасные запросы по рубрике: несколько разных, чтобы обложки не повторялись. */
const RUBRIC_PHOTO: Record<string, string[]> = {
  news: ["Tbilisi Rustaveli Avenue", "Batumi Old Boulevard", "Tbilisi Freedom Square", "Kutaisi city center", "Batumi Europe Square", "Tbilisi Old Town street"],
  life: ["Tbilisi apartment buildings", "Batumi residential buildings", "Vake district Tbilisi", "Saburtalo Tbilisi", "Batumi street", "Tbilisi Dry Bridge market", "Tbilisi courtyard"],
  home: ["apartment renovation", "interior renovation work", "plumbing repair", "electrician work", "bathroom tiles", "painting wall interior"],
  family: ["playground Tbilisi", "children park Batumi", "Tbilisi park autumn", "school building Georgia"],
  health: ["hospital building Tbilisi", "Tbilisi park", "Batumi seaside promenade"],
  build: ["construction crane Batumi", "Batumi skyscrapers", "Tbilisi new buildings construction", "building construction site crane", "Batumi new boulevard towers"],
  travel: ["Svaneti towers", "Kazbegi Gergeti Trinity Church", "Kakheti vineyards", "Signagi town walls", "Vardzia cave monastery", "Martvili canyon"],
  events: ["Tbilisi Opera theatre", "Batumi Drama Theatre", "Tbilisi Philharmonic", "concert stage"],
  picks: ["Tbilisi cafe street", "Batumi cafe", "Tbilisi restaurant interior", "Fabrika Tbilisi"],
  pros: ["craftsman at work", "person using smartphone", "handshake business meeting", "carpenter workshop", "hairdresser at work", "laptop work desk"],
};
// Горы и крепости подходят только к статьям про страну и город; к советам специалистам, ремонту и здоровью — нет (лучше без обложки)
const GEORGIA_OK = new Set(["news", "life", "travel", "picks", "events", "build", undefined, ""]);
const GEORGIA_PHOTO = ["Caucasus mountains Kazbegi Georgia", "Tbilisi Narikala fortress", "Batumi Alphabetic Tower", "Kutaisi Bagrati Cathedral", "Mtskheta Jvari monastery", "Gudauri mountains", "Borjomi park", "Ananuri fortress"];

function photoQueries(a: Article): string[] {
  const city = articleCity(a);
  const list = [a.photoQuery, ARTICLE_PHOTO[a.slug], CAT_PHOTO[a.cats?.[0] ?? ""], city ? CITY_PHOTO_QUERY[city] : null, ...(RUBRIC_PHOTO[a.rubric ?? ""] ?? []), ...(GEORGIA_OK.has(a.rubric) ? GEORGIA_PHOTO : [])];
  return [...new Set(list.filter(Boolean) as string[])];
}

// Статьи, которым фото не успело найтись: дозаполняем после ответа страницы (результат сохраняется в базе)
const pending = new Set<string>();
function finishLater(list: Article[]) {
  const todo = list.filter((a) => !a.cover && !pending.has(a.slug)).slice(0, 40);
  if (!todo.length) return;
  todo.forEach((a) => pending.add(a.slug));
  try {
    after(async () => {
      for (const a of todo) {
        for (const q of photoQueries(a).slice(0, 4)) {
          const p = await commonsPhotos(q).catch(() => undefined);
          if (p === undefined || p.length) break;
        }
        pending.delete(a.slug);
      }
    });
  } catch {
    todo.forEach((a) => pending.delete(a.slug));
  }
}

/** Что уже нашлось к дедлайну: undefined — ещё ищется или Commons не ответил. */
async function settled(queries: string[], deadline: number): Promise<Map<string, CommonsPhoto[]>> {
  const out = new Map<string, CommonsPhoto[]>();
  const all = queries.map((q) => commonsPhotos(q).then((l) => (l ? out.set(q, l) : null)).catch(() => null));
  await Promise.race([Promise.all(all), new Promise((r) => setTimeout(r, Math.max(0, deadline - Date.now())))]);
  return out;
}

/**
 * Обложки для ленты: у каждой статьи — своё фото. Идём от новых к старым; если первое найденное фото уже занято
 * другой статьёй, берём следующее по тому же запросу или по следующему запросу.
 */
async function withPhotos(list: Article[], deadline: number): Promise<Article[]> {
  const used = new Set(list.map((a) => a.cover).filter(Boolean) as string[]);
  const need = list.filter((a) => !a.cover);
  const found = await settled([...new Set(need.flatMap(photoQueries))], deadline);
  return list.map((a) => {
    if (a.cover) return a;
    for (const q of photoQueries(a)) {
      const p = (found.get(q) ?? []).find((x) => !used.has(x.url));
      if (p) {
        used.add(p.url);
        return { ...a, cover: p.url, coverCredit: { credit: p.credit, license: p.license, source: p.source } };
      }
    }
    return a;
  });
}

/** Вся лента журнала: статьи из кода + записи из админки, новые сверху. */
export async function journalArticles(): Promise<Article[]> {
  const deadline = Date.now() + PHOTO_WAIT_MS;
  const posts = (await publishedPosts().catch(() => [])).map(postToArticle);
  const slugs = new Set(posts.map((p) => p.slug));
  const code = [...AUTO_NEWS, ...ARTICLES].filter((a) => !slugs.has(a.slug));
  const list = await withPhotos([...posts, ...code].sort((a, b) => b.date.localeCompare(a.date)), deadline);
  finishLater(list);
  return list;
}

export async function journalArticle(slug: string): Promise<Article | null> {
  // та же обложка, что в ленте (у каждой статьи своя)
  const hit = (await journalArticles()).find((a) => a.slug === slug);
  if (hit) return hit;
  const p = await publishedPostBySlug(slug).catch(() => null);
  if (p) return (await withPhotos([postToArticle(p)], Date.now() + PHOTO_WAIT_MS))[0];
  return null;
}
