import type { Article } from "./articles";

/* Перекрёстные ссылки в журнале: город статьи и «Читайте также» по общим темам. */

const CITY_WORDS: [string, RegExp][] = [
  ["tbilisi", /tbilisi|тбилис/i],
  ["batumi", /batumi|батум/i],
  ["kutaisi", /kutaisi|кутаис/i],
  ["rustavi", /rustavi|рустав/i],
  ["kobuleti", /kobuleti|кобулет/i],
  ["zugdidi", /zugdidi|зугдид/i],
  ["poti", /\bpoti\b|-poti|поти\b/i],
  ["gori", /\bgori\b|-gori|\bгори\b/i],
  ["telavi", /telavi|телав/i],
  ["borjomi", /borjomi|боржом/i],
];

/** Город статьи: указан явно (автоновости) или угадывается по адресу/заголовку («…-batumi», «в Тбилиси»). */
export function articleCity(a: Pick<Article, "slug" | "title"> & { city?: string | null }): string | null {
  if (a.city) return a.city;
  for (const [id, re] of CITY_WORDS) if (re.test(a.slug) || re.test(a.title)) return id;
  return null;
}

const fresh = (a: Article) => {
  const days = (Date.now() - Date.parse(a.date)) / 86400_000;
  return days < 3 ? 2 : days < 14 ? 1 : 0;
};

/** «Читайте также»: общие разделы каталога, тот же город, та же рубрика, свежесть. Новости одна за другой не идут — в подборке разные рубрики. */
export function relatedArticles(a: Article, all: Article[], n = 6): Article[] {
  const city = articleCity(a);
  const cats = new Set(a.cats ?? []);
  const scored = all
    .filter((x) => x.slug !== a.slug)
    .map((x) => {
      let s = 0;
      let shared = 0;
      for (const c of x.cats ?? []) if (cats.has(c)) shared++;
      s += Math.min(2, shared) * 2;
      const xc = articleCity(x);
      if (city && xc === city) s += 6;
      else if (city && xc && xc !== city) s -= 2; // статья про другой город — ниже
      if (x.rubric === a.rubric) s += 1;
      if ((x.rubric === "news" || x.rubric === "events") && s > 1) s += fresh(x); // свежесть — только если по теме или городу
      if (x.cover) s += 0.5;
      return { x, s };
    })
    .sort((p, q) => q.s - p.s || q.x.date.localeCompare(p.x.date));
  // разнообразие: не больше 2 новостей и 3 статей одной рубрики
  const out: Article[] = [];
  const per: Record<string, number> = {};
  for (const { x } of scored) {
    const r = x.rubric ?? "home";
    if ((per[r] ?? 0) >= (r === "news" ? 2 : 3)) continue;
    per[r] = (per[r] ?? 0) + 1;
    out.push(x);
    if (out.length >= n) break;
  }
  return out;
}
