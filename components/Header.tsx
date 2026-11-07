"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Users, X } from "lucide-react";
import { Logo } from "./Logo";
import { SOCIAL } from "@/lib/social-text";
import { MY } from "@/lib/my-text";
import { ORD } from "@/lib/orders-text";
import { PH } from "@/lib/phones";
import { PT } from "@/lib/places";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getDict, href, type Locale } from "@/lib/i18n";

/**
 * Шапка. На телефоне прячется, когда листаешь вниз, и появляется, когда листаешь вверх.
 * На телефоне — меню-«бургер» со всеми разделами.
 */
const MYCAB = { ru: "Мой кабинет", en: "My dashboard", ka: "ჩემი კაბინეტი" } as const;

/* Короткие подписи кнопок для телефона */
const SPEC_SHORT = { ru: "Я мастер", en: "I'm a pro", ka: "სპეციალისტი" } as const;
const CAB_SHORT = { ru: "Кабинет", en: "Dashboard", ka: "კაბინეტი" } as const;
const REQ_SHORT = { ru: "Ищу мастера", en: "Need help", ka: "განაცხადი" } as const;
/* Зелёная кнопка — для клиентов: по подписи сразу ясно, что это «найти», а не «разместить анкету» */
const REQ_LONG = { ru: "Ищу специалиста", en: "Find a specialist", ka: "ვეძებ სპეციალისტს" } as const;

export function Header({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const [open, setOpen] = useState(false);
  // Специалист уже входил — вместо «Я специалист» ведём сразу в кабинет
  const [isSpec, setIsSpec] = useState(false);
  useEffect(() => {
    try {
      setIsSpec(/(?:^|; )nm_is_spec=1/.test(document.cookie));
    } catch {}
  }, []);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: href(lang), label: t.nav.allSpecialists },
    { href: href(lang, "/request"), label: t.nav.leaveRequest },
    { href: href(lang, "/orders"), label: "🔥 " + ORD[lang].nav },
    { href: href(lang, "/my"), label: "📋 " + MY[lang].nav },
    { href: href(lang, "/favorites"), label: "❤️ " + SOCIAL[lang].fav },
    { href: href(lang, "/recommend"), label: "🤝 " + SOCIAL[lang].recLink },
    { href: href(lang, "/places"), label: "📍 " + PT[lang].nav },
    { href: href(lang, "/afisha"), label: "🎟 " + (lang === "ru" ? "Афиша" : lang === "en" ? "Events" : "აფიშა") },
    ...(lang === "ru" ? [{ href: href(lang, "/novostroyki"), label: "🏗 Новостройки" }] : []),
    { href: href(lang, "/phones"), label: "📞 " + PH[lang].nav },
    ...(lang === "ru" ? [{ href: href(lang, "/guide"), label: "📰 Журнал" }] : []),
    { href: href(lang, "/how"), label: t.nav.how },
    { href: href(lang, "/join"), label: t.footer.placeProfile },
    { href: href(lang, "/cabinet"), label: isSpec ? "👤 " + MYCAB[lang] : t.nav.cabinet },
    { href: href(lang, "/contacts"), label: t.footer.contacts },
  ];

  return (
    <>
      <header
        // На телефоне шапка — обычная часть страницы: уезжает вместе с ней и не прыгает при прокрутке.
        // На компьютере — закреплена сверху.
        className="relative z-40 border-b border-line bg-white md:sticky md:top-0"
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
          <Logo lang={lang} />
          <nav className="flex items-center gap-1 min-[400px]:gap-1.5 sm:gap-2">
            <Link
              href={href(lang) + "#masters"}
              className="hidden h-10 w-9 shrink-0 items-center sm:flex justify-center gap-1.5 rounded-full text-[14px] font-semibold text-ink hover:bg-cream xl:w-auto xl:px-3"
              aria-label={t.nav.allSpecialists}
              title={t.nav.allSpecialists}
            >
              <Users className="h-5 w-5 text-brand" />
              <span className="hidden whitespace-nowrap xl:inline">{t.nav.allSpecialists}</span>
            </Link>
            <Link href={href(lang, "/orders")} className="hidden h-10 items-center whitespace-nowrap px-3 text-[14px] font-medium text-muted hover:text-ink lg:inline-flex">
              {ORD[lang].nav}
            </Link>
            {lang === "ru" && (
              <Link href={href(lang, "/guide")} className="hidden h-10 items-center whitespace-nowrap px-3 text-[14px] font-medium text-muted hover:text-ink xl:inline-flex">
                Журнал
              </Link>
            )}
            <Link href={href(lang, "/favorites")} className="hidden h-10 items-center rounded-full px-3 text-[14px] font-medium text-muted hover:text-ink md:inline-flex" title={SOCIAL[lang].fav}>
              ♡
            </Link>
            <Link href={href(lang, "/my")} className="hidden h-10 items-center whitespace-nowrap rounded-full px-3 text-[14px] font-medium text-muted hover:text-ink 2xl:inline-flex">
              {MY[lang].nav}
            </Link>
            <LanguageSwitcher lang={lang} label={t.nav.language} compact />
            {/* Две разные кнопки: специалистам (жёлтая) и клиентам (зелёная) — чтобы мастера не путали анкету с заявкой */}
            <Link
              href={href(lang, isSpec ? "/cabinet" : "/join")}
              className="btn h-10 whitespace-nowrap rounded-full bg-accent px-2.5 text-[12.5px] font-semibold text-ink hover:bg-[#cf9620] sm:px-4 sm:text-[14px]"
            >
              <span className="hidden sm:inline">{isSpec ? MYCAB[lang] : t.nav.iAmSpecialist}</span>
              <span className="sm:hidden">{isSpec ? CAB_SHORT[lang] : SPEC_SHORT[lang]}</span>
            </Link>
            <Link href={href(lang, "/request")} className="btn-primary h-10 whitespace-nowrap px-2.5 text-[12.5px] sm:px-4 sm:text-[14px]">
              <span className="hidden sm:inline">{REQ_LONG[lang]}</span>
              <span className="sm:hidden">{REQ_SHORT[lang]}</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                // меню открывается под шапкой — поднимаем страницу к началу
                if (!open) window.scrollTo({ top: 0 });
                setOpen((v) => !v);
              }}
              className="flex h-10 w-9 items-center justify-center rounded-full hover:bg-cream md:hidden"
              aria-label={open ? t.nav.close : t.nav.menu}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 top-14 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)}>
          <nav className="border-b border-line bg-white px-3 pb-4 pt-2 shadow-lg" onClick={(e) => e.stopPropagation()}>
            {links.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex h-12 items-center rounded-xl px-3 text-[16px] font-medium hover:bg-cream ${pathname === l.href ? "text-brand" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
