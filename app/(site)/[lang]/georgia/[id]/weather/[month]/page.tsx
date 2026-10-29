import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { GEO, MONTHS, cap, geoPage, monthIndex, type GeoMonth } from "@/lib/geo";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

type Props = { params: Promise<{ lang: string; id: string; month: string }> };

export function generateStaticParams() {
  return GEO.filter((g) => g.climate).flatMap((g) => MONTHS.map((m) => ({ lang: "ru", id: g.id, month: m.slug })));
}

const r = (n: number) => Math.round(n);

/** Можно ли купаться — по средней температуре моря. */
function swim(sea?: number): { ok: boolean; text: string } | null {
  if (sea == null) return null;
  if (sea >= 22) return { ok: true, text: `Да: море в среднем около ${r(sea)} °C — комфортно для купания.` };
  if (sea >= 20) return { ok: true, text: `Можно в тёплые дни: море около ${r(sea)} °C, освежающе.` };
  if (sea >= 17) return { ok: false, text: `Прохладно: море около ${r(sea)} °C — купаются только закалённые.` };
  return { ok: false, text: `Нет: море около ${r(sea)} °C — слишком холодно для купания.` };
}

function compare(cur: GeoMonth, prev: GeoMonth, next: GeoMonth, prevName: string, nextName: string): string {
  const d1 = r(cur.tmax - prev.tmax);
  const d2 = r(next.tmax - cur.tmax);
  const a = d1 === 0 ? `так же тепло, как ${prevName}` : d1 > 0 ? `на ${d1}° теплее, чем ${prevName}` : `на ${-d1}° прохладнее, чем ${prevName}`;
  const b = d2 === 0 ? `${nextName} будет примерно так же` : d2 > 0 ? `${nextName} — ещё на ${d2}° теплее` : `${nextName} — на ${-d2}° прохладнее`;
  return `Днём ${a}; ${b}.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id, month } = await params;
  const g = geoPage(id);
  const i = monthIndex(month);
  if (lang !== "ru" || !g?.climate || i < 0) return {};
  const m = g.climate.months[i];
  const t = `Погода ${g.nameIn} ${MONTHS[i].in}: температура воздуха${m.sea != null ? " и моря" : ""}, дожди, что надеть`;
  const d = `${cap(MONTHS[i].name)} ${g.nameIn}: днём около ${r(m.tmax)} °C, ночью ${r(m.tmin)} °C${m.sea != null ? `, море ${r(m.sea)} °C` : ""}, ${m.rainDays} дождливых дней. Чем заняться и что взять с собой.`;
  return pageMeta("ru", `/georgia/${g.id}/weather/${month}`, t, d);
}

export default async function GeoMonthPage({ params }: Props) {
  const { lang, id, month } = await params;
  const g = geoPage(id);
  const i = monthIndex(month);
  if (lang !== "ru" || !g?.climate || i < 0) notFound();
  const ms = g.climate.months;
  const m = ms[i];
  const p = (i + 11) % 12;
  const n = (i + 1) % 12;
  const info = g.months?.[i];
  const sw = swim(m.sea);
  const wettest = ms.reduce((a, b, k) => (b.rain > ms[a].rain ? k : a), 0);
  const driest = ms.reduce((a, b, k) => (b.rain < ms[a].rain ? k : a), 0);
  const stats: [string, string, string][] = [
    ["☀️", "Днём", `${r(m.tmax)} °C`],
    ["🌙", "Ночью", `${r(m.tmin)} °C`],
    ...(m.sea != null ? ([["🌊", "Море", `${r(m.sea)} °C`]] as [string, string, string][]) : []),
    ["☔", "Дождливых дней", `${m.rainDays}`],
    ["💧", "Осадки", `${r(m.rain)} мм`],
    ...(m.sun != null ? ([["🌤", "Солнца за месяц", `${r(m.sun)} ч`]] as [string, string, string][]) : []),
  ];
  const faq = [
    ...(sw ? [{ q: `Можно ли купаться ${g.nameIn} ${MONTHS[i].in}?`, a: sw.text }] : []),
    { q: `Какая температура ${g.nameIn} ${MONTHS[i].in}?`, a: `В среднем днём около ${r(m.tmax)} °C, ночью около ${r(m.tmin)} °C.` },
    { q: `Много ли дождей ${g.nameIn} ${MONTHS[i].in}?`, a: `В среднем ${m.rainDays} дождливых дней и около ${r(m.rain)} мм осадков. Самый дождливый месяц — ${MONTHS[wettest].name}, самый сухой — ${MONTHS[driest].name}.` },
    ...(info ? [{ q: `Что взять с собой ${g.nameIn} ${MONTHS[i].in}?`, a: info.wear }] : []),
  ];
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Грузия", item: `${SITE_URL}/ru/georgia` }, { "@type": "ListItem", position: 2, name: g.name, item: `${SITE_URL}/ru/georgia/${g.id}` }, { "@type": "ListItem", position: 3, name: `Погода ${MONTHS[i].in}`, item: `${SITE_URL}/ru/georgia/${g.id}/weather/${month}` }] };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([ld, crumbs]) }} />
      <nav className="flex flex-wrap gap-1.5 text-[14px] text-muted">
        <Link href={href("ru", "/georgia")} className="hover:text-brand">Грузия</Link> ›
        <Link href={href("ru", `/georgia/${g.id}`)} className="hover:text-brand">{g.name}</Link> ›
        <Link href={href("ru", `/georgia/${g.id}/weather`)} className="hover:text-brand">Погода</Link>
      </nav>
      <h1 className="mt-2 text-[28px] font-bold leading-tight sm:text-[36px]">
        Погода {g.nameIn} {MONTHS[i].in}
      </h1>
      <p className="mt-2 text-[16px] leading-relaxed text-[#3a3935]">{compare(m, ms[p], ms[n], MONTHS[p].in, MONTHS[n].in)}</p>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {stats.map(([e, k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[13px] text-muted">
              {e} {k}
            </p>
            <p className="mt-1 text-[24px] font-bold">{v}</p>
          </div>
        ))}
      </div>

      {sw && (
        <p className={`mt-5 rounded-2xl p-4 text-[16px] ${sw.ok ? "bg-[#e3f1f6] text-[#1d5a78]" : "bg-cream"}`}>
          <b>Купаться?</b> {sw.text}
        </p>
      )}
      {info && (
        <>
          <h2 className="mt-8 text-[22px] font-bold">Чем заняться</h2>
          <p className="mt-2 text-[16px] leading-relaxed">{info.what}</p>
          <h2 className="mt-6 text-[22px] font-bold">Что надеть и взять с собой</h2>
          <p className="mt-2 text-[16px] leading-relaxed">{info.wear}</p>
        </>
      )}

      <h2 className="mt-8 text-[22px] font-bold">Другие месяцы</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {MONTHS.map((mm, k) => (
          <Link key={mm.slug} href={href("ru", `/georgia/${g.id}/weather/${mm.slug}`)} className={`rounded-full border px-3 py-1.5 text-[13px] ${k === i ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-brand"}`}>
            {cap(mm.name)} {r(ms[k].tmax)}°
          </Link>
        ))}
      </div>

      <h2 className="mt-8 text-[22px] font-bold">Вопросы</h2>
      <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
        {faq.map((f) => (
          <div key={f.q} className="p-4">
            <p className="font-semibold">{f.q}</p>
            <p className="mt-1 text-[15px] text-[#3a3935]">{f.a}</p>
          </div>
        ))}
      </div>

      <Link href={href("ru", `/georgia/${g.id}`)} className="mt-8 flex items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-4 text-[16px] font-semibold text-white hover:bg-brand-dark">
        Путеводитель: {g.name} — районы, транспорт, что посмотреть <span aria-hidden>→</span>
      </Link>
      <p className="mt-6 text-[12px] text-muted">
        Средние многолетние значения, конкретный год может отличаться. Источник:{" "}
        <a href={g.climate.source.url} target="_blank" rel="noopener noreferrer nofollow" className="underline">
          {g.climate.source.name}
        </a>
        .
      </p>
    </div>
  );
}
