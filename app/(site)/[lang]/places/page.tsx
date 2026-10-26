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
  // полезные разделы — первыми
  const FIRST = ["health", "public", "education"];
  const cats = [...PLACE_CATS].sort((a, b) => Number(FIRST.includes(b.id)) - Number(FIRST.includes(a.id)) || FIRST.indexOf(a.id) - FIRST.indexOf(b.id));
  // подборки: для выбранного города — его подборки (старые подборки без города — про Батуми)
  const picks = lang === "ru" ? (await journalArticles()).filter((a) => a.rubric === "picks" && (!city || (a.city ?? "batumi") === city)).slice(0, 6) : [];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-[28px] font-bold sm:text-[36px]">📍 {placesH1(lang, city)}</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{t.lead}</p>
      <div className="mt-5 max-w-2xl">
        <PlaceSearch lang={lang} q={q} city={city} />
      </div>
      <PlaceCityChips lang={lang} city={city} path="/places" counts={byCity} keep={q ? { q } : {}} />

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
          {picks.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[20px] font-bold">✨ {t.picks}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {picks.map((a) => (
                  <Link key={a.slug} href={href(lang, `/guide/${a.slug}`)} className="rounded-2xl border border-line bg-white p-4 font-semibold hover:border-brand">
                    {a.emoji} {a.h1}
                  </Link>
                ))}
              </div>
            </section>
          )}
          <section className="mt-8">
            <h2 className="text-[20px] font-bold">{t.all}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {cats.filter((c) => counts[c.id]).map((c) => (
                <Link key={c.id} href={href(lang, `/places/c/${c.id}${city ? `?city=${city}` : ""}`)} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 transition hover:border-brand hover:shadow-sm">
                  <span className="text-[26px]" aria-hidden>
                    {c.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold leading-snug">{c.label[lang]}</span>
                    <span className="text-[12px] text-muted">{counts[c.id]}</span>
                  </span>
                </Link>
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
