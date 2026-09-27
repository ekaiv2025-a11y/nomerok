import type { Metadata } from "next";
import Link from "next/link";
import { JoinForm } from "@/components/JoinForm";
import { getDict, href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  const t = getDict(lang).meta;
  return pageMeta(lang, "/join", t.join, t.joinDesc(SITE_NAME));
}

export default async function JoinPage({ params }: LangParams) {
  const lang = await langOf(params);
  const t = getDict(lang).join;
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold leading-tight sm:text-[32px]">{t.title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {t.intro}{" "}
        <Link href={href(lang, "/how#specialists")} className="font-semibold text-brand underline">
          {t.conditions}
        </Link>
      </p>
      <div className="mt-6">
        <JoinForm lang={lang} />
      </div>
    </div>
  );
}
