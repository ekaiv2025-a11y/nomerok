import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { GEO, MONTHS, cap, geoPage } from "@/lib/geo";

export const revalidate = 86400;
type Props = { params: Promise<{ lang: string; id: string }> };

export function generateStaticParams() {
  return GEO.filter((g) => g.climate).map((g) => ({ lang: "ru", id: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const g = geoPage(id);
  if (lang !== "ru" || !g?.climate) return {};
  return pageMeta("ru", `/georgia/${g.id}/weather`, `Погода ${g.nameIn} по месяцам: температура воздуха и моря, дожди`, `Климат ${g.nameGen} по месяцам: средняя температура днём и ночью, море, осадки и солнечные часы. Когда ехать и когда купаться.`);
}

export default async function GeoWeather({ params }: Props) {
  const { lang, id } = await params;
  const g = geoPage(id);
  if (lang !== "ru" || !g?.climate) notFound();
  const ms = g.climate.months;
  const max = Math.max(...ms.map((m) => m.tmax));
  const swimMonths = ms.map((m, i) => (m.sea != null && m.sea >= 20 ? MONTHS[i].name : null)).filter(Boolean) as string[];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="flex flex-wrap gap-1.5 text-[14px] text-muted">
        <Link href={href("ru", "/georgia")} className="hover:text-brand">Грузия</Link> ›
        <Link href={href("ru", `/georgia/${g.id}`)} className="hover:text-brand">{g.name}</Link>
      </nav>
      <h1 className="mt-2 text-[28px] font-bold leading-tight sm:text-[36px]">Погода {g.nameIn} по месяцам</h1>
      {swimMonths.length > 0 && (
        <p className="mt-2 text-[16px] text-[#3a3935]">
          Купальный сезон (море от 20 °C): {swimMonths[0]} — {swimMonths[swimMonths.length - 1]}.
        </p>
      )}
      {/* наглядный график: высота столбца — дневная температура */}
      <div className="mt-6 flex h-40 items-end gap-1.5 rounded-2xl border border-line bg-white p-3">
        {ms.map((m, i) => (
          <Link key={i} href={href("ru", `/georgia/${g.id}/weather/${MONTHS[i].slug}`)} className="group flex flex-1 flex-col items-center justify-end gap-1" title={`${cap(MONTHS[i].name)}: ${Math.round(m.tmax)}°`}>
            <span className="text-[11px] font-semibold">{Math.round(m.tmax)}°</span>
            <span className="w-full rounded-t-md bg-[#f0b45a] group-hover:bg-brand" style={{ height: `${Math.max(8, (m.tmax / max) * 100)}px` }} />
            <span className="text-[11px] text-muted">{MONTHS[i].name.slice(0, 3)}</span>
          </Link>
        ))}
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[560px] text-[14px]">
          <thead className="bg-cream text-left text-[12px] text-muted">
            <tr>
              <th className="p-2.5">Месяц</th><th className="p-2.5">Днём</th><th className="p-2.5">Ночью</th>
              {ms[0].sea != null && <th className="p-2.5">Море</th>}
              <th className="p-2.5">Дождливых дней</th><th className="p-2.5">Осадки</th>
              {ms[0].sun != null && <th className="p-2.5">Солнце</th>}
            </tr>
          </thead>
          <tbody>
            {ms.map((m, i) => (
              <tr key={i} className="border-t border-line">
                <td className="p-2.5 font-semibold"><Link href={href("ru", `/georgia/${g.id}/weather/${MONTHS[i].slug}`)} className="text-brand hover:underline">{cap(MONTHS[i].name)}</Link></td>
                <td className="p-2.5">{Math.round(m.tmax)} °C</td><td className="p-2.5">{Math.round(m.tmin)} °C</td>
                {m.sea != null && <td className="p-2.5">{Math.round(m.sea)} °C</td>}
                <td className="p-2.5">{m.rainDays}</td><td className="p-2.5">{Math.round(m.rain)} мм</td>
                {m.sun != null && <td className="p-2.5">{Math.round(m.sun)} ч</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] text-muted">
        Средние многолетние значения. Источник: <a href={g.climate.source.url} target="_blank" rel="noopener noreferrer nofollow" className="underline">{g.climate.source.name}</a>.
      </p>
      <Link href={href("ru", `/georgia/${g.id}`)} className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-4 text-[16px] font-semibold text-white hover:bg-brand-dark">
        Путеводитель: {g.name} <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
