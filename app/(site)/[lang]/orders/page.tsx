import type { Metadata } from "next";
import Link from "next/link";
import { isLive, listOrders } from "@/lib/orders-db";
import { OrderCard } from "@/components/OrderCard";
import { ORD } from "@/lib/orders-text";
import { ORDERS_SEO } from "@/lib/orders-seo";
import { CATEGORIES, categoryLabel, categoryPlural } from "@/lib/categories";
import { seoCategoryIds } from "@/lib/seo-categories";
import { cityLabel } from "@/lib/cities";
import { href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  const s = ORDERS_SEO[lang];
  return pageMeta(lang, "/orders", s.title, s.description);
}

const ALL = { ru: "Все", en: "All", ka: "ყველა" } as const;

export default async function OrdersPage({ params, searchParams }: LangParams & { searchParams: Promise<{ cat?: string; city?: string }> }) {
  const lang = await langOf(params);
  const t = ORD[lang];
  const s = ORDERS_SEO[lang];
  const sp = await searchParams;
  const month = await listOrders().catch(() => []);
  const live = month.filter(isLive);
  const answered = month.filter((o) => o.responses > 0).length;
  const cats = [...new Set(live.map((o) => o.category))].filter((c) => CATEGORIES.some((x) => x.id === c));
  const cities = [...new Set(live.map((o) => o.city ?? "batumi"))];
  const cat = sp.cat && cats.includes(sp.cat) ? sp.cat : null;
  const city = sp.city && cities.includes(sp.city) ? sp.city : null;
  const list = live.filter((o) => (!cat || o.category === cat) && (!city || (o.city ?? "batumi") === city));
  const qs = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(Object.entries({ cat, city, ...patch }).filter(([, v]) => v) as [string, string][]);
    return href(lang, `/orders${p.toString() ? `?${p}` : ""}`);
  };
  const chip = (on: boolean) => `inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] font-medium ${on ? "bg-ink text-white" : "border border-line bg-white hover:border-ink"}`;
  const popular = seoCategoryIds().filter((c) => CATEGORIES.some((x) => x.id === c)).slice(0, 14);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Шапка */}
      <section className="rounded-3xl border border-line bg-cream px-5 py-6 sm:px-8 sm:py-9">
        <h1 className="max-w-3xl text-[26px] font-bold leading-tight sm:text-[36px]">📋 {s.h1}</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[17px]">{t.lead}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={href(lang, "/request")} className="btn-primary h-11 px-5 text-[15px]">
            + {s.clientCard.cta}
          </Link>
          <Link href={href(lang, "/join")} className="btn-ghost h-11 bg-white px-5 text-[15px]">
            {t.takeSpec}
          </Link>
        </div>
        <ol className="mt-6 grid gap-2 sm:grid-cols-3">
          {t.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 rounded-2xl bg-white p-3.5 text-[14px] leading-snug shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">{i + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Лента */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-[22px] font-bold">
              {s.feed} <span className="font-normal text-muted">· {live.length}</span>
            </h2>
            {month.length >= 10 && <p className="text-[13px] text-muted">{t.stats(month.length, answered)}</p>}
          </div>
          {cats.length > 1 && (
            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              <Link href={qs({ cat: null })} className={chip(!cat)}>
                {ALL[lang]}
              </Link>
              {cats.map((c) => (
                <Link key={c} href={qs({ cat: c })} className={chip(cat === c)}>
                  {categoryLabel(c, lang)} · {live.filter((o) => o.category === c).length}
                </Link>
              ))}
            </div>
          )}
          {cities.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href={qs({ city: null })} className={chip(!city)}>
                📍 {ALL[lang]}
              </Link>
              {cities.map((c) => (
                <Link key={c} href={qs({ city: c })} className={chip(city === c)}>
                  {cityLabel(c, lang)}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-4 space-y-3">
            {list.length > 0 ? (
              list.map((o) => <OrderCard key={o.id} o={o} lang={lang} />)
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center">
                <p className="text-[32px]">🙌</p>
                <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted">{month.length ? t.emptyLive : t.empty}</p>
                <Link href={href(lang, "/request")} className="btn-primary mt-4 h-10 px-5 text-[14px]">
                  + {s.clientCard.cta}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Боковая колонка */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-brand/25 bg-brand-soft p-5">
            <p className="text-[17px] font-bold text-brand-dark">{s.clientCard.h}</p>
            <ul className="mt-2.5 space-y-1.5 text-[14px] leading-snug text-[#2f4a3e]">
              {s.clientCard.list.map((x) => (
                <li key={x}>✓ {x}</li>
              ))}
            </ul>
            <Link href={href(lang, "/request")} className="btn-primary mt-4 h-10 w-full text-[14px]">
              {s.clientCard.cta}
            </Link>
          </div>
          <div className="rounded-2xl border border-accent/40 bg-[#fffaf0] p-5">
            <p className="text-[17px] font-bold text-[#5a4410]">{s.specCard.h}</p>
            <ul className="mt-2.5 space-y-1.5 text-[14px] leading-snug text-[#5a4410]">
              {s.specCard.list.map((x) => (
                <li key={x}>✓ {x}</li>
              ))}
            </ul>
            <Link href={href(lang, "/join")} className="btn mt-4 h-10 w-full rounded-full bg-accent text-[14px] font-semibold text-ink hover:bg-[#cf9620]">
              {s.specCard.cta}
            </Link>
          </div>
          {popular.length > 0 && (
            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-[15px] font-bold">{s.popular}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {popular.map((c) => (
                  <Link key={c} href={href(lang, `/services/${c}`)} className="rounded-full border border-line px-3 py-1 text-[13px] hover:border-brand hover:text-brand">
                    {categoryPlural(c, lang)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Текст для поиска и для людей */}
      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        {s.blocks.map((b) => (
          <section key={b.h}>
            <h2 className="text-[20px] font-bold leading-snug sm:text-[22px]">{b.h}</h2>
            {b.p?.map((p) => (
              <p key={p} className="mt-3 text-[15px] leading-relaxed text-[#3a3935]">
                {p}
              </p>
            ))}
            {b.list && (
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[#3a3935]">
                {b.list.map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="text-brand">•</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-[22px] font-bold">{s.faqTitle}</h2>
        <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
          {s.faq.map((f) => (
            <details key={f.q} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold">
                {f.q}
                <span className="text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-brand px-6 py-8 text-center text-white sm:py-10">
        <h2 className="text-[22px] font-bold sm:text-[26px]">{s.bottom.h}</h2>
        <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-white/85">{s.bottom.p}</p>
        <Link href={href(lang, "/request")} className="btn mt-5 inline-flex h-11 rounded-full bg-white px-6 text-[15px] font-semibold text-brand hover:bg-cream">
          + {s.clientCard.cta}
        </Link>
      </section>
    </div>
  );
}
