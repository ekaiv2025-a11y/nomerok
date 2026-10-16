import Link from "next/link";
import { href } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { formatPhone } from "@/lib/phone";
import { placeCat, placeDesc, placeName, type Place } from "@/lib/places";

/** Карточка места в списке / подборке. */
export function PlaceCard({ p, lang, n, wide }: { p: Place; lang: Locale; n?: number; wide?: boolean }) {
  const c = placeCat(p.cat);
  const desc = placeDesc(p, lang);
  const phone = p.phones?.[0];
  return (
    <div className="flex gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-brand">
      {p.photos?.[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.photos[0]} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" loading="lazy" />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-[26px]" aria-hidden>
          {n ? <b className="text-[20px] text-brand">{n}</b> : c.emoji}
        </span>
      )}
      <div className="min-w-0 grow">
        <Link href={href(lang, `/places/${p.slug}`)} className="block text-[16px] font-semibold leading-snug hover:text-brand">
          {placeName(p, lang)}
          {p.owner_verified_at && <span className="ml-1.5 text-[12px] font-medium text-brand" title="Подтверждено владельцем">✓</span>}
        </Link>
        <p className="mt-0.5 text-[13px] text-muted">
          {p.sub || c.label[lang]}
          {p.addr ? ` · ${p.addr}` : ""}
        </p>
        {desc && <p className={`mt-1.5 text-[14px] leading-relaxed text-[#3a3935] ${wide ? "" : "line-clamp-2"}`}>{desc}</p>}
        {phone && (
          <a href={`tel:${phone}`} className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand hover:underline">
            📞 {formatPhone(phone)}
          </a>
        )}
      </div>
    </div>
  );
}
