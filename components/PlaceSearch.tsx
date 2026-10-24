import { href } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { PT } from "@/lib/places";

/** Поиск по местам — обычная форма (работает и без JavaScript). */
export function PlaceSearch({ lang, q, cat, city }: { lang: Locale; q?: string; cat?: string; city?: string }) {
  const t = PT[lang];
  return (
    <form action={href(lang, cat ? `/places/c/${cat}` : "/places")} method="get" className="flex gap-2">
      {city && <input type="hidden" name="city" value={city} />}
      <input name="q" defaultValue={q} placeholder={t.search} className="field h-12 min-w-0 grow text-[15px]" enterKeyHint="search" />
      <button className="btn-primary h-12 shrink-0 px-5">{t.find}</button>
    </form>
  );
}
