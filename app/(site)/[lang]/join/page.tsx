import type { Metadata } from "next";
import Link from "next/link";
import { JoinForm } from "@/components/JoinForm";
import { getDict, href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { SITE_NAME } from "@/lib/site";
import { readJoinToken } from "@/lib/join-token";
import { formatPhone } from "@/lib/phone";
import { botUsername } from "@/lib/telegram";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  const t = getDict(lang).meta;
  return pageMeta(lang, "/join", t.join, t.joinDesc(SITE_NAME));
}

type Props = LangParams & { searchParams: Promise<{ t?: string }> };

export default async function JoinPage({ params, searchParams }: Props) {
  const lang = await langOf(params);
  const token = (await searchParams).t;
  const p = readJoinToken(token);
  const prefill = p && token ? { token, name: p.name, phone: formatPhone(p.phone), telegram: p.username, hasPhoto: !!p.photoFileId } : null;
  const bot = prefill ? null : await botUsername();
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
        <JoinForm lang={lang} prefill={prefill} tgFastLink={bot ? `https://t.me/${bot}?start=j_${lang}` : null} />
      </div>
    </div>
  );
}
