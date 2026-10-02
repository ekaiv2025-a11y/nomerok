import type { Metadata } from "next";
import { listPublishedMasters } from "@/lib/db";
import { FavList } from "@/components/FavList";
import { SOCIAL } from "@/lib/social-text";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return { ...pageMeta(lang, "/favorites", SOCIAL[lang].favTitle), robots: { index: false } };
}

export default async function FavoritesPage({ params }: LangParams) {
  const lang = await langOf(params);
  const t = SOCIAL[lang];
  const masters = await listPublishedMasters().catch(() => []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-[26px] font-bold sm:text-[32px]">❤️ {t.favTitle}</h1>
      <p className="mt-1 text-[13px] text-muted">{t.favHint}</p>
      <FavList masters={masters} lang={lang} />
    </div>
  );
}
