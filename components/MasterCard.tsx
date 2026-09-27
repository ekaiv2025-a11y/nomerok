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
  const atPlace = m.place_lat != null && (m.work_mode === "at_place" || m.work_mode === "both");
  // Вертикальная карточка: фото сверху, ниже — кто это, чем занимается и цена. Вся карточка ведёт в профиль.
  return (
    <Link
      href={href(lang, `/master/${m.slug}`)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-[#cfcac0] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-cream">
        <CardPhoto name={m.name} photo={m.photo_url} />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {m.demo && <span className="rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-medium text-[#8a6a1f] shadow-sm">{t.demo}</span>}
          {m.away && <span className="rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-medium text-muted shadow-sm">⏸ {t.away}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-tight group-hover:text-brand sm:text-[16px]">
          {m.name}
          {m.verified && (
            <svg viewBox="0 0 16 16" className="ml-1 inline h-3.5 w-3.5 -translate-y-px text-brand" aria-label={t.verified}>
              <title>{t.verified}</title>
              <circle cx="8" cy="8" r="8" fill="currentColor" />
              <path d="M4.5 8.3l2.2 2.2 4.8-4.8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </h3>
        <div className="mt-1 text-[13px] text-muted">
          {categoryLabel(m.category, lang)}
          {m.extra_categories?.length ? ` +${m.extra_categories.length}` : ""}
          {m.experience_years ? <span className="hidden sm:inline"> · {t.experience(m.experience_years)}</span> : null}
        </div>
        {m.rating != null && m.reviews > 0 && (
          <div className="mt-1">
            <RatingLine rating={m.rating} count={m.reviews} label={getDict(lang).reviews.count(m.reviews)} />
          </div>
        )}
        {(m.docs_verified || atPlace) && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {m.docs_verified && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-dark">✓ {t.docsVerified}</span>}
            {atPlace && <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-muted">📍 {t.atPlace}</span>}
          </div>
        )}
        {firstLine && <p className="mt-2 hidden line-clamp-2 text-[13.5px] leading-snug text-[#3a3935] sm:block">{firstLine}</p>}
        <div className="mt-auto pt-2.5 text-[14px] font-semibold sm:pt-3">{priceText(m, lang)}</div>
      </div>
    </Link>
  );
}

function CardPhoto({ name, photo }: { name: string; photo: string | null }) {
  // Avatar сам покажет инициалы, если фото нет или оно не загрузилось
  return <Avatar name={name} photo={photo} alt="" size={400} className="!h-full !w-full !rounded-none !text-[48px] transition duration-300 group-hover:scale-[1.03]" />;
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
