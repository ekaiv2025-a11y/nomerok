import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { PLACE_CATS, PT } from "@/lib/places";
import { PLACES_PAGE, listPlaces } from "@/lib/places-db";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceSearch } from "@/components/PlaceSearch";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; cat: string }>; searchParams: Promise<{ q?: string; page?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang, cat } = await params;
  const c = PLACE_CATS.find((x) => x.id === cat);
  if (!isLocale(lang) || !c) return {};
  const sp = await searchParams;
  const title = `${c.label[lang]} — ${PT[lang].h1}`;
  const base = pageMeta(lang, `/places/c/${cat}`, title, `${c.label[lang]}: ${PT[lang].lead}`);
  return sp.q || Number(sp.page) > 1 ? { ...base, robots: { index: false, follow: true } } : base;
}

export default async function PlaceCatPage({ params, searchParams }: Props) {
  const { lang, cat } = await params;
  if (!isLocale(lang)) notFound();
  const c = PLACE_CATS.find((x) => x.id === cat);
  if (!c) notFound();
  const t = PT[lang];
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { items, total } = await listPlaces({ cat, q: sp.q, page });
  const pages = Math.ceil(total / PLACES_PAGE);
  const link = (p: number) => href(lang, `/places/c/${cat}?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), page: String(p) })}`);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href={href(lang, "/places")} className="text-[14px] text-muted hover:text-brand">
        ← {t.h1}
      </Link>
      <h1 className="mt-2 text-[26px] font-bold sm:text-[32px]">
        {c.emoji} {c.label[lang]}
      </h1>
      <p className="mt-1 text-[14px] text-muted">
        {t.found}: {total}
      </p>
      <div className="mt-4 max-w-2xl">
        <PlaceSearch lang={lang} q={sp.q} cat={cat} />
      </div>
      {items.length === 0 && <p className="mt-4 rounded-2xl bg-white p-4">{t.nothing}</p>}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((p) => (
          <PlaceCard key={p.id} p={p} lang={lang} />
        ))}
      </div>
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
      <p className="mt-10 text-[12px] text-muted">
        {t.data}: © OpenStreetMap contributors (ODbL), Overture Maps Foundation. {t.stale}
      </p>
    </div>
  );
}
