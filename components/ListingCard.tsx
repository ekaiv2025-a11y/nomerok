import Link from "next/link";
import { DEALS, KINDS, priceLabel, roomsLabel, type Listing } from "@/lib/realty";
import { href, type Locale } from "@/lib/i18n";
import { cityLabel } from "@/lib/cities";

/** Карточка объявления недвижимости. */
export function ListingCard({ l, lang, realtor }: { l: Listing; lang: Locale; realtor?: { name: string } | null }) {
  const params = [l.kind === "apartment" ? roomsLabel(l.rooms, lang) : KINDS[l.kind][lang], l.area ? `${l.area} м²` : "", l.floor ? `${l.floor} ${lang === "ru" ? "эт." : lang === "ka" ? "სართ." : "fl."}` : ""].filter(Boolean).join(" · ");
  return (
    <Link href={href(lang, `/realty/${l.id}`)} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand hover:shadow-sm">
      <span className="relative block aspect-[4/3] bg-cream">
        {l.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={l.photos[0]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[44px]">🏠</span>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-semibold">{DEALS[l.deal][lang]}</span>
        {l.photos.length > 1 && <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">📷 {l.photos.length}</span>}
      </span>
      <span className="flex flex-1 flex-col p-3">
        <span className="text-[17px] font-bold">{priceLabel(l, lang)}</span>
        {params && <span className="mt-0.5 text-[13px] text-[#3a3935]">{params}</span>}
        <span className="mt-1 line-clamp-2 text-[13px] text-muted">{l.title}</span>
        <span className="mt-auto pt-2 text-[12px] text-muted">
          📍 {[l.district, cityLabel(l.city, lang)].filter(Boolean).join(", ")}
          {realtor ? ` · ${realtor.name}` : ""}
        </span>
      </span>
    </Link>
  );
}
