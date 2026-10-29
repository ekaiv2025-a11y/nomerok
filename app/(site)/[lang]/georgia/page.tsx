/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { GEO } from "@/lib/geo";
import { geoPhoto } from "@/lib/geo-photo";
import { RUBRICS } from "@/lib/articles";

export const revalidate = 3600;
type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "ru") return {};
  return pageMeta("ru", "/georgia", "Грузия: путеводитель для жизни и отдыха — города, погода, районы", "Города и курорты Грузии: районы, погода и море по месяцам, транспорт, что посмотреть, жизнь, специалисты и полезные места.");
}

export default async function GeoHub({ params }: Props) {
  const { lang } = await params;
  if (lang !== "ru") notFound();
  const deadline = Date.now() + 1500;
  const photos = await Promise.all(GEO.map((g) => geoPhoto(g.photo.q, deadline)));
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-[30px] font-bold sm:text-[40px]">🇬🇪 Грузия: путеводитель для жизни и отдыха</h1>
      <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-muted">
        Города и курорты: районы, погода и море по месяцам, как добраться, транспорт, что посмотреть — и всё, что нужно, если вы здесь живёте: специалисты, полезные места, новости.
      </p>
      <h2 className="mt-8 text-[22px] font-bold">Города и курорты</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GEO.map((g, i) => (
          <Link key={g.id} href={href("ru", `/georgia/${g.id}`)} className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand hover:shadow-sm">
            <div className="aspect-[16/9] bg-[#dfe9ee]">{photos[i] && <img src={photos[i]!.url} alt={g.photo.alt} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />}</div>
            <div className="p-4">
              <p className="text-[19px] font-bold">{g.name}</p>
              {g.region && <p className="text-[13px] text-muted">{g.region}</p>}
              <p className="mt-1 line-clamp-3 text-[14px] leading-relaxed text-[#3a3935]">{g.lead}</p>
            </div>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 text-[22px] font-bold">Читайте в журнале</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["life", "travel", "news", "events", "picks"] as const).map((r) => (
          <Link key={r} href={href("ru", `/guide?r=${r}`)} className="rounded-full border border-line bg-white px-4 py-2 text-[14px] font-medium hover:border-brand">
            {RUBRICS[r].emoji} {RUBRICS[r].label}
          </Link>
        ))}
        <Link href={href("ru", "/places")} className="rounded-full border border-line bg-white px-4 py-2 text-[14px] font-medium hover:border-brand">📍 Места Грузии</Link>
        <Link href={href("ru", "/phones")} className="rounded-full border border-line bg-white px-4 py-2 text-[14px] font-medium hover:border-brand">📞 Полезные телефоны</Link>
      </div>
    </div>
  );
}
