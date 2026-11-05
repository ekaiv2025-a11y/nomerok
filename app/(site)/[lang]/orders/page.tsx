import type { Metadata } from "next";
import Link from "next/link";
import { isLive, listOrders } from "@/lib/orders-db";
import { OrderCard } from "@/components/OrderCard";
import { ORD } from "@/lib/orders-text";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { getDict, href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return pageMeta(lang, "/orders", `${ORD[lang].title} — NomerOk`, ORD[lang].lead);
}

export default async function OrdersPage({ params, searchParams }: LangParams & { searchParams: Promise<{ cat?: string }> }) {
  const lang = await langOf(params);
  const t = ORD[lang];
  const { cat } = await searchParams;
  const month = await listOrders().catch(() => []);
  const all = month.filter(isLive);
  const answered = month.filter((o) => o.responses > 0).length;
  const cats = [...new Set(all.map((o) => o.category))].filter((c) => CATEGORIES.some((x) => x.id === c));
  const list = cat ? all.filter((o) => o.category === cat) : all;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold sm:text-[32px]">📋 {t.title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.lead}</p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-3">
        {t.steps.map((s, i) => (
          <li key={i} className="flex gap-2 rounded-2xl border border-line bg-white p-3 text-[13.5px] leading-snug">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-bold text-brand-dark">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={href(lang, "/request")} className="btn-primary h-10 px-4 text-[14px]">
          + {getDict(lang).nav.leaveRequest}
        </Link>
        <Link href={href(lang, "/join")} className="btn-ghost h-10 px-4 text-[14px]">
          {t.takeSpec}
        </Link>
      </div>
      {cats.length > 1 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={href(lang, "/orders")} className={`h-8 rounded-full px-3.5 pt-1.5 text-[13px] ${!cat ? "bg-ink text-white" : "border border-line bg-white"}`}>
            {getAll(lang)} · {all.length}
          </Link>
          {cats.map((c) => (
            <Link key={c} href={href(lang, `/orders?cat=${c}`)} className={`h-8 rounded-full px-3.5 pt-1.5 text-[13px] ${cat === c ? "bg-ink text-white" : "border border-line bg-white"}`}>
              {categoryLabel(c, lang)} · {all.filter((o) => o.category === c).length}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-5 space-y-3">
        {month.length >= 10 && <p className="text-[13px] text-muted">{t.stats(month.length, answered)}</p>}
        {list.length === 0 ? <p className="rounded-2xl bg-cream p-6 text-center text-[15px] text-muted">{month.length ? t.emptyLive : t.empty}</p> : list.map((o) => <OrderCard key={o.id} o={o} lang={lang} />)}
      </div>
    </div>
  );
}

function getAll(lang: "ru" | "en" | "ka") {
  return { ru: "Все", en: "All", ka: "ყველა" }[lang];
}
