import Link from "next/link";
import { Logo } from "./Logo";
import { getDict, href, type Locale } from "@/lib/i18n";
import { SITE_NAME } from "@/lib/site";
import { CATEGORIES, categoryPlural } from "@/lib/categories";
import { seoCategoryIds } from "@/lib/seo-categories";

const IN_CITY = { ru: "в Батуми", en: "in Batumi", ka: "ბათუმში" } as const;

export function Footer({ lang }: { lang: Locale }) {
  const t = getDict(lang).footer;
  const L = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <li>
      <Link className="break-words hover:text-ink [overflow-wrap:anywhere]" href={href(lang, to)}>
        {children}
      </Link>
    </li>
  );
  return (
    <footer className="mt-16 border-t border-line bg-cream">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo lang={lang} small />
          <p className="mt-3 text-[13px] leading-relaxed text-muted">{t.tagline}</p>
        </div>
        <div>
          <h4 className="mb-3 text-[13px] font-semibold">{t.clients}</h4>
          <ul className="space-y-2 text-[13px] text-muted">
            <L to="/">{t.all}</L>
            <L to="/request">{t.leaveRequest}</L>
            <L to="/how">{t.how}</L>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-[13px] font-semibold">{t.specialists}</h4>
          <ul className="space-y-2 text-[13px] text-muted">
            <L to="/join">{t.placeProfile}</L>
            <L to="/how#specialists">{t.conditions}</L>
            <L to="/cabinet">{t.cabinet}</L>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-[13px] font-semibold">{t.company}</h4>
          <ul className="space-y-2 text-[13px] text-muted">
            <L to="/contacts">{t.contacts}</L>
            <L to="/rules">{t.rules}</L>
          </ul>
        </div>
      </div>
      {/* Все направления — ссылки на страницы услуг (удобно людям и поисковикам) */}
      <div className="border-t border-line">
        <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-4 gap-y-1.5 px-4 py-5 text-[12.5px] text-muted sm:px-6">
          {CATEGORIES.filter((c) => seoCategoryIds().includes(c.id)).map((c) => (
            <li key={c.id}>
              <Link href={href(lang, `/services/${c.id}`)} className="hover:text-ink">
                {categoryPlural(c.id, lang)} {IN_CITY[lang]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-[12px] text-muted sm:px-6">
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}
