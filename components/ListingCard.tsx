import Link from "next/link";
import { AMENITIES, BUILDINGS, CONDITIONS, DEALS, KINDS, floorLabel, priceLabel, pricePerM2, roomsLabel, type Listing } from "@/lib/realty";
import { href, type Locale } from "@/lib/i18n";
import { cityLabel } from "@/lib/cities";

/** Карточка объявления недвижимости. */
export function ListingCard({ l, lang, realtor }: { l: Listing; lang: Locale; realtor?: { name: string } | null }) {
  const fl = floorLabel(l, lang);
  const params = [l.kind === "apartment" ? roomsLabel(l.rooms, lang) : KINDS[l.kind][lang], l.area ? `${l.area} м²` : "", fl ? `${fl} ${lang === "ru" ? "эт." : lang === "ka" ? "სართ." : "fl."}` : ""].filter(Boolean).join(" · ");
  const tags = [l.building === "new" ? BUILDINGS.new[lang] : null, l.condition === "new_renovation" || l.condition === "renovated" ? CONDITIONS[l.condition][lang] : null].filter(Boolean) as string[];
  const icons = (l.amenities ?? []).filter((a) => ["sea_view", "mountain_view", "balcony", "pool", "pets_ok", "parking"].includes(a) && a in AMENITIES).slice(0, 4);
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
        {!l.master_id && l.poster_kind === "owner" && <span className="absolute right-2 top-2 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white">🔑 {{ ru: "Собственник", en: "Owner", ka: "მესაკუთრე" }[lang]}</span>}
        {l.photos.length > 1 && <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">📷 {l.photos.length}</span>}
      </span>
      <span className="flex flex-1 flex-col p-3">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[17px] font-bold">{priceLabel(l, lang)}</span>
          {pricePerM2(l) && <span className="text-[12px] text-muted">{pricePerM2(l)}</span>}
        </span>
        {params && <span className="mt-0.5 text-[13px] text-[#3a3935]">{params}</span>}
        {(tags.length > 0 || icons.length > 0) && (
          <span className="mt-1 flex flex-wrap gap-1">
            {tags.map((x) => (
              <span key={x} className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-dark">
                {x}
              </span>
            ))}
            {icons.map((a) => (
              <span key={a} className="rounded-full bg-cream px-2 py-0.5 text-[11px]" title={AMENITIES[a][lang]}>
                {AMENITIES[a].e} {AMENITIES[a][lang]}
              </span>
            ))}
          </span>
        )}
        <span className="mt-1 line-clamp-2 text-[13px] text-muted">{l.title}</span>
        <span className="mt-auto pt-2 text-[12px] text-muted">
          📍 {[l.district, cityLabel(l.city, lang)].filter(Boolean).join(", ")}
          {realtor ? ` · ${realtor.name}` : ""}
          <span className="block">{new Date(l.expires_at ? Date.parse(l.expires_at) - 60 * 86400_000 : Date.parse(l.created_at)).toLocaleString(lang === "ka" ? "ka-GE" : lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tbilisi" })}</span>
        </span>
      </span>
    </Link>
  );
}
