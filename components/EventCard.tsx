import Link from "next/link";
import { href, type Locale } from "@/lib/i18n";
import { cityLabel } from "@/lib/cities";
import { eventWhen, kindOf, type CityEvent } from "@/lib/events";

/** Карточка события в афише. */
export function EventCard({ e, lang, showCity }: { e: CityEvent; lang: Locale; showCity?: boolean }) {
  const k = kindOf(e.kind);
  return (
    <Link href={href(lang, `/afisha/${e.slug}`)} className="group flex overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)] sm:flex-col">
      <div className="relative w-28 shrink-0 overflow-hidden bg-cream sm:aspect-[16/10] sm:w-auto">
        {e.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.image} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <span className="flex h-full min-h-28 items-center justify-center text-[40px] sm:text-[56px]" aria-hidden>
            {k.emoji}
          </span>
        )}
        <span className="absolute left-2 top-2 hidden rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-semibold sm:inline-block">
          {k.emoji} {k.label[lang]}
        </span>
      </div>
      <div className="min-w-0 p-3.5 sm:p-4">
        <p className="text-[12.5px] font-semibold text-brand">{eventWhen(e, lang)}</p>
        <p className="mt-1 line-clamp-2 text-[15.5px] font-semibold leading-snug group-hover:text-brand">{e.title}</p>
        <p className="mt-1 line-clamp-1 text-[13px] text-muted">
          {[e.venue, showCity ? cityLabel(e.city, lang) : null].filter(Boolean).join(" · ")}
        </p>
        {e.price && <p className="mt-1 text-[13px] font-medium">{e.price}</p>}
      </div>
    </Link>
  );
}
