"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Users, X } from "lucide-react";
import { Logo } from "./Logo";
import { SOCIAL } from "@/lib/social-text";
import { MY } from "@/lib/my-text";
import { ORD } from "@/lib/orders-text";
import { PH } from "@/lib/phones";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getDict, href, type Locale } from "@/lib/i18n";

/**
 * Шапка. На телефоне прячется, когда листаешь вниз, и появляется, когда листаешь вверх.
 * На телефоне — меню-«бургер» со всеми разделами.
 */
const MYCAB = { ru: "Мой кабинет", en: "My dashboard", ka: "ჩემი კაბინეტი" } as const;

export function Header({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  // Специалист уже входил — вместо «Я специалист» ведём сразу в кабинет
  const [isSpec, setIsSpec] = useState(false);
  useEffect(() => {
    try {
      setIsSpec(/(?:^|; )nm_is_spec=1/.test(document.cookie));
    } catch {}
  }, []);
  const hiddenRef = useRef(false);
  useEffect(() => {
    hiddenRef.current = hidden;
  }, [hidden]);
  const pathname = usePathname();
  // iPhone Safari (iOS 26): при прокрутке поверх страницы сверху «плавает» плашка с адресом сайта.
  // Чтобы она не налезала на кнопки, в прокрученном состоянии опускаем содержимое шапки ниже неё.
  const [iosSafari, setIosSafari] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    setIosSafari(/iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/.test(ua));
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    // Простое правило: листаем вниз — шапки нет, листаем вверх — она на месте.
    // Мелкие подрагивания пальца (меньше 8px) и «пружину» у краёв страницы не учитываем.
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 56);
      if (window.innerWidth >= 768 || y <= 56) {
        if (hiddenRef.current) setHidden(false);
        last = Math.max(0, y);
        return;
      }
      if (y < 0 || y > max) return;
      const diff = y - last;
      if (Math.abs(diff) < 8) return;
      const hide = diff > 0;
      if (hide !== hiddenRef.current) setHidden(hide);
      last = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    { href: href(lang, "/phones"), label: "📞 " + PH[lang].nav },
    { href: href(lang, "/how"), label: t.nav.how },
    { href: href(lang, "/join"), label: t.footer.placeProfile },
    { href: href(lang, "/cabinet"), label: isSpec ? "👤 " + MYCAB[lang] : t.nav.cabinet },
    { href: href(lang, "/contacts"), label: t.footer.contacts },
  ];

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40 border-b border-line bg-white md:sticky"
        style={{
          transform: hidden && !open ? "translate3d(0,-100%,0)" : "translate3d(0,0,0)",
          willChange: "transform",
          paddingTop: iosSafari && scrolled ? 30 : 0,
          transition: "transform .3s ease-out, padding-top .2s ease-out",
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
          <Logo lang={lang} />
          <nav className="flex items-center gap-1 min-[400px]:gap-1.5 sm:gap-2">
            <Link
              href={href(lang) + "#masters"}
              className="flex h-10 w-9 shrink-0 items-center max-[359px]:hidden justify-center gap-1.5 rounded-full text-[14px] font-semibold text-ink hover:bg-cream lg:w-auto lg:px-3"
              aria-label={t.nav.allSpecialists}
              title={t.nav.allSpecialists}
            >
              <Users className="h-5 w-5 text-brand" />
              <span className="hidden whitespace-nowrap lg:inline">{t.nav.allSpecialists}</span>
            </Link>
            <Link href={href(lang, "/orders")} className="hidden h-10 items-center whitespace-nowrap px-3 text-[14px] font-medium text-muted hover:text-ink lg:inline-flex">
              {ORD[lang].nav}
            </Link>
            <Link href={href(lang, isSpec ? "/cabinet" : "/join")} className="hidden h-10 items-center whitespace-nowrap rounded-full px-4 text-[14px] font-semibold text-brand hover:bg-brand-soft md:inline-flex">
              {isSpec ? MYCAB[lang] : t.nav.iAmSpecialist}
            </Link>
            <Link href={href(lang, "/favorites")} className="hidden h-10 items-center rounded-full px-3 text-[14px] font-medium text-muted hover:text-ink md:inline-flex" title={SOCIAL[lang].fav}>
              ♡
            </Link>
            <Link href={href(lang, "/my")} className="hidden h-10 items-center whitespace-nowrap rounded-full px-3 text-[14px] font-medium text-muted hover:text-ink xl:inline-flex">
              {MY[lang].nav}
            </Link>
            <LanguageSwitcher lang={lang} label={t.nav.language} compact />
            <Link href={href(lang, "/request")} className="btn-primary h-10 whitespace-nowrap px-3 text-[13px] max-[359px]:px-2.5 sm:px-4 sm:text-[14px]">
              <span className="hidden sm:inline">{t.nav.leaveRequest}</span>
              <span className="sm:hidden">{t.nav.leaveRequestShort}</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-9 items-center justify-center rounded-full hover:bg-cream md:hidden"
              aria-label={open ? t.nav.close : t.nav.menu}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>
        </div>
      </header>
      {/* место под шапку на телефоне (там она «плавает» поверх страницы) */}
      <div className="h-14 sm:h-16 md:hidden" aria-hidden />

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
