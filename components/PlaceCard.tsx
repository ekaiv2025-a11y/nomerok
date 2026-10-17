import Link from "next/link";
import { href } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { formatPhone } from "@/lib/phone";
import { placeAddr, placeCat, placeDesc, placeName, type Place } from "@/lib/places";
import { PlaceThumb } from "./PlaceThumb";

/** Карточка места в списке / подборке. */
export function PlaceCard({ p, lang, n, wide }: { p: Place; lang: Locale; n?: number; wide?: boolean }) {
  const c = placeCat(p.cat);
  const desc = placeDesc(p, lang);
  const phone = p.phones?.[0];
  const addr = placeAddr(p, lang);
  const tags = lang === "ru" ? (p.tags ?? []).slice(0, 4) : [];
  return (
    <div className="flex gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-brand">
      <span className="relative shrink-0">
        <PlaceThumb p={p} size={64} n={p.photos?.[0] ? undefined : n} />
        {n != null && p.photos?.[0] && <b className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] text-white">{n}</b>}
      </span>
      <div className="min-w-0 grow">
        <Link translate="no" href={href(lang, `/places/${p.slug}`)} className="notranslate block text-[16px] font-semibold leading-snug hover:text-brand">
          {placeName(p, lang)}
          {p.owner_verified_at && <span className="ml-1.5 text-[12px] font-medium text-brand" title="Подтверждено владельцем">✓</span>}
        </Link>
        <p className="mt-0.5 text-[13px] text-muted">
          {p.sub || c.label[lang]}
          {addr ? ` · ${addr.replace(/^Батуми,\s*/, "")}` : ""}
        </p>
        {tags.length > 0 && (
          <p className="mt-1.5 flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-muted">{t}</span>
            ))}
          </p>
        )}
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
