import type { Metadata } from "next";
import Link from "next/link";
import { getDict, href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return pageMeta(lang, "/how", getDict(lang).meta.how);
}

export default async function HowPage({ params }: LangParams) {
  const lang = await langOf(params);
  const t = getDict(lang).how;
  return (
    <div className="prose-page mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold sm:text-[32px]">{t.title}</h1>
      <h2>{t.clientsTitle}</h2>
      <ul>
        {t.clients.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <h2 id="specialists">{t.specialistsTitle}</h2>
      <ul>
        {t.specialists.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <h2>{t.reviewsTitle}</h2>
      <p>{t.reviews}</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href={href(lang, "/request")} className="btn-primary">
          {t.ctaRequest}
        </Link>
        <Link href={href(lang, "/join")} className="btn-ghost">
          {t.ctaJoin}
        </Link>
      </div>
    </div>
  );
}
