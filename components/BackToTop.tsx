"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Кнопка «наверх»: появляется, когда пролистали больше двух экранов вниз. */
export function BackToTop({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  const [raised, setRaised] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 1.5);
      // Если на странице есть нижняя панель с кнопками (телефон) — держимся над ней
      setRaised(!!document.querySelector("[data-sticky-bar]") && window.innerWidth < 1024);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-ink shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-cream sm:right-6 ${
        raised ? "bottom-[92px]" : "bottom-5 sm:bottom-6"
      } ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
