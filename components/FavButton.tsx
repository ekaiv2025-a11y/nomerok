"use client";

import { useEffect, useState } from "react";
import { SOCIAL } from "@/lib/social-text";
import type { Locale } from "@/lib/i18n";

const KEY = "nm_fav";
export function readFavs(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function writeFavs(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event("nm:fav"));
}

/** Сердечко «В избранное». Хранится в браузере, без регистрации. */
export function FavButton({ slug, lang, variant = "overlay" }: { slug: string; lang: Locale; variant?: "overlay" | "inline" }) {
  const t = SOCIAL[lang];
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(readFavs().includes(slug));
    sync();
    window.addEventListener("nm:fav", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("nm:fav", sync);
      window.removeEventListener("storage", sync);
    };
  }, [slug]);
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const list = readFavs();
    writeFavs(list.includes(slug) ? list.filter((s) => s !== slug) : [slug, ...list].slice(0, 100));
  };
  const heart = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4.5 7 4.5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.4 0 5.6 3.1 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z"
        fill={on ? "#e0475b" : "none"}
        stroke={on ? "#e0475b" : "currentColor"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
  if (variant === "inline")
    return (
      <button type="button" onClick={toggle} className="btn-ghost h-10 px-4 text-[14px]" aria-pressed={on}>
        {heart} {on ? t.favRemove : t.favAdd}
      </button>
    );
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? t.favRemove : t.favAdd}
      title={on ? t.favRemove : t.favAdd}
      className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#1c1b18] shadow-sm transition hover:scale-105"
    >
      {heart}
    </button>
  );
}
