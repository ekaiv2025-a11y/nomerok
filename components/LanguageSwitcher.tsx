"use client";

import { usePathname, useRouter } from "next/navigation";
import { LANG_COOKIE, LOCALES, LOCALE_NAMES, LOCALE_SHORT, switchLocalePath, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ lang, label, compact = false }: { lang: Locale; label: string; compact?: boolean }) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  function change(to: Locale) {
    if (to === lang) return;
    document.cookie = `${LANG_COOKIE}=${to}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.push(switchLocalePath(pathname, to) + window.location.search);
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={lang}
        onChange={(e) => change(e.target.value as Locale)}
        className={`h-10 cursor-pointer appearance-none rounded-full border border-line bg-white text-[13px] font-semibold outline-none hover:border-ink focus:border-brand ${
          compact ? "pl-3 pr-7" : "pl-3.5 pr-8"
        }`}
        aria-label={label}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {compact ? LOCALE_SHORT[l] : LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2.5 h-3 w-3 text-muted" viewBox="0 0 12 12" aria-hidden>
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </label>
  );
}
