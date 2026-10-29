/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { GEO, MONTHS, cap, geoPage } from "@/lib/geo";
import { geoPhoto } from "@/lib/geo-photo";
import { GeoBlocks } from "@/components/geo/GeoBlocks";
import { Map as MapView } from "@/components/map/Map";
import { listPublishedMasters } from "@/lib/db";
import { placeCounts } from "@/lib/places-db";
import { PLACE_CATS } from "@/lib/places";
import { journalArticles } from "@/lib/journal";
import { articleCity } from "@/lib/related";
import { formatArticleDate } from "@/lib/articles";
import { categoryPlural } from "@/lib/categories";
import { CategoryIcon } from "@/lib/category-icons";
import { isCity } from "@/lib/cities";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ lang: string; id: string }> };

export function generateStaticParams() {
  return GEO.map((g) => ({ lang: "ru", id: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const g = geoPage(id);
  if (lang !== "ru" || !g) return {};
  return pageMeta("ru", `/georgia/${g.id}`, g.title, g.description);
}

export default async function GeoCityPage({ params }: Props) {
  const { lang, id } = await params;
  const g = geoPage(id);
  if (lang !== "ru" || !g) notFound();
  const deadline = Date.now() + 1500;
  const siteCity = isCity(g.id) ? g.id : null;
  const [cover, sightPhotos, masters, pc, arts] = await Promise.all([
    geoPhoto(g.photo.q, deadline),
    Promise.all((g.sights ?? []).map((s) => geoPhoto(s.photo, deadline))),
    siteCity ? listPublishedMasters().catch(() => []) : Promise.resolve([]),
    siteCity ? placeCounts(siteCity).catch(() => ({}) as Record<string, number>) : Promise.resolve({} as Record<string, number>),
    journalArticles().catch(() => []),
  ]);
  // специалисты города по направлениям
  const inCity = masters.filter((m) => !m.demo && m.city === g.id);
  const byCat = new Map<string, number>();
  for (const m of inCity) for (const c of new Set([m.category, ...m.extra_categories])) byCat.set(c, (byCat.get(c) ?? 0) + 1);
  const topCats = [...byCat.entries()].filter(([c]) => c !== "other").sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topPlaces = PLACE_CATS.filter((c) => pc[c.id]).sort((a, b) => (pc[b.id] ?? 0) - (pc[a.id] ?? 0)).slice(0, 8);
  const news = arts.filter((a) => (a.city ?? articleCity(a)) === g.id).slice(0, 6);
  const self = `/ru/georgia/${g.id}`;
  const specHref = (cat?: string) => (g.id === "batumi" && cat ? href("ru", `/services/${cat}`) : href("ru", `/?city=${g.id}${cat ? `&cat=${cat}` : ""}#masters`));

  const nav = [
    ["about", "О городе"],
    ...(g.climate ? [["weather", "Погода"]] : []),
    ...(g.districts?.length ? [["districts", "Районы"]] : []),
    ...g.sections.filter((s) => s.id !== "about").map((s) => [s.id, s.title]),
    ...(g.sights?.length ? [["sights", "Что посмотреть"]] : []),
    ...(siteCity ? [["masters", "Специалисты"], ["places", "Места"]] : []),
    ...(news.length ? [["news", "Новости"]] : []),
    ...(g.faq?.length ? [["faq", "Вопросы"]] : []),
  ] as [string, string][];

  const about = g.sections.find((s) => s.id === "about");
  const rest = g.sections.filter((s) => s.id !== "about");
  const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <h2 id={id} className="scroll-mt-28 text-[22px] font-bold sm:text-[26px]">
      {children}
    </h2>
  );
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Грузия", item: `${SITE_URL}/ru/georgia` },
        { "@type": "ListItem", position: 2, name: g.name, item: `${SITE_URL}${self}` },
      ],
    },
    ...(g.faq?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: g.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
  ];

  return (
    <div className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {/* шапка */}
      <section className="relative">
        <div className="relative h-[300px] w-full overflow-hidden bg-[#dfe9ee] sm:h-[420px]">
          {cover && <img src={cover.url} alt={g.photo.alt} className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-6 text-white sm:px-6 sm:pb-10">
            <nav className="text-[13px] opacity-90">
              <Link href={href("ru", "/georgia")} className="hover:underline">
                Грузия
              </Link>
              {g.region ? ` · ${g.region}` : ""}
            </nav>
            <h1 className="mt-1 text-[34px] font-bold leading-tight sm:text-[52px]">{g.name}</h1>
            <p className="mt-1 max-w-2xl text-[15px] opacity-95 sm:text-[17px]">Путеводитель для жизни и отдыха</p>
          </div>
        </div>
        {cover && (
          <p className="mx-auto max-w-6xl px-4 pt-1 text-[11px] text-muted sm:px-6">
            Фото:{" "}
            <a href={cover.source} target="_blank" rel="noopener noreferrer nofollow" className="underline">
              {cover.credit}
            </a>
            , {cover.license}, Wikimedia Commons
          </p>
        )}
      </section>

      {/* меню разделов */}
      <nav className="sticky top-[60px] z-20 border-b border-line bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6" style={{ scrollbarWidth: "none" }}>
          {nav.map(([id, t]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium hover:border-brand hover:text-brand">
              {t}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-12">
            <section>
              <H2 id="about">О городе</H2>
              <p className="mt-3 text-[17px] leading-relaxed text-[#3a3935]">{g.lead}</p>
              {about && (
                <div className="mt-4">
                  <GeoBlocks blocks={about.blocks} self={self} />
                </div>
              )}
            </section>

            {g.climate && (
              <section>
                <H2 id="weather">Погода по месяцам</H2>
                <p className="mt-2 text-[14px] text-muted">Средние значения: днём / ночью, температура моря и дождливые дни. Нажмите на месяц — там подробно, что делать и что надеть.</p>
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {g.climate.months.map((m, i) => (
                    <Link key={i} href={href("ru", `/georgia/${g.id}/weather/${MONTHS[i].slug}`)} className="rounded-2xl border border-line bg-white p-3 transition hover:border-brand hover:shadow-sm">
                      <p className="text-[13px] font-semibold">{cap(MONTHS[i].name)}</p>
                      <p className="mt-1 text-[18px] font-bold">
                        {Math.round(m.tmax)}° <span className="text-[14px] font-medium text-muted">/ {Math.round(m.tmin)}°</span>
                      </p>
                      {m.sea != null && <p className="text-[12px] text-[#2a7ab0]">🌊 море {Math.round(m.sea)}°</p>}
                      <p className="text-[12px] text-muted">☔ {m.rainDays} дн.</p>
                    </Link>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-muted">
                  Источник:{" "}
                  <a href={g.climate.source.url} target="_blank" rel="noopener noreferrer nofollow" className="underline">
                    {g.climate.source.name}
                  </a>
                  .{" "}
                  <Link href={href("ru", `/georgia/${g.id}/weather`)} className="text-brand underline">
                    Погода {g.nameIn} по месяцам — таблица
                  </Link>
                </p>
              </section>
            )}

            {g.districts?.length ? (
              <section>
                <H2 id="districts">Районы {g.nameGen}</H2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {g.districts.map((d) => (
                    <div key={d.name} className="rounded-2xl border border-line bg-white p-4">
                      <p className="text-[16px] font-bold">{d.name}</p>
                      <p className="mt-1 text-[14.5px] leading-relaxed text-[#3a3935]">{d.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {rest.map((s) => (
              <section key={s.id}>
                <H2 id={s.id}>
                  {s.emoji ? `${s.emoji} ` : ""}
                  {s.title}
                </H2>
                <div className="mt-4">
                  <GeoBlocks blocks={s.blocks} self={self} />
                </div>
              </section>
            ))}

            {g.sights?.length ? (
              <section>
                <H2 id="sights">Что посмотреть {g.nameIn}</H2>
                {g.sights.some((s) => s.lat != null) && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white p-2">
                    <MapView
                      height={340}
                      points={g.sights.flatMap((s, k) => (s.lat != null && s.lng != null ? [{ lat: s.lat, lng: s.lng, label: k + 1, title: `${k + 1}. ${s.name}` }] : []))}
                    />
                  </div>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {g.sights.map((s, k) => {
                    const ph = sightPhotos[k];
                    const inner = (
                      <>
                        <div className="relative aspect-[16/9] bg-cream">
                          {ph && <img src={ph.url} alt={s.name} loading="lazy" className="h-full w-full object-cover" />}
                          <span className="absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-brand px-2 text-[13px] font-bold text-white">{k + 1}</span>
                        </div>
                        <div className="p-4">
                          <p className="text-[16px] font-bold">{s.name}</p>
                          <p className="mt-1 text-[14.5px] leading-relaxed text-[#3a3935]">{s.text}</p>
                          {s.guide && <p className="mt-2 text-[14px] font-semibold text-brand">Подробнее: как добраться →</p>}
                          {ph && <p className="mt-2 text-[11px] text-muted">Фото: {ph.credit}, {ph.license}</p>}
                        </div>
                      </>
                    );
                    return s.guide ? (
                      <Link key={s.name} href={href("ru", `/guide/${s.guide}`)} className="overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand hover:shadow-sm">
                        {inner}
                      </Link>
                    ) : (
                      <div key={s.name} className="overflow-hidden rounded-2xl border border-line bg-white">
                        {inner}
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {siteCity && (
              <section>
                <H2 id="masters">Специалисты {g.nameIn}</H2>
                <p className="mt-2 text-[15px] text-muted">
                  {inCity.length ? `${inCity.length} специалистов с фото работ, отзывами и прямыми контактами — без посредников.` : "Каталог только наполняется."}
                </p>
                {topCats.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {topCats.map(([c, n]) => (
                      <Link key={c} href={specHref(c)} className="flex items-center gap-2.5 rounded-2xl border border-line bg-white p-3 hover:border-brand">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                          <CategoryIcon id={c} className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-semibold">{categoryPlural(c, "ru")}</span>
                          <span className="text-[12px] text-muted">{n}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={specHref()} className="btn-primary h-11 px-5 text-[14px]">
                    Все специалисты {g.nameIn}
                  </Link>
                  <Link href={href("ru", `/request${g.id !== "batumi" ? `?city=${g.id}` : ""}`)} className="btn-ghost h-11 px-5 text-[14px]">
                    Оставить заявку
                  </Link>
                </div>
              </section>
            )}

            {siteCity && topPlaces.length > 0 && (
              <section>
                <H2 id="places">Полезные места {g.nameGen}</H2>
                <p className="mt-2 text-[15px] text-muted">Адреса, телефоны и часы работы: клиники и аптеки, Дом юстиции, школы, кафе, магазины.</p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {topPlaces.map((c) => (
                    <Link key={c.id} href={href("ru", `/places/c/${c.id}?city=${g.id}`)} className="rounded-2xl border border-line bg-white p-3 hover:border-brand">
                      <span className="text-[22px]" aria-hidden>
                        {c.emoji}
                      </span>
                      <span className="mt-1 block text-[13.5px] font-semibold leading-snug">{c.label.ru}</span>
                      <span className="text-[12px] text-muted">{pc[c.id]}</span>
                    </Link>
                  ))}
                </div>
                <Link href={href("ru", `/places?city=${g.id}`)} className="mt-3 inline-block text-[14px] font-semibold text-brand hover:underline">
                  Все места {g.nameGen} →
                </Link>
              </section>
            )}

            {news.length > 0 && (
              <section>
                <H2 id="news">Новости и статьи: {g.name}</H2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {news.map((a) => (
                    <Link key={a.slug} href={href("ru", `/guide/${a.slug}`)} className="flex gap-3 rounded-2xl border border-line bg-white p-3 hover:border-brand">
                      {a.cover ? <img src={a.cover} alt="" loading="lazy" className="h-16 w-24 shrink-0 rounded-xl object-cover" /> : <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-cream text-[26px]">{a.emoji}</span>}
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-[14.5px] font-semibold leading-snug">{a.h1}</span>
                        <span className="text-[12px] text-muted">{formatArticleDate(a.date)}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {g.faq?.length ? (
              <section>
                <H2 id="faq">Частые вопросы</H2>
                <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
                  {g.faq.map((f) => (
                    <details key={f.q} className="group p-4">
                      <summary className="cursor-pointer list-none text-[16px] font-semibold marker:hidden">
                        <span className="mr-2 text-brand group-open:rotate-90">›</span>
                        {f.q}
                      </summary>
                      <p className="mt-2 text-[15px] leading-relaxed text-[#3a3935]">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}

            <p className="text-[13px] text-muted">
              Источники:{" "}
              {g.sources.map((s, k) => (
                <span key={s.url}>
                  {k > 0 && ", "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="underline">
                    {s.name}
                  </a>
                </span>
              ))}
              . Обновлено: {formatArticleDate(g.updated)}. Нашли неточность —{" "}
              <Link href={href("ru", "/contacts")} className="text-brand underline">
                напишите нам
              </Link>
              .
            </p>
          </div>

          {/* боковая колонка: факты */}
          <aside className="lg:sticky lg:top-[120px] lg:self-start">
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="text-[15px] font-bold">Коротко</p>
              <dl className="mt-2 space-y-2 text-[14px]">
                {g.facts.map((f) => (
                  <div key={f.k}>
                    <dt className="text-[12px] text-muted">{f.k}</dt>
                    <dd className="font-medium">{f.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {siteCity && (
              <div className="mt-3 rounded-2xl bg-brand-soft p-4">
                <p className="text-[15px] font-bold text-brand-dark">Нужен мастер {g.nameIn}?</p>
                <p className="mt-1 text-[13.5px] text-[#3d5a4c]">Опишите задачу — специалисты откликнутся сами. Бесплатно.</p>
                <Link href={href("ru", `/request${g.id !== "batumi" ? `?city=${g.id}` : ""}`)} className="btn-primary mt-3 h-10 w-full px-4 text-[14px]">
                  Оставить заявку
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
