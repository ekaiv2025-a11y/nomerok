import Link from "next/link";
import type { Block } from "@/lib/articles";
import { makeLinker } from "@/lib/autolink";
import { href } from "@/lib/i18n";
import { Map } from "@/components/map/Map";

/** Текстовые блоки страниц «Грузии» (те же, что в журнале: абзац, список, совет, кнопки, карта). */
export function GeoBlocks({ blocks, self, cityQuery }: { blocks: Block[]; self: string; cityQuery?: string }) {
  // только ручные ссылки: автоссылок на странице города было бы слишком много
  const linkify = makeLinker(self, { auto: false });
  return (
    <div className="space-y-4 text-[16px] leading-relaxed text-[#2a2925]">
      {blocks.map((b, i) => {
        if ("h2" in b) return <h3 key={i} className="pt-2 text-[18px] font-bold text-ink">{b.h2}</h3>;
        if ("p" in b) return <p key={i}>{linkify(b.p)}</p>;
        if ("list" in b) {
          const L = b.ordered ? "ol" : "ul";
          return (
            <L key={i} className={`space-y-1.5 pl-6 ${b.ordered ? "list-decimal" : "list-disc"} marker:text-brand`}>
              {b.list.map((x, j) => <li key={j}>{linkify(x)}</li>)}
            </L>
          );
        }
        if ("tip" in b) return <p key={i} className="rounded-2xl border border-[#f0d58a] bg-[#fff8e6] p-4 text-[15px]">💡 {linkify(b.tip)}</p>;
        if ("map" in b)
          return (
            <div key={i} className="overflow-hidden rounded-2xl border border-line bg-white p-2">
              <Map height={340} points={b.map.map((x, k) => ({ lat: x.lat, lng: x.lng, label: k + 1, title: `${k + 1}. ${x.name}`, subtitle: x.note }))} />
            </div>
          );
        if ("link" in b)
          return (
            <Link key={i} href={href("ru", b.href)} className="flex items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-4 text-[16px] font-semibold text-white hover:bg-brand-dark">
              {b.link} <span aria-hidden>→</span>
            </Link>
          );
        if ("cta" in b)
          return (
            <Link key={i} href={href("ru", `/services/${b.cat}${cityQuery ? `?city=${cityQuery}` : ""}`)} className="flex items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-4 text-[16px] font-semibold text-white hover:bg-brand-dark">
              {b.cta} <span aria-hidden>→</span>
            </Link>
          );
        return null;
      })}
    </div>
  );
}
