import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getDict, LOCALES, OG_LOCALE } from "@/lib/i18n";
import { langOf, type LangParams } from "@/lib/i18n/page";
import { SITE_NAME } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  const t = getDict(lang).meta;
  return {
    title: { default: t.title(SITE_NAME), template: `%s — ${SITE_NAME}` },
    description: t.description,
    openGraph: { siteName: SITE_NAME, locale: OG_LOCALE[lang], type: "website" },
  };
}

export default async function LangLayout({ children, params }: { children: React.ReactNode } & LangParams) {
  const lang = await langOf(params);
  return (
    <>
      <Header lang={lang} />
      <main>{children}</main>
      <Footer lang={lang} />
    </>
  );
}
