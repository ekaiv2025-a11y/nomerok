import Link from "next/link";
import { Avatar } from "./Avatar";
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
          <div className="mt-1 text-[13px] text-muted">{categoryLabel(m.category, lang)}</div>
          {m.experience_years ? <div className="mt-0.5 text-[12px] text-muted">{t.experience(m.experience_years)}</div> : null}
        </div>
      </div>
      {firstLine && <p className="mt-3 line-clamp-2 text-[14px] leading-snug text-[#3a3935]">{firstLine}</p>}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-[14px] font-semibold">{priceText(m, lang)}</span>
        <span className="shrink-0 text-[13px] font-semibold text-brand">{t.more}</span>
      </div>
    </Link>
  );
}
