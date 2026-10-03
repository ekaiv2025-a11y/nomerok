import Link from "next/link";
import { categoryLabel } from "@/lib/categories";
import { cityLabel } from "@/lib/cities";
import { href, type Locale } from "@/lib/i18n";
import { ORD } from "@/lib/orders-text";
import { publicText, type Order } from "@/lib/orders-db";

/** Карточка заказа в публичной ленте (без имени и телефона клиента). */
export function OrderCard({ o, lang, action }: { o: Order; lang: Locale; action?: React.ReactNode }) {
  const t = ORD[lang];
  const mins = Math.floor((Date.now() - Date.parse(o.created_at)) / 60000);
  const done = o.status === "done";
  const full = o.responses >= 3;
  return (
    <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
        <span className="font-semibold text-ink">{categoryLabel(o.category, lang)}</span>
        <span>· {cityLabel(o.city ?? "batumi", lang)}</span>
        <span>· {t.ago(mins)}</span>
        <span className="grow" />
        <span
          className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
            done ? "bg-cream text-muted" : o.responses ? "bg-brand-soft text-brand-dark" : "bg-[#fdf3dc] text-[#7a5a10]"
          }`}
        >
          {done ? t.closed : o.responses ? t.responded(o.responses) : t.open}
        </span>
      </div>
      <p className="mt-2 line-clamp-4 whitespace-pre-line text-[15px] leading-snug">{publicText(o.description)}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-muted">
        {o.when_text && (
          <span>
            🕒 {t.when}: {publicText(o.when_text)}
          </span>
        )}
        {(o.photos ?? []).length > 0 && <span>📷 {o.photos!.length} {t.photo}</span>}
      </div>
      {action ?? (!done && !full && (
        <div className="mt-3">
          <Link href={href(lang, `/cabinet?tab=orders#o-${o.id}`)} className="btn-ghost h-9 px-4 text-[13px]">
            ✋ {t.takeSpec}
          </Link>
        </div>
      ))}
    </div>
  );
}
