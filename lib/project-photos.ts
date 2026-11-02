import "server-only";
import { CITY_PHOTO_QUERY, commonsPhotos, type CommonsPhoto } from "./commons";
import { PROJECTS, type Project } from "./projects";
import { allProjectMedia } from "./project-media";

/*
 * Обложки новостроек: фото района или города с Wikimedia Commons (свободная лицензия, автор подписан).
 * Рендеры и фото застройщиков не берём. У разных ЖК — разные фото, даже если запрос одинаковый.
 */
const PLACE_Q: Record<string, string> = { Гудаури: "Gudauri ski resort", Бакуриани: "Bakuriani", Гонио: "Gonio Georgia", Махинджаури: "Makhinjauri", Кобулети: "Kobuleti" };
const queries = (p: Project) => [...new Set([p.photo?.q, p.city ? CITY_PHOTO_QUERY[p.city] : null, p.place ? PLACE_Q[p.place] ?? `${p.place} Georgia` : null, "Batumi skyline", "Tbilisi panorama"].filter(Boolean) as string[])];

/** Фото, загруженные в админке (свои или с разрешения), важнее фото района с Commons. */
export async function projectPhotos(wait = 1200): Promise<Map<string, CommonsPhoto>> {
  const own = await allProjectMedia().catch(() => new globalThis.Map<string, never>());
  const out = new Map<string, CommonsPhoto>();
  for (const [slug, m] of own) if (m.photos[0]) out.set(slug, { url: m.photos[0], credit: m.credit ?? "NomerOk", license: "", source: "", title: "own" });
  const found = new Map<string, CommonsPhoto[]>();
  const all = [...new Set(PROJECTS.flatMap(queries))].map((q) => commonsPhotos(q).then((l) => (l ? found.set(q, l) : null)).catch(() => null));
  await Promise.race([Promise.all(all), new Promise((r) => setTimeout(r, wait))]);
  const used = new Set<string>();
  for (const p of PROJECTS) {
    if (out.has(p.slug)) continue;
    for (const q of queries(p)) {
      const ph = (found.get(q) ?? []).find((x) => !used.has(x.url));
      if (ph) {
        used.add(ph.url);
        out.set(p.slug, ph);
        break;
      }
    }
  }
  return out;
}
