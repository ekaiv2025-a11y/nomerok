import Link from "next/link";
import { CardPhotos } from "./CardPhotos";
import { RatingLine } from "./Stars";
import { categoryLabel, unitLabel } from "@/lib/categories";
import { subcatLine } from "@/lib/subcats";
import { cardSummary } from "@/lib/card-summary";

const MODE: Record<string, Record<Locale, string>> = {
  at_client: { ru: "🚗 Выезд к клиенту", en: "🚗 Comes to you", ka: "🚗 გამოძახებით" },
  online: { ru: "💻 Онлайн", en: "💻 Online", ka: "💻 ონლაინ" },
};
const LANG_SHORT: Record<string, string> = { Русский: "RU", Грузинский: "KA", Английский: "EN", Украинский: "UA", Турецкий: "TR" };
import { getDict, href, type Locale } from "@/lib/i18n";
import type { PublicMaster } from "@/lib/types";

export function priceText(m: Pick<PublicMaster, "price_from" | "price_unit">, lang: Locale) {
  const t = getDict(lang).card;
  if (m.price_from == null) return t.byAgreement;
  return t.from(m.price_from, unitLabel(m.price_unit, lang));
}

export function MasterCard({ m, lang }: { m: PublicMaster; lang: Locale }) {
  const t = getDict(lang).card;
  const link = href(lang, `/master/${m.slug}`);
  const atPlace = m.place_lat != null && (m.work_mode === "at_place" || m.work_mode === "both");
  const summary = cardSummary(m.services, m.about);
  const mode = !atPlace ? MODE[m.work_mode === "both" ? "at_client" : m.work_mode]?.[lang] : null;
  const langs = (m.languages ?? []).map((l) => LANG_SHORT[l]).filter(Boolean);
  // Вертикальная карточка: фото сверху, ниже — кто это, чем занимается и цена. Вся карточка ведёт в профиль.
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-[#cfcac0] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-cream">
        <CardPhotos
          name={m.name}
          photo={m.photo_url}
          works={(m.portfolio ?? []).map((p) => p.url)}
          href={link}
          labels={{ prev: t.prevPhoto, next: t.nextPhoto }}
        />
        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">
          {m.demo && <span className="rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-medium text-[#8a6a1f] shadow-sm">{t.demo}</span>}
          {m.away && <span className="rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-medium text-muted shadow-sm">⏸ {t.away}</span>}
        </div>
      </div>
      <Link href={link} className="flex flex-1 flex-col p-3 sm:p-4">
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
          {subcatLine(m, lang) ?? categoryLabel(m.category, lang)}
          {m.experience_years ? <span className="hidden sm:inline"> · {t.experience(m.experience_years)}</span> : null}
        </div>
        {m.rating != null && m.reviews > 0 && (
          <div className="mt-1">
            <RatingLine rating={m.rating} count={m.reviews} label={getDict(lang).reviews.count(m.reviews)} />
          </div>
        )}
        {summary && <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-[#3a3935]">{summary}</p>}
        {(atPlace || mode || langs.length > 0) && (
          <div className="mt-2 flex max-h-[22px] flex-wrap gap-1 overflow-hidden sm:max-h-none">
            {atPlace && <span className="max-w-full truncate rounded-full bg-cream px-2 py-0.5 text-[11px] text-muted">📍 {m.place_address?.trim() || t.atPlace}</span>}
            {mode && <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-muted">{mode}</span>}
            {langs.length > 0 && <span className="hidden rounded-full bg-cream px-2 py-0.5 text-[11px] text-muted sm:inline">🗣 {langs.join(" · ")}</span>}
          </div>
        )}
        <div className={`mt-auto pt-2.5 sm:pt-3 ${m.price_from == null ? "text-[13px] text-muted" : "text-[14px] font-semibold"}`}>{priceText(m, lang)}</div>
      </Link>
    </div>
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
