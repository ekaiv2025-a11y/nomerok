import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";
import { getDict, href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { SUPPORT_TELEGRAM } from "@/lib/site";
import { FeedbackForm } from "@/components/FeedbackForm";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return pageMeta(lang, "/contacts", getDict(lang).meta.contacts);
}

export default async function ContactsPage({ params }: LangParams) {
  const lang = await langOf(params);
  const t = getDict(lang).contacts;
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold sm:text-[32px]">{t.title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.intro}</p>

      <div className="mt-6">
        <FeedbackForm lang={lang} />
      </div>

      {SUPPORT_TELEGRAM && (
        <p className="mt-5 flex flex-wrap items-center gap-2 text-[14px] text-muted">
          {t.telegramDirect}
          <a href={`https://t.me/${SUPPORT_TELEGRAM}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
            <Send className="h-4 w-4" /> @{SUPPORT_TELEGRAM}
          </a>
        </p>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href={href(lang, "/request")} className="rounded-2xl border border-brand/30 bg-brand-soft p-5 hover:border-brand">
          <p className="font-semibold text-brand-dark">{t.needSpecialist}</p>
          <p className="mt-1 text-[14px] text-[#3d5a4c]">{t.needSpecialistText}</p>
        </Link>
        <Link href={href(lang, "/join")} className="rounded-2xl border border-line p-5 hover:border-ink">
          <p className="font-semibold">{t.areSpecialist}</p>
          <p className="mt-1 text-[14px] text-muted">{t.areSpecialistText}</p>
        </Link>
      </div>
    </div>
  );
}
