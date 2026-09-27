import Link from "next/link";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getDict, href, type Locale } from "@/lib/i18n";

export function Header({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
        <Logo lang={lang} />
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link href={href(lang, "/how")} className="hidden h-10 items-center px-3 text-[14px] font-medium text-muted hover:text-ink lg:inline-flex">
            {t.nav.how}
          </Link>
          <Link href={href(lang, "/join")} className="hidden h-10 items-center rounded-full px-4 text-[14px] font-semibold text-brand hover:bg-brand-soft md:inline-flex">
            {t.nav.iAmSpecialist}
          </Link>
          <LanguageSwitcher lang={lang} label={t.nav.language} compact />
          <Link href={href(lang, "/request")} className="btn-primary h-10 whitespace-nowrap px-3 text-[13px] sm:px-4 sm:text-[14px]">
            <span className="hidden sm:inline">{t.nav.leaveRequest}</span>
            <span className="sm:hidden">{t.nav.leaveRequestShort}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
