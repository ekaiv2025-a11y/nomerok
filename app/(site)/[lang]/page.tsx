import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";
import { Catalog } from "@/components/Catalog";
import { SetupNotice } from "@/components/SetupNotice";
import { listPublishedMasters } from "@/lib/db";
import { getDict, href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { SITE_NAME } from "@/lib/site";
import type { PublicMaster } from "@/lib/types";
import { cityIn, cityOf } from "@/lib/cities";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  const t = getDict(lang).meta;
  return pageMeta(lang, "/", t.title(SITE_NAME), t.description);
}

export default async function Home({ params, searchParams }: LangParams & { searchParams: Promise<{ city?: string }> }) {
  const lang = await langOf(params);
  const city = cityOf((await searchParams).city);
  const t = getDict(lang).home;
  let masters: PublicMaster[] = [];
  let broken = false;
  try {
    masters = await listPublishedMasters();
  } catch (e) {
    // Любая ошибка базы — показываем аккуратное сообщение, а не белый экран.
    console.error("Ошибка базы. Проверьте /api/health", e);
    broken = true;
  }

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-5 pt-6 sm:px-6 sm:pt-12">
        <h1 className="max-w-2xl text-[28px] font-bold leading-[1.15] tracking-tight sm:text-[40px]">
          {t.h1a(cityIn(city, lang))} <span className="text-brand">{t.h1b}</span>
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted sm:text-[17px]">{t.sub}</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:max-w-2xl sm:gap-3">
          <a href="#masters" className="group rounded-2xl border border-line bg-white p-3.5 transition hover:border-brand sm:p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Search className="h-5 w-5" />
            </span>
            <span className="mt-2.5 block text-[15px] font-semibold leading-tight group-hover:text-brand sm:text-[16px]">{t.pathPick}</span>
            <span className="mt-1 block text-[12.5px] leading-snug text-muted sm:text-[13px]">{t.pathPickText}</span>
          </a>
          <Link href={href(lang, city !== "batumi" ? `/request?city=${city}` : "/request")} className="group rounded-2xl border border-brand/30 bg-brand-soft p-3.5 transition hover:border-brand sm:p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
              <ClipboardList className="h-5 w-5" />
            </span>
            <span className="mt-2.5 block text-[15px] font-semibold leading-tight text-brand-dark sm:text-[16px]">{t.pathRequest}</span>
            <span className="mt-1 block text-[12.5px] leading-snug text-[#3d5a4c] sm:text-[13px]">{t.pathRequestText}</span>
          </Link>
        </div>
        <Link href={href(lang, "/join")} className="mt-4 inline-block text-[14px] font-semibold text-brand hover:underline md:hidden">
          {t.specialistCta}
        </Link>
      </section>
      {broken ? <SetupNotice lang={lang} /> : <Catalog masters={masters} lang={lang} city={city} />}
    </>
  );
}
