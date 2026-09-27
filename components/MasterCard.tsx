import Link from "next/link";
import { Avatar } from "./Avatar";
import { RatingLine } from "./Stars";
import { categoryLabel, unitLabel } from "@/lib/categories";
import { getDict, href, type Locale } from "@/lib/i18n";
import type { PublicMaster } from "@/lib/types";

export function priceText(m: Pick<PublicMaster, "price_from" | "price_unit">, lang: Locale) {
  const t = getDict(lang).card;
  if (m.price_from == null) return t.byAgreement;
  return t.from(m.price_from, unitLabel(m.price_unit, lang));
}

export function MasterCard({ m, lang }: { m: PublicMaster; lang: Locale }) {
  const t = getDict(lang).card;
  const firstLine = m.services.split(/\n|;/)[0]?.trim() ?? "";
  return (
    <Link
      href={href(lang, `/master/${m.slug}`)}
      className="group flex flex-col rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#cfcac0] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start gap-3">
        <Avatar name={m.name} photo={m.photo_url} size={56} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[16px] font-semibold leading-tight group-hover:text-brand">{m.name}</h3>
          {m.verified && <VerifiedBadge label={t.verified} />}
          {m.docs_verified && (
            <span className="ml-1">
              <VerifiedBadge label={t.docsVerified} />
            </span>
          )}
          {m.demo && <DemoBadge label={t.demo} />}
          {m.away && <AwayBadge label={t.away} />}
          {m.place_lat != null && (m.work_mode === "at_place" || m.work_mode === "both") && (
            <span className="ml-1 mt-1 inline-flex rounded-full bg-cream px-2 py-0.5 text-[11.5px] text-muted">📍 {t.atPlace}</span>
          )}
          <div className="mt-1 text-[13px] text-muted">
            {categoryLabel(m.category, lang)}
            {m.extra_categories?.length ? ` +${m.extra_categories.length}` : ""}
          </div>
          {m.experience_years ? <div className="mt-0.5 text-[12px] text-muted">{t.experience(m.experience_years)}</div> : null}
          {m.rating != null && m.reviews > 0 && (
            <div className="mt-1">
              <RatingLine rating={m.rating} count={m.reviews} label={getDict(lang).reviews.count(m.reviews)} />
            </div>
          )}
        </div>
      </div>
      {firstLine && <p className="mt-3 line-clamp-2 text-[14px] leading-snug text-[#3a3935]">{firstLine}</p>}
      {m.portfolio?.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {m.portfolio.slice(0, 3).map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.url} src={p.url} alt="" loading="lazy" className="aspect-square w-full rounded-lg bg-cream object-cover" />
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-[14px] font-semibold">{priceText(m, lang)}</span>
        <span className="shrink-0 text-[13px] font-semibold text-brand">{t.more}</span>
      </div>
    </Link>
  );
}

export function VerifiedBadge({ label, large = false }: { label: string; large?: boolean }) {
  return (
    <span className={`mt-1 inline-flex items-center gap-1 rounded-full bg-brand-soft font-medium text-brand-dark ${large ? "px-2.5 py-1 text-[13px]" : "px-2 py-0.5 text-[11.5px]"}`}>
      <svg viewBox="0 0 16 16" className={large ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden>
        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </span>
  );
}

export function DemoBadge({ label }: { label: string }) {
  return <span className="mt-1 inline-flex rounded-full bg-[#fdf6e6] px-2 py-0.5 text-[11.5px] font-medium text-[#8a6a1f]">{label}</span>;
}

export function AwayBadge({ label }: { label: string }) {
  return <span className="ml-1 mt-1 inline-flex rounded-full bg-[#f1efe9] px-2 py-0.5 text-[11.5px] font-medium text-muted">⏸ {label}</span>;
}
