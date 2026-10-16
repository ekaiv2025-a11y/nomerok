import type { Metadata } from "next";
import Link from "next/link";
import { getDict, href } from "@/lib/i18n";
import { langOf, type LangParams } from "@/lib/i18n/page";
import { readPlaceReviewToken } from "@/lib/signed";
import { getPlace } from "@/lib/places-db";
import { placeAddr, placeCat, placeName } from "@/lib/places";
import { ReviewForm } from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return { title: getDict(lang).reviews.leave, robots: { index: false } };
}

export default async function PlaceReviewPage({ params, searchParams }: LangParams & { searchParams: Promise<{ t?: string }> }) {
  const lang = await langOf(params);
  const t = getDict(lang).reviews;
  const token = (await searchParams).t ?? "";
  const ticket = readPlaceReviewToken(token);
  const p = ticket ? await getPlace(ticket.p).catch(() => null) : null;
  if (!ticket || !p || p.status !== "published") {
    return (
      <div className="mx-auto max-w-md px-4 py-14 text-center">
        <h1 className="text-[24px] font-bold">{t.expiredTitle}</h1>
        <p className="mt-2 text-[15px] text-muted">{t.expiredText}</p>
        <Link href={href(lang, "/places")} className="btn-ghost mt-6">
          {getDict(lang).form.toHome}
        </Link>
      </div>
    );
  }
  const c = placeCat(p.cat);
  const back = href(lang, `/places/${p.slug}`);
  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold leading-tight">{t.leave}</h1>
      <Link href={back} className="mt-4 flex items-center gap-3 rounded-2xl border border-line p-3.5 hover:bg-cream">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-[24px]">{c.emoji}</span>
        <div>
          <p className="font-semibold">{placeName(p, lang)}</p>
          <p className="text-[14px] text-muted">{p.sub || c.label[lang]}{placeAddr(p, lang) ? ` · ${placeAddr(p, lang)}` : ""}</p>
        </div>
      </Link>
      <div className="mt-6">
        <ReviewForm lang={lang} token={token} defaultName={ticket.n} endpoint="/api/place-reviews" backHref={back} backLabel={placeName(p, lang)} />
      </div>
    </div>
  );
}
