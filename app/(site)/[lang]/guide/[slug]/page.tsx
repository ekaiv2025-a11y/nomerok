import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { RUBRICS, formatArticleDate, readingMinutes } from "@/lib/articles";
import { journalArticle, journalArticles } from "@/lib/journal";
import { ArticleGallery } from "@/components/ArticleGallery";
import { PlaceCard } from "@/components/PlaceCard";
import { geocodeMissing, placesByRefs } from "@/lib/places-db";
import { after } from "next/server";
import { Map } from "@/components/map/Map";
import { placeAddr, placeName } from "@/lib/places";
import { QUICK } from "@/lib/phones";
import { SITE_URL } from "@/lib/site";

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
  const refs = a.body.flatMap((b) => ("places" in b ? b.places : []));
  const placeList = refs.length ? await placesByRefs(refs) : [];
  // У мест подборки нет точки на карте — ищем координаты по адресу в фоне (страница не ждёт)
  const noGeo = placeList.filter((x) => x.lat == null && !x.geo_tried).map((x) => x.id);
  if (noGeo.length) after(() => geocodeMissing(noGeo.length, noGeo).catch(() => undefined));
  let placeN = 0;
  const same = ARTICLES.filter((x) => x.slug !== a.slug && x.rubric === a.rubric);
  const others = [...same, ...ARTICLES.filter((x) => x.slug !== a.slug && x.rubric !== a.rubric)].slice(0, 4);
  const rub = RUBRICS[a.rubric ?? "home"];
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: a.h1, description: a.description, datePublished: a.date, inLanguage: "ru", mainEntityOfPage: `${SITE_URL}/ru/guide/${a.slug}`, dateModified: a.date, author: { "@type": "Organization", name: "Редакция NomerOk" }, publisher: { "@type": "Organization", name: "NomerOk.ge" } },
    ...(a.faq?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
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
        Редакция NomerOk · {formatArticleDate(a.date)} · {readingMinutes(a)} мин чтения
      </p>
      {a.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.cover} alt="" className="mt-5 max-h-[420px] w-full rounded-2xl object-cover" />
      )}
      {a.lead && <p className="mt-4 text-[17px] leading-relaxed text-[#3a3935]">{a.lead}</p>}

      <article className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#2a2925]">
        {a.body.map((b, i) => {
          if ("h2" in b) return <h2 key={i} className="pt-3 text-[21px] font-bold text-ink">{b.h2}</h2>;
          if ("p" in b) return <p key={i}>{b.p}</p>;
          if ("list" in b) {
            const L = b.ordered ? "ol" : "ul";
            return (
              <L key={i} className={`space-y-1.5 pl-6 ${b.ordered ? "list-decimal" : "list-disc"} marker:text-brand`}>
                {b.list.map((x, j) => <li key={j}>{x}</li>)}
              </L>
            );
          }
          if ("tip" in b) return <p key={i} className="rounded-2xl border border-[#f0d58a] bg-[#fff8e6] p-4 text-[15px]">💡 {b.tip}</p>;
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

      {a.source && (
        <p className="mt-6 text-[14px] text-muted">
          Источник:{" "}
          <a href={a.source.url} target="_blank" rel="noopener noreferrer nofollow" className="text-brand underline">
            {a.source.name}
          </a>
        </p>
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



      {others.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[18px] font-bold">Читайте также</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {others.map((o) => (
              <Link key={o.slug} href={href(lang, `/guide/${o.slug}`)} className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] hover:border-brand">
                {o.emoji} {o.h1}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
