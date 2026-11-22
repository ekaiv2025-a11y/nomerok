import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { FOOD_KINDS, FOOD_TAGS, FOOD_TAG_GROUPS, PLACE_CATS, PT, placesH1 } from "@/lib/places";
import { PlaceCityChips } from "@/components/PlaceCityChips";
import { catText } from "@/lib/place-cat-texts";
import { Linkified } from "@/components/Linkified";
import { cityIn, isCity } from "@/lib/cities";
import SUBS from "@/data/place-subs.json";
import { PLACES_PAGE, listPlaces, placeCityCounts, placeFacets } from "@/lib/places-db";
import { PlacesBrowser } from "@/components/PlacesBrowser";
import { PlaceSearch } from "@/components/PlaceSearch";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; cat: string }>; searchParams: Promise<{ q?: string; page?: string; kind?: string; sub?: string; tag?: string; city?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang, cat } = await params;
  const c = PLACE_CATS.find((x) => x.id === cat);
  if (!isLocale(lang) || !c) return {};
  const sp = await searchParams;
  const city = isCity(sp.city) ? sp.city : undefined;
  const tx = lang === "ru" ? await catText(cat, city) : null;
  const title = tx?.title || `${c.label[lang]} ${city ? cityIn(city, lang) : ""} — ${placesH1(lang, city)}`.replace(/\s+—/, " —");
  const base = pageMeta(lang, `/places/c/${cat}`, title, tx?.description || `${c.label[lang]}: ${PT[lang].lead}`);
  return sp.q || sp.kind || sp.sub || sp.tag || Number(sp.page) > 1 ? { ...base, robots: { index: false, follow: true } } : base;
}

export default async function PlaceCatPage({ params, searchParams }: Props) {
  const { lang, cat } = await params;
  if (!isLocale(lang)) notFound();
  const c = PLACE_CATS.find((x) => x.id === cat);
  if (!c) notFound();
  const t = PT[lang];
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const isFood = cat === "food";
  const kind = isFood ? FOOD_KINDS.find((k) => k.id === sp.kind) : undefined;
  const subs = kind ? kind.subs : sp.sub ? [sp.sub] : undefined;
  const tag = sp.tag && (FOOD_TAGS.includes(sp.tag) || /^[\p{L} -]{2,40}$/u.test(sp.tag)) ? sp.tag : undefined;
  const city = isCity(sp.city) ? sp.city : undefined;
  const [{ items, total }, byCity, facets] = await Promise.all([
    listPlaces({ cat, city, q: sp.q, page, subs, tag }),
    placeCityCounts(cat),
    isFood ? placeFacets(cat, city) : Promise.resolve({ subs: {}, tags: {} } as { subs: Record<string, number>; tags: Record<string, number> }),
  ]);
  const kindCount = (k: (typeof FOOD_KINDS)[number]) => k.subs.reduce((n, x) => n + (facets.subs[x] ?? 0), 0);
  const tagGroups = FOOD_TAG_GROUPS.map((g) => ({ ...g, tags: g.tags.filter((x) => (facets.tags[x] ?? 0) > 0 || x === tag) })).filter((g) => g.tags.length);
  const pages = Math.ceil(total / PLACES_PAGE);
  const params0 = { ...(city ? { city } : {}), ...(sp.q ? { q: sp.q } : {}), ...(sp.kind ? { kind: sp.kind } : {}), ...(sp.sub ? { sub: sp.sub } : {}), ...(tag ? { tag } : {}) };
  const link = (p: number) => href(lang, `/places/c/${cat}?${new URLSearchParams({ ...params0, page: String(p) })}`);
  const chipLink = (patch: Record<string, string | undefined>) => {
    const o: Record<string, string> = { ...params0 };
    for (const [k, v] of Object.entries(patch)) {
      if (v) o[k] = v;
      else delete o[k];
    }
    const qs = new URLSearchParams(o).toString();
    return href(lang, `/places/c/${cat}${qs ? `?${qs}` : ""}`);
  };
  const chip = (on: boolean) => `whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${on ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"}`;
  const tx = lang === "ru" && !sp.q && page === 1 ? await catText(cat, city) : null;
  const genericSubs = !isFood && lang === "ru" ? ((SUBS as Record<string, string[]>)[cat] ?? []) : [];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href={href(lang, `/places${city ? `?city=${city}` : ""}`)} className="text-[14px] text-muted hover:text-brand">
        ← {placesH1(lang, city)}
      </Link>
      <h1 className="mt-2 text-[26px] font-bold sm:text-[32px]">
        {c.emoji} {c.label[lang]} {city ? cityIn(city, lang) : ""}
      </h1>
      <p className="mt-1 text-[14px] text-muted">
        {t.found}: {total}
      </p>
      {tx?.intro && <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-[#3a3935]"><Linkified text={tx.intro} /></p>}
      <div className="mt-4 max-w-2xl">
        <PlaceSearch lang={lang} q={sp.q} cat={cat} city={city} />
      </div>
      <PlaceCityChips lang={lang} city={city} path={`/places/c/${cat}`} counts={byCity} keep={Object.fromEntries(Object.entries({ q: sp.q, sub: sp.sub, kind: sp.kind, tag }).filter(([, v]) => v)) as Record<string, string>} />
      {isFood && (
        <div className="mt-4 space-y-2">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <a href={chipLink({ kind: undefined })} className={chip(!kind)}>{lang === "ru" ? "Все" : lang === "ka" ? "ყველა" : "All"}</a>
            {FOOD_KINDS.filter((k) => kindCount(k) > 0 || kind?.id === k.id).map((k) => (
              <a key={k.id} href={chipLink({ kind: k.id })} className={chip(kind?.id === k.id)}>
                {k.label[lang]} <span className="opacity-60">{kindCount(k)}</span>
              </a>
            ))}
          </div>
          {lang === "ru" && tagGroups.length > 0 && (
            <details className="group rounded-2xl border border-line bg-white" open={!!tag}>
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-[14px] font-semibold [&::-webkit-details-marker]:hidden">
                🍴 Кухня и особенности
                {tag && (
                  <span className="rounded-full bg-brand px-2.5 py-0.5 text-[12px] font-medium text-white">{tag}</span>
                )}
                <span className="ml-auto text-muted transition group-open:rotate-180">▾</span>
              </summary>
              <div className="space-y-3 border-t border-line px-4 py-3">
                {tagGroups.map((g) => (
                  <div key={g.label}>
                    <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted">{g.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.tags.map((x) => (
                        <a key={x} href={chipLink({ tag: tag === x ? undefined : x })} className={`${chip(tag === x)} !py-1 !text-[12.5px]`}>
                          {x} {facets.tags[x] ? <span className="opacity-60">{facets.tags[x]}</span> : null}
                          {tag === x && " ×"}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-[12px] text-muted">Метки ставим по сайтам и страницам самих заведений — список растёт по мере наполнения карточек.</p>
              </div>
            </details>
          )}
        </div>
      )}
      {genericSubs.length > 1 && (
        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <a href={chipLink({ sub: undefined })} className={chip(!sp.sub)}>Все</a>
          {genericSubs.map((x) => (
            <a key={x} href={chipLink({ sub: x })} className={chip(sp.sub === x)}>{x}</a>
          ))}
        </div>
      )}
      {items.length === 0 && <p className="mt-4 rounded-2xl bg-white p-4">{t.nothing}</p>}
      {items.length > 0 && <PlacesBrowser items={items} lang={lang} />}
      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3 text-[14px]">
          {page > 1 && (
            <Link href={link(page - 1)} className="btn-ghost h-10 px-4">
              {t.prev}
            </Link>
          )}
          <span className="text-muted">
            {page} / {pages}
          </span>
          {page < pages && (
            <Link href={link(page + 1)} className="btn-ghost h-10 px-4">
              {t.next}
            </Link>
          )}
        </nav>
      )}
      {isFood && lang === "ru" && (
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#cfe3f0] bg-[#f1f8fc] p-5 sm:flex-row sm:items-center">
          <div className="grow">
            <p className="font-semibold text-[#0f5c82]">Ваше кафе или ресторан?</p>
            <p className="mt-1 text-[14px] text-[#2f5d74]">Откройте карточку заведения и нажмите «Подтвердить в Telegram» — бесплатно добавите фото, меню, часы и контакты. Карточки с фото и описанием стоят в списке выше.</p>
          </div>
          <a href={href(lang, "/org")} className="btn-ghost h-10 shrink-0 px-4 text-[14px]">Подробнее →</a>
        </div>
      )}
      {tx && (
        <article className="mt-10 max-w-3xl space-y-4 text-[16px] leading-relaxed text-[#2a2925]">
          {tx.body.map((b, i) =>
            "h2" in b ? (
              <h2 key={i} className="pt-2 text-[21px] font-bold text-ink">{b.h2}</h2>
            ) : "p" in b ? (
              <p key={i}><Linkified text={b.p} /></p>
            ) : (
              <ul key={i} className="list-disc space-y-1.5 pl-6 marker:text-brand">
                {b.list.map((x, j) => <li key={j}><Linkified text={x} /></li>)}
              </ul>
            ),
          )}
          {tx.faq && tx.faq.length > 0 && (
            <>
              <h2 className="pt-2 text-[21px] font-bold text-ink">Частые вопросы</h2>
              <div className="divide-y divide-line rounded-2xl border border-line bg-white">
                {tx.faq.map((f) => (
                  <div key={f.q} className="p-4">
                    <p className="font-semibold">{f.q}</p>
                    <p className="mt-1 text-[15px] text-[#3a3935]"><Linkified text={f.a} /></p>
                  </div>
                ))}
              </div>
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: tx.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }) }} />
            </>
          )}
        </article>
      )}
      <p className="mt-10 text-[12px] text-muted">
        {t.data}: © OpenStreetMap contributors (ODbL), Overture Maps Foundation. {t.stale}
      </p>
    </div>
  );
}
