import { getDict, type Locale } from "@/lib/i18n";
import type { MasterStats } from "@/lib/stats";

/** Кабинет: сколько раз смотрели профиль, открывали контакты, сколько заявок взято. */
export function StatsCard({ lang, week, month, byDay }: { lang: Locale; week: MasterStats; month: MasterStats; byDay: { day: string; n: number }[] }) {
  const t = getDict(lang).cabinet;
  const max = Math.max(1, ...byDay.map((d) => d.n));
  const rows: [string, number, number][] = [
    [t.statViews, week.views, month.views],
    [t.statContacts, week.contacts, month.contacts],
    [t.statTaken, week.taken, month.taken],
  ];
  return (
    <section className="rounded-2xl border border-line p-5">
      <h2 className="text-[18px] font-bold">{t.statsTitle}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {rows.map(([label, w, mo]) => (
          <div key={label} className="rounded-xl bg-cream p-3">
            <p className="text-[26px] font-bold leading-none">{w}</p>
            <p className="mt-1 text-[12px] leading-tight text-muted">{label}</p>
            <p className="mt-2 text-[12px] text-muted">
              {t.stats30}: <b className="text-ink">{mo}</b>
            </p>
          </div>
        ))}
      </div>
      <p className="mt-1 text-right text-[11px] text-muted">↑ {t.stats7}</p>
      {/* Просмотры по дням за 30 дней */}
      <div className="mt-2 flex h-16 items-end gap-[3px]" aria-hidden>
        {byDay.map((d) => (
          <div key={d.day} title={`${d.day}: ${d.n}`} className="flex-1 rounded-t-sm bg-brand/70" style={{ height: `${Math.max(4, (d.n / max) * 100)}%`, opacity: d.n ? 1 : 0.25 }} />
        ))}
      </div>
      <p className="mt-3 text-[13px] leading-snug text-muted">{t.statsHint}</p>
    </section>
  );
}
