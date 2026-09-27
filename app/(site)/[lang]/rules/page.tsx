import type { Metadata } from "next";
import Link from "next/link";
import { getDict, href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return pageMeta(lang, "/rules", getDict(lang).rules.title);
}

export default async function RulesPage({ params }: LangParams) {
  const lang = await langOf(params);
  const d = getDict(lang);
  const t = d.rules;
  return (
    <div className="prose-page mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold sm:text-[32px]">{t.title}</h1>
      <p className="mt-3">{t.intro}</p>
      <h2>{t.clientsTitle}</h2>
      <ul>{t.clients.map((s, i) => <li key={i}>{s}</li>)}</ul>
      <h2>{t.specialistsTitle}</h2>
      <ul>{t.specialists.map((s, i) => <li key={i}>{s}</li>)}</ul>
      <h2>{t.forbiddenTitle}</h2>
      <ul>{t.forbidden.map((s, i) => <li key={i}>{s}</li>)}</ul>
      <p className="mt-6 rounded-xl bg-cream p-4 text-[14px]">{t.note}</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href={href(lang, "/how")} className="btn-ghost">{d.nav.how}</Link>
        <Link href={href(lang, "/contacts")} className="btn-primary">{d.footer.contacts}</Link>
      </div>
    </div>
  );
}
