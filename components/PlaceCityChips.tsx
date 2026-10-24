import Link from "next/link";
import { href } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { CITIES } from "@/lib/cities";
import { PT } from "@/lib/places";

/** Выбор города в «Местах»: показываем только города, где уже есть места. */
export function PlaceCityChips({ lang, city, path, counts, keep = {} }: { lang: Locale; city?: string; path: string; counts: Record<string, number>; keep?: Record<string, string> }) {
  const shown = CITIES.filter((c) => counts[c.id] || c.id === city);
  if (shown.length < 2) return null;
  const link = (c?: string) => {
    const qs = new URLSearchParams({ ...keep, ...(c ? { city: c } : {}) }).toString();
    return href(lang, `${path}${qs ? `?${qs}` : ""}`);
  };
  const chip = (on: boolean) => `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`;
  return (
    <nav aria-label="Город" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" style={{ scrollbarWidth: "none" }}>
      <Link href={link()} className={chip(!city)}>
        📍 {PT[lang].allCities}
      </Link>
      {shown.map((c) => (
        <Link key={c.id} href={link(c.id)} className={chip(city === c.id)}>
          {c.label[lang]} <span className="opacity-60">{counts[c.id] ?? 0}</span>
        </Link>
      ))}
    </nav>
  );
}
