import Link from "next/link";
import { Avatar } from "./Avatar";
import { categoryLabel } from "@/lib/categories";
import type { PublicMaster } from "@/lib/types";

export function priceText(m: Pick<PublicMaster, "price_from" | "price_unit">) {
  if (m.price_from == null) return "Цена по договорённости";
  return `от ${m.price_from} ₾ / ${m.price_unit}`;
}

export function MasterCard({ m }: { m: PublicMaster }) {
  const firstLine = m.services.split(/\n|;/)[0]?.trim() ?? "";
  return (
    <Link
      href={`/master/${m.slug}`}
      className="group flex flex-col rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#cfcac0] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start gap-3">
        <Avatar name={m.name} photo={m.photo_url} size={56} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[16px] font-semibold leading-tight group-hover:text-brand">{m.name}</h3>
          <div className="mt-1 text-[13px] text-muted">{categoryLabel(m.category)}</div>
          {m.experience_years ? <div className="mt-0.5 text-[12px] text-muted">Опыт {m.experience_years} {yearsWord(m.experience_years)}</div> : null}
        </div>
      </div>
      {firstLine && <p className="mt-3 line-clamp-2 text-[14px] leading-snug text-[#3a3935]">{firstLine}</p>}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-[14px] font-semibold">{priceText(m)}</span>
        <span className="text-[13px] font-semibold text-brand">Подробнее →</span>
      </div>
    </Link>
  );
}

export function yearsWord(n: number) {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return "год";
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return "года";
  return "лет";
}
