import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { RUBRICS, formatArticleDate, readingMinutes } from "@/lib/articles";
import { journalArticle, journalArticles } from "@/lib/journal";
import { ArticleGallery } from "@/components/ArticleGallery";
import { ArticleViewTracker } from "@/components/ArticleViewTracker";
import { articleViews } from "@/lib/article-views";
import { posStyle } from "@/lib/photo-pos";
import { PlaceCard } from "@/components/PlaceCard";
import { geocodeMissing, placesByRefs } from "@/lib/places-db";
import { after } from "next/server";
import { Map } from "@/components/map/Map";
import { placeAddr, placeName } from "@/lib/places";
import { QUICK } from "@/lib/phones";
import { SITE_URL } from "@/lib/site";
import { articleCity, relatedArticles } from "@/lib/related";
import { makeLinker } from "@/lib/autolink";
import { categoryLabel, CATEGORIES } from "@/lib/categories";
import { cityIn, cityLabel, isCity } from "@/lib/cities";

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const a = lang === "ru" ? await journalArticle(slug) : null;
  if (!a) return { robots: { index: false } };
  const base = pageMeta("ru", `/guide/${a.slug}`, a.title, a.description);
  return { ...base, alternates: { canonical: `/ru/guide/${a.slug}` }, openGraph: { ...base.openGraph, type: "article" } };
}

export default async function ArticlePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || lang !== "ru") notFound();
  const a = await journalArticle(slug);
  if (!a) notFound();
  const ARTICLES = await journalArticles();
  const views = (await articleViews([a.slug]).catch(() => ({}) as Record<string, number>))[a.slug] ?? 0;
  const refs = a.body.flatMap((b) => ("places" in b ? b.places : []));
  const placeList = refs.length ? await placesByRefs(refs) : [];
  // У мест подборки нет точки на карте — ищем координаты по адресу в фоне (страница не ждёт)
  const noGeo = placeList.filter((x) => x.lat == null && !x.geo_tried).map((x) => x.id);
  if (noGeo.length) after(() => geocodeMissing(noGeo.length, noGeo).catch(() => undefined));
  let placeN = 0;
  const others = relatedArticles(a, ARTICLES, 6);
  // ссылки в тексте: [текст](/ru/…) и автоссылки на статьи и разделы каталога
  const linkify = makeLinker(`/ru/guide/${a.slug}`);
  const city = articleCity(a);
  const cityOk = isCity(city) ? city : null;
  const topicCats = (a.cats ?? []).filter((c) => CATEGORIES.some((x) => x.id === c)).slice(0, 4);
  // городская статья «Мастера и быт» для этого города — ссылка из новостей
  const cityGuide = cityOk ? ARTICLES.find((x) => x.slug === `mastera-i-byt-${cityOk}` && x.slug !== a.slug) : null;
  const rub = RUBRICS[a.rubric ?? "home"];
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: a.h1, description: a.description, datePublished: a.date, inLanguage: "ru", mainEntityOfPage: `${SITE_URL}/ru/guide/${a.slug}`, dateModified: a.date, author: { "@type": "Organization", name: "Редакция NomerOk" }, publisher: { "@type": "Organization", name: "NomerOk.ge" } },
    ...(a.faq?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ArticleViewTracker slug={a.slug} />
      <nav className="flex flex-wrap items-center gap-2 text-[14px] text-muted">
        <Link href={href(lang, "/guide")} className="hover:text-brand">
          ← Журнал
        </Link>
        <span>·</span>
        <Link href={href(lang, `/guide?r=${a.rubric}`)} className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[13px] font-medium text-brand-dark hover:underline">
          {rub.emoji} {rub.label}
        </Link>
      </nav>
      <h1 className="mt-3 text-[26px] font-bold leading-tight sm:text-[34px]">
        {a.emoji} {a.h1}
      </h1>
      <p className="mt-2 text-[13px] text-muted">
        Редакция NomerOk · {formatArticleDate(a.date)} · {readingMinutes(a)} мин чтения{views > 0 ? ` · 👁 ${views}` : ""}
      </p>
      {a.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.cover} alt="" className="mt-5 h-[260px] w-full rounded-2xl object-cover sm:h-[380px]" style={posStyle(a.cover)} />
      )}
      {a.cover && a.coverCredit && (
        <p className="mt-1.5 text-[12px] text-muted">
          Фото:{" "}
          <a href={a.coverCredit.source} target="_blank" rel="noopener noreferrer nofollow" className="underline">
            {a.coverCredit.credit}
          </a>
          , {a.coverCredit.license}, Wikimedia Commons. Иллюстрация, не снимок события.
        </p>
      )}
      {a.lead && <p className="mt-4 text-[17px] leading-relaxed text-[#3a3935]">{a.lead}</p>}

      <article className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#2a2925]">
        {a.body.map((b, i) => {
          if ("h2" in b) return <h2 key={i} className="pt-3 text-[21px] font-bold text-ink">{b.h2}</h2>;
          if ("p" in b) return <p key={i} className="whitespace-pre-line">{linkify(b.p)}</p>;
          if ("list" in b) {
            const L = b.ordered ? "ol" : "ul";
            return (
              <L key={i} className={`space-y-1.5 pl-6 ${b.ordered ? "list-decimal" : "list-disc"} marker:text-brand`}>
                {b.list.map((x, j) => <li key={j}>{typeof x === "string" ? linkify(x) : x}</li>)}
              </L>
            );
          }
          if ("tip" in b) return <p key={i} className="rounded-2xl border border-[#f0d58a] bg-[#fff8e6] p-4 text-[15px]">💡 {linkify(b.tip)}</p>;
          if ("phones" in b)
            return (
              <div key={i} className="rounded-2xl bg-cream p-4">
                <p className="text-[14px] font-semibold">Номера, которые стоит сохранить:</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {QUICK.map((q) => (
                    <a key={q.dial} href={`tel:${q.dial}`} className="rounded-xl bg-white px-3 py-2 text-[13px] hover:shadow-sm">
                      <span className="text-muted">{q.icon} {q.label.ru}</span>
                      <span className="block whitespace-nowrap font-bold">{q.show}</span>
                    </a>
                  ))}
                </div>
                <Link href={href(lang, "/phones")} className="mt-2 inline-block text-[14px] font-semibold text-brand hover:underline">
                  Все полезные телефоны Батуми →
                </Link>
              </div>
            );
          if ("map" in b) {
            const pts = b.map.map((x, k) => ({ lat: x.lat, lng: x.lng, label: k + 1, title: `${k + 1}. ${x.name}`, subtitle: x.note }));
            return (
              <div key={i} className="rounded-2xl border border-line bg-white p-2">
                <Map height={380} points={pts} />
                <ol className="space-y-1 px-3 pb-2 pt-3 text-[14px]">
                  {b.map.map((x, k) => (
                    <li key={k} className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">{k + 1}</span>
                      <span>
                        <b>{x.name}</b>
                        {x.note ? <span className="text-muted"> — {x.note}</span> : null}{" "}
                        <a href={`https://www.google.com/maps/search/?api=1&query=${x.lat},${x.lng}`} target="_blank" rel="noopener noreferrer nofollow" className="whitespace-nowrap text-brand underline">
                          маршрут
                        </a>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          }
          if ("event" in b) {
            const e = b.event;
            const mapQ = encodeURIComponent(`${e.venue}, ${e.address}`);
            return (
              <div key={i} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
                <p className="text-[13px] font-semibold uppercase tracking-wide text-brand">{e.when}</p>
                <p className="mt-1 text-[18px] font-bold leading-snug">{e.title}</p>
                {e.what && <p className="mt-1 text-[15px] text-[#3a3935]">{e.what}</p>}
                <p className="mt-2 text-[14px]">
                  📍 <b>{e.venue}</b>, {e.address}{" "}
                  <a href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`} target="_blank" rel="noopener noreferrer nofollow" className="whitespace-nowrap text-brand underline">
                    на карте
                  </a>
                </p>
                {e.organizer && <p className="mt-1 text-[14px] text-muted">Организатор: {e.organizer}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5 text-[13px]">
                  {e.price && <span className="rounded-full bg-brand-soft px-2.5 py-1 font-semibold text-brand-dark">🎟 {e.price}</span>}
                  {e.age && <span className="rounded-full bg-cream px-2.5 py-1">{e.age}</span>}
                </div>
                {e.note && <p className="mt-2 text-[13px] text-muted">ℹ️ {e.note}</p>}
                {(e.buy || e.info) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {e.buy && (
                      <a href={e.buy} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary h-10 px-4 text-[14px]">
                        Купить билет
                      </a>
                    )}
                    {e.info && (
                      <a href={e.info} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost h-10 px-4 text-[14px]">
                        Подробнее
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          }
          if ("spot" in b) {
            const e = b.spot;
            const mapQ = e.lat != null && e.lng != null ? `${e.lat},${e.lng}` : encodeURIComponent(`${e.name}, ${e.address}`);
            return (
              <div key={i} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
                {e.opened && <p className="text-[13px] font-semibold uppercase tracking-wide text-brand">🆕 {e.opened}</p>}
                <p className="mt-1 text-[18px] font-bold leading-snug">{e.name}</p>
                <p className="mt-1 text-[15px] text-[#3a3935]">{linkify(e.what)}</p>
                <p className="mt-2 text-[14px]">
                  📍 {e.address}{" "}
                  <a href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`} target="_blank" rel="noopener noreferrer nofollow" className="whitespace-nowrap text-brand underline">
                    на карте
                  </a>
                </p>
                {(e.hours || e.price) && (
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[13px]">
                    {e.hours && <span className="rounded-full bg-cream px-2.5 py-1">🕘 {e.hours}</span>}
                    {e.price && <span className="rounded-full bg-brand-soft px-2.5 py-1 font-semibold text-brand-dark">{e.price}</span>}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-[14px]">
                  {e.site && (
                    <a href={e.site} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost h-9 px-4 text-[13px]">
                      Сайт
                    </a>
                  )}
                  {e.ig && (
                    <a href={e.ig} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost h-9 px-4 text-[13px]">
                      Instagram
                    </a>
                  )}
                  <a href={e.src} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex h-9 items-center text-[13px] text-muted underline">
                    Источник
                  </a>
                </div>
              </div>
            );
          }
          if ("img" in b)
            return (
              <figure key={i} className="overflow-hidden rounded-2xl bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.img} alt={b.alt} loading="lazy" className="w-full object-cover" />
                <figcaption className="px-4 py-2 text-[12px] text-muted">
                  {b.alt}. Фото: {b.credit},{" "}
                  <a href={b.source} target="_blank" rel="noopener noreferrer nofollow" className="underline">
                    {b.license}
                  </a>
                </figcaption>
              </figure>
            );
          if ("places" in b) {
            const ps = b.places.map((r) => placeList.find((x) => x.id === r || x.slug === r)).filter((x): x is NonNullable<typeof x> => !!x);
            const start = placeN;
            const pts = ps
              .map((x, k) => ({ x, n: start + k + 1 }))
              .filter(({ x }) => x.lat != null && x.lng != null)
              .map(({ x, n }) => ({ lat: x.lat!, lng: x.lng!, label: n, title: `${n}. ${placeName(x, lang)}`, subtitle: placeAddr(x, lang) ?? undefined, href: href(lang, `/places/${x.slug}`) }));
            return (
              <div key={i} className="space-y-3">
                {pts.length > 0 && (
                  <div className="rounded-2xl border border-line bg-white p-2">
                    <Map height={360} points={pts} />
                    <p className="px-2 pb-1 pt-2 text-[13px] text-muted">
                      📍 Номер на карте = номер в списке ниже. Нажмите на кружок, чтобы увидеть название; колесо мыши — приблизить или отдалить.
                      {pts.length < ps.length ? ` На карте ${pts.length} из ${ps.length} — у остальных точный адрес уточняется.` : ""}
                    </p>
                  </div>
                )}
                {ps.map((x) => (
                  <div key={x.id} id={`p-${++placeN}`} className="scroll-mt-24">
                    <PlaceCard p={x} lang={lang} n={placeN} wide />
                  </div>
                ))}
              </div>
            );
          }
          if ("link" in b)
            return (
              <Link key={i} href={href(lang, b.href)} className="flex items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-4 text-[16px] font-semibold text-white hover:bg-brand-dark">
                {b.link} <span aria-hidden>→</span>
              </Link>
            );
          return (
            <Link key={i} href={href(lang, `/services/${b.cat}`)} className="flex items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-4 text-[16px] font-semibold text-white hover:bg-brand-dark">
              {b.cta} <span aria-hidden>→</span>
            </Link>
          );
        })}
      </article>

      {a.photos && a.photos.length > 0 && <ArticleGallery photos={a.photos} />}

      {a.sources && a.sources.length > 1 ? (
        <p className="mt-6 text-[14px] text-muted">
          Источники:{" "}
          {a.sources.map((s, k) => (
            <span key={s.url}>
              {k > 0 && ", "}
              <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-brand underline">
                {s.name}
              </a>
            </span>
          ))}
        </p>
      ) : (
        a.source && (
          <p className="mt-6 text-[14px] text-muted">
            Источник:{" "}
            <a href={a.source.url} target="_blank" rel="noopener noreferrer nofollow" className="text-brand underline">
              {a.source.name}
            </a>
          </p>
        )
      )}

      {a.faq && a.faq.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[21px] font-bold">Частые вопросы</h2>
          <div className="mt-3 space-y-3">
            {a.faq.map((f) => (
              <details key={f.q} className="rounded-2xl border border-line bg-white p-4">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-[15px] text-[#3a3935]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}



      {(topicCats.length > 0 || cityOk) && (
        <section className="mt-10 rounded-2xl bg-brand-soft p-5">
          <h2 className="text-[18px] font-bold">🔎 Специалисты по теме{cityOk ? ` ${cityIn(cityOk, "ru")}` : ""}</h2>
          <p className="mt-1 text-[14px] text-[#3d5a4c]">Фото работ, цены и отзывы — связывайтесь напрямую или оставьте заявку.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topicCats.map((c) => (
              <Link key={c} href={href(lang, cityOk && cityOk !== "batumi" ? `/?city=${cityOk}&cat=${c}#masters` : `/services/${c}`)} className="rounded-full bg-white px-3.5 py-1.5 text-[14px] font-medium text-brand-dark hover:shadow-sm">
                {categoryLabel(c, "ru")}
              </Link>
            ))}
            <Link href={href(lang, cityOk ? `/?city=${cityOk}#masters` : "/#masters")} className="rounded-full bg-brand px-3.5 py-1.5 text-[14px] font-semibold text-white">
              Все специалисты{cityOk ? ` ${cityIn(cityOk, "ru")}` : ""} →
            </Link>
          </div>
        </section>
      )}

      {(cityOk || cityGuide) && (
        <div className="mt-4 flex flex-wrap gap-2 text-[14px]">
          {cityOk && (
            <Link href={href(lang, `/guide?r=news&c=${["tbilisi", "batumi", "kutaisi"].includes(cityOk) ? cityOk : "regions"}`)} className="rounded-full border border-line px-3.5 py-1.5 hover:border-brand">
              📰 Ещё новости: {cityLabel(cityOk, "ru")}
            </Link>
          )}
          {cityGuide && (
            <Link href={href(lang, `/guide/${cityGuide.slug}`)} className="rounded-full border border-line px-3.5 py-1.5 hover:border-brand">
              🏙 {cityGuide.h1}
            </Link>
          )}
        </div>
      )}

      {others.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[20px] font-bold">Читайте также</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <Link key={o.slug} href={href(lang, `/guide/${o.slug}`)} className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-md">
                <span className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br ${RUBRICS[o.rubric ?? "home"].bg}`}>
                  {o.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={posStyle(o.cover)} />
                  ) : (
                    <span className="text-[44px]" aria-hidden>
                      {o.emoji}
                    </span>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-semibold">
                    {RUBRICS[o.rubric ?? "home"].emoji} {RUBRICS[o.rubric ?? "home"].label}
                  </span>
                </span>
                <span className="block p-3 text-[15px] font-semibold leading-snug group-hover:text-brand">{o.h1}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
