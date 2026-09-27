import type { Metadata } from "next";
import Link from "next/link";
import { Catalog } from "@/components/Catalog";
import { SetupNotice } from "@/components/SetupNotice";
import { listPublishedMasters } from "@/lib/db";
import { getDict, href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { SITE_NAME } from "@/lib/site";
import type { PublicMaster } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  const t = getDict(lang).meta;
  return pageMeta(lang, "/", t.title(SITE_NAME), t.description);
}

export default async function Home({ params }: LangParams) {
  const lang = await langOf(params);
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
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6 sm:pt-12">
        <h1 className="max-w-2xl text-[28px] font-bold leading-[1.15] tracking-tight sm:text-[40px]">
          {t.h1a} <span className="text-brand">{t.h1b}</span>
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px]">{t.sub}</p>
        <ol className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
          {t.steps.map((s, i) => (
            <li key={i}>
              <b className="text-ink">{i + 1}.</b> {s}
            </li>
          ))}
        </ol>
        <Link href={href(lang, "/join")} className="mt-4 inline-block text-[14px] font-semibold text-brand hover:underline md:hidden">
          {t.specialistCta}
        </Link>
      </section>
      {broken ? <SetupNotice lang={lang} /> : <Catalog masters={masters} lang={lang} />}
    </>
  );
}
