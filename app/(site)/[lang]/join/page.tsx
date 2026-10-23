import type { Metadata } from "next";
import Link from "next/link";
import { JoinForm } from "@/components/JoinForm";
import { getDict, href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { SITE_NAME } from "@/lib/site";
import { readJoinToken } from "@/lib/join-token";
import { after } from "next/server";
import { joinOpened } from "@/lib/join-starts";
import { formatPhone } from "@/lib/phone";
import { botUsername } from "@/lib/telegram";
import { currentAccount } from "@/lib/account-auth";
import { providerEnabled } from "@/lib/oauth";

const NOPROFILE = {
  ru: "Анкеты с этим входом не нашли. Если анкета у вас уже есть и вы входили через Telegram — войдите через Telegram, а в кабинете нажмите «Добавить вход через Google или почту». Или создайте новую анкету ниже.",
  en: "We didn't find a profile for this sign-in. If you already have one created via Telegram, sign in with Telegram and add Google or email in your dashboard. Or create a new profile below.",
  ka: "ამ შესვლით ანკეტა ვერ მოიძებნა. თუ ანკეტა Telegram-ით შექმენით — შედით Telegram-ით და კაბინეტში დაამატეთ Google ან ელფოსტა. ან შექმენით ახალი ანკეტა ქვემოთ.",
} as const;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  const t = getDict(lang).meta;
  return pageMeta(lang, "/join", t.join, t.joinDesc(SITE_NAME));
}

type Props = LangParams & { searchParams: Promise<{ t?: string; noprofile?: string }> };

export default async function JoinPage({ params, searchParams }: Props) {
  const lang = await langOf(params);
  const sp = await searchParams;
  const token = sp.t;
  const acc = await currentAccount();
  const p = readJoinToken(token);
  const prefill = p && token ? { token, name: p.name, phone: formatPhone(p.phone), telegram: p.username, hasPhoto: !!p.photoFileId } : null;
  const bot = prefill ? null : await botUsername();
  if (p) after(() => joinOpened(p.chatId, p.name, p.phone).catch(() => null));
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
      {sp.noprofile && acc && <p className="mt-4 rounded-xl bg-[#fdf6e6] p-3 text-[14px] leading-relaxed text-[#5a4a22]">{NOPROFILE[lang]}</p>}
      <div className="mt-6">
        <JoinForm
          lang={lang}
          prefill={prefill}
          tgFastLink={bot ? `https://t.me/${bot}?start=j_${lang}` : null}
          account={acc ? { name: acc.name, email: acc.email } : null}
          google={providerEnabled("google")}
          facebook={providerEnabled("facebook")}
        />
      </div>
    </div>
  );
}
