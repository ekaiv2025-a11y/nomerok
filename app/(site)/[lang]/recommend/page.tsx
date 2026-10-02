import type { Metadata } from "next";
import { RecommendForm } from "@/components/RecommendForm";
import { SOCIAL } from "@/lib/social-text";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return pageMeta(lang, "/recommend", SOCIAL[lang].recTitle, SOCIAL[lang].recLead);
}

export default async function RecommendPage({ params }: LangParams) {
  const lang = await langOf(params);
  const t = SOCIAL[lang];
  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold sm:text-[32px]">🤝 {t.recTitle}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.recLead}</p>
      <RecommendForm lang={lang} />
    </div>
  );
}
