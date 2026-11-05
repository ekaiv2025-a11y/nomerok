import type { Metadata } from "next";
import Link from "next/link";
import { href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { PLACE_CATS, PT, placesH1 } from "@/lib/places";
import { PlaceCityChips } from "@/components/PlaceCityChips";
import { isCity } from "@/lib/cities";
import { listPlaces, placeCityCounts, placeCounts } from "@/lib/places-db";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceSearch } from "@/components/PlaceSearch";
import { journalArticles } from "@/lib/journal";
import { articleCity } from "@/lib/related";
import { cityLabel } from "@/lib/cities";

export const dynamic = "force-dynamic";

type Props = LangParams & { searchParams: Promise<{ q?: string; page?: string; city?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const lang = await langOf(params);
  const { q, city } = await searchParams;
  const c = isCity(city) ? city : undefined;
  const base = pageMeta(lang, "/places", c ? `${placesH1(lang, c)}: ${PT[lang].title.split(": ")[1] ?? ""}` : PT[lang].title, PT[lang].lead);
  return q || c ? { ...base, robots: { index: !q, follow: true } } : base;
}

export default async function PlacesPage({ params, searchParams }: Props) {
  const lang = await langOf(params);
  const t = PT[lang];
  const sp = await searchParams;
  const { q, page } = sp;
  const city = isCity(sp.city) ? sp.city : undefined;
  const [counts, byCity] = await Promise.all([placeCounts(city), placeCityCounts()]);
  const res = q ? await listPlaces({ q, city, page: Number(page) || 1 }) : null;
  // подборки: только про выбранный город (город берём из поля или из названия: «Тбилиси начинается с завтрака» — про Тбилиси)
  const picks = lang === "ru" ? (await journalArticles().catch(() => [])).filter((a) => a.rubric === "picks" && (!city || (articleCity(a) ?? "batumi") === city)).slice(0, 6) : [];
  const qhref = (cat: string, sub?: string) => {
    const u = new URLSearchParams({ ...(sub ? { sub } : {}), ...(city ? { city } : {}) }).toString();
    return href(lang, `/places/c/${cat}${u ? `?${u}` : ""}`);
  };
  const quick = QUICK.filter((x) => counts[x.cat]);
  const used = new Set<string>();
  const groups = GROUPS.map((g) => ({ ...g, cats: g.ids.map((id) => PLACE_CATS.find((c) => c.id === id)).filter((c): c is (typeof PLACE_CATS)[number] => !!c && !!counts[c.id]) }))
    .map((g) => (g.cats.forEach((c) => used.add(c.id)), g))
    .filter((g) => g.cats.length);
  const rest = PLACE_CATS.filter((c) => counts[c.id] && !used.has(c.id));
  if (rest.length) groups.push({ id: "other", title: OTHER, ids: [], cats: rest });
  const total = Object.values(counts).reduce((a, b) => a + (b || 0), 0);
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <section className="rounded-3xl border border-line bg-cream px-5 py-6 sm:px-8 sm:py-8">
        <h1 className="text-[28px] font-bold leading-tight sm:text-[38px]">📍 {placesH1(lang, city)}</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[17px]">{t.lead}</p>
        <div className="mt-5 max-w-2xl">
          <PlaceSearch lang={lang} q={q} city={city} />
        </div>
        <PlaceCityChips lang={lang} city={city} path="/places" counts={byCity} keep={q ? { q } : {}} />
      </section>

      {res ? (
        <section className="mt-6">
          <p className="text-[14px] text-muted">
            {t.found}: {res.total}
          </p>
          {res.items.length === 0 && <p className="mt-3 rounded-2xl bg-white p-4">{t.nothing}</p>}
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {res.items.map((p) => (
              <PlaceCard key={p.id} p={p} lang={lang} />
            ))}
          </div>
        </section>
      ) : (
        <>
          {quick.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[22px] font-bold">{QUICK_T[lang]}</h2>
              <div className="no-scrollbar -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
                {quick.map((x) => (
                  <Link key={x.label.ru} href={qhref(x.cat, x.sub)} className="flex w-[108px] shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-line bg-white px-2 py-4 text-center transition hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)] sm:w-auto">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-[26px]" aria-hidden>
                      {x.emoji}
                    </span>
                    <span className="text-[13.5px] font-semibold leading-tight">{x.label[lang]}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {picks.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[22px] font-bold">✨ {t.picks}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {picks.map((a) => (
                  <Link key={a.slug} href={href(lang, `/guide/${a.slug}`)} className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
                    <div className="relative aspect-[16/9] overflow-hidden bg-cream">
                      {a.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.cover} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[44px]">{a.emoji}</span>
                      )}
                    </div>
                    <p className="p-4 text-[15.5px] font-semibold leading-snug group-hover:text-brand">{a.h1}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-[22px] font-bold">{t.all}</h2>
              {total > 0 && <p className="text-[13px] text-muted">{COUNT_T[lang](total, city ? cityLabel(city, lang) : null)}</p>}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {groups.map((g) => (
                <div key={g.id} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
                  <p className="text-[15px] font-bold">{g.title[lang]}</p>
                  <div className="mt-2 divide-y divide-line">
                    {g.cats.map((c) => (
                      <Link key={c.id} href={href(lang, `/places/c/${c.id}${city ? `?city=${city}` : ""}`)} className="group flex items-center gap-3 py-2.5">
                        <span className="text-[22px]" aria-hidden>
                          {c.emoji}
                        </span>
                        <span className="grow text-[14.5px] font-medium group-hover:text-brand">{c.label[lang]}</span>
                        <span className="rounded-full bg-cream px-2 py-0.5 text-[12px] text-muted">{counts[c.id]}</span>
                        <span className="text-muted group-hover:text-brand">›</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
      <p className="mt-10 text-[12px] text-muted">
        {t.data}: © OpenStreetMap contributors (ODbL), Overture Maps Foundation. {t.stale}
      </p>
    </div>
  );
}

type L3 = { ru: string; en: string; ka: string };
const QUICK_T: L3 = { ru: "Быстро найти", en: "Quick find", ka: "სწრაფი ძებნა" };
const COUNT_T = {
  ru: (n: number, c: string | null) => `${n.toLocaleString("ru-RU")} мест${c ? ` · ${c}` : ""}`,
  en: (n: number, c: string | null) => `${n.toLocaleString("en-US")} places${c ? ` · ${c}` : ""}`,
  ka: (n: number, c: string | null) => `${n} ადგილი${c ? ` · ${c}` : ""}`,
};
/** Что чаще всего ищут, когда живут в городе: сразу в нужный раздел и подраздел. */
const QUICK: { cat: string; sub?: string; emoji: string; label: L3 }[] = [
  { cat: "health", sub: "Аптека", emoji: "💊", label: { ru: "Аптеки", en: "Pharmacies", ka: "აფთიაქები" } },
  { cat: "health", sub: "Клиника", emoji: "🩺", label: { ru: "Клиники", en: "Clinics", ka: "კლინიკები" } },
  { cat: "health", sub: "Стоматология", emoji: "🦷", label: { ru: "Стоматологии", en: "Dentists", ka: "სტომატოლოგია" } },
  { cat: "groceries", sub: "Супермаркет", emoji: "🛒", label: { ru: "Супермаркеты", en: "Supermarkets", ka: "სუპერმარკეტები" } },
  { cat: "finance", sub: "Обмен валют", emoji: "💱", label: { ru: "Обмен валют", en: "Currency exchange", ka: "ვალუტის გადაცვლა" } },
  { cat: "finance", sub: "Банк", emoji: "🏦", label: { ru: "Банки", en: "Banks", ka: "ბანკები" } },
  { cat: "public", sub: "Дом юстиции", emoji: "🏛", label: { ru: "Дом юстиции", en: "Public Service Hall", ka: "იუსტიციის სახლი" } },
  { cat: "public", sub: "Нотариус", emoji: "📜", label: { ru: "Нотариусы", en: "Notaries", ka: "ნოტარიუსები" } },
  { cat: "beauty", sub: "Парикмахерская", emoji: "💇", label: { ru: "Парикмахерские", en: "Hairdressers", ka: "სალონები" } },
  { cat: "auto", sub: "Автосервис", emoji: "🔧", label: { ru: "Автосервисы", en: "Car service", ka: "ავტოსერვისი" } },
  { cat: "coworking", emoji: "💻", label: { ru: "Коворкинги", en: "Coworking", ka: "კოვორკინგი" } },
  { cat: "food", emoji: "☕", label: { ru: "Кафе и рестораны", en: "Cafés & restaurants", ka: "კაფეები" } },
];
const OTHER: L3 = { ru: "Ещё", en: "More", ka: "სხვა" };
const GROUPS: { id: string; title: L3; ids: string[] }[] = [
  { id: "life", title: { ru: "🩺 Здоровье, дети, учёба", en: "🩺 Health, kids, education", ka: "🩺 ჯანმრთელობა, ბავშვები, განათლება" }, ids: ["health", "education", "kids", "sport", "beauty"] },
  { id: "docs", title: { ru: "📄 Документы и деньги", en: "📄 Documents & money", ka: "📄 დოკუმენტები და ფინანსები" }, ids: ["public", "finance", "business", "realty", "coworking", "production"] },
  { id: "food", title: { ru: "🛒 Еда и покупки", en: "🛒 Food & shopping", ka: "🛒 საკვები და შოპინგი" }, ids: ["food", "groceries", "shops", "clothes", "electronics", "flowers", "hobby"] },
  { id: "home", title: { ru: "🛠 Дом, авто, сервис", en: "🛠 Home, car, services", ka: "🛠 სახლი, ავტო, სერვისი" }, ids: ["repair", "home", "services", "auto", "rent", "delivery", "pets"] },
  { id: "fun", title: { ru: "🎭 Отдых и досуг", en: "🎭 Leisure", ka: "🎭 დასვენება" }, ids: ["stay", "culture", "tourism", "events", "media"] },
];
