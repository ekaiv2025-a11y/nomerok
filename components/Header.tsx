"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getDict, href, type Locale } from "@/lib/i18n";

/**
 * Шапка. На телефоне прячется, когда листаешь вниз, и появляется, когда листаешь вверх.
 * На телефоне — меню-«бургер» со всеми разделами.
 */
export function Header({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const hiddenRef = useRef(false);
  useEffect(() => {
    hiddenRef.current = hidden;
  }, [hidden]);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    // Прячем/показываем только после заметного движения (60px в одну сторону) —
    // чтобы шапка не дёргалась от мелких движений пальца и «пружины» на iPhone.
    let anchor = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (window.innerWidth >= 768 || y < 120) {
        setHidden(false);
        anchor = y;
        return;
      }
      if (y < 0 || y > max) return; // «пружина» у краёв страницы
      const diff = y - anchor;
      if (diff > 60) {
        setHidden(true);
        anchor = y;
      } else if (diff < -60) {
        setHidden(false);
        anchor = y;
      } else if ((diff > 0 && hiddenRef.current) || (diff < 0 && !hiddenRef.current)) {
        anchor = y; // продолжаем двигаться в ту же сторону — сдвигаем точку отсчёта
      }
      lastY.current = y;
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
    { href: href(lang, "/how"), label: t.nav.how },
    { href: href(lang, "/join"), label: t.footer.placeProfile },
    { href: href(lang, "/cabinet"), label: t.nav.cabinet },
    { href: href(lang, "/contacts"), label: t.footer.contacts },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur transition-transform duration-200 ease-out will-change-transform ${hidden && !open ? "-translate-y-full" : ""}`}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
          <Logo lang={lang} />
          <nav className="flex items-center gap-1 min-[400px]:gap-1.5 sm:gap-2">
            <Link href={href(lang, "/how")} className="hidden h-10 items-center px-3 text-[14px] font-medium text-muted hover:text-ink lg:inline-flex">
              {t.nav.how}
            </Link>
            <Link href={href(lang, "/join")} className="hidden h-10 items-center rounded-full px-4 text-[14px] font-semibold text-brand hover:bg-brand-soft md:inline-flex">
              {t.nav.iAmSpecialist}
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
