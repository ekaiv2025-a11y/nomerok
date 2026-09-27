"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getDict, type Locale } from "@/lib/i18n";

function plusDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Кабинет: «принимаю заявки» / «на паузе». */
export function AvailabilityCard({ lang, away, untilLabel }: { lang: Locale; away: boolean; untilLabel: string | null }) {
  const t = getDict(lang).cabinet;
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [date, setDate] = useState(plusDays(7));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save(body: { away: boolean; until?: string | null }) {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/cabinet/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, lang }),
    }).catch(() => null);
    const j = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!j.ok) return setErr(j.error || getDict(lang).form.sendError);
    setPicking(false);
    router.refresh();
  }

  const quick: [string, number][] = [
    [t.week, 7],
    [t.twoWeeks, 14],
    [t.month, 30],
  ];

  return (
    <div className={`rounded-2xl border p-5 ${away ? "border-accent/60 bg-[#fdf6e6]" : "border-line"}`}>
      <p className="text-[13px] text-muted">{t.availTitle}</p>
      <p className="mt-2 flex items-center gap-2 text-[16px] font-semibold">
        <span className={`h-2.5 w-2.5 rounded-full ${away ? "bg-accent" : "bg-brand"}`} />
        {away ? (untilLabel ? t.pausedUntil(untilLabel) : t.pausedNoEnd) : t.availOn}
      </p>
      <p className="mt-1 text-[13px] leading-snug text-muted">{away ? t.availOffText : t.availOnText}</p>

      {away ? (
        <button type="button" disabled={busy} onClick={() => save({ away: false })} className="btn-primary mt-4 h-10 w-full text-[14px]">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} {t.resumeBtn}
        </button>
      ) : !picking ? (
        <button type="button" onClick={() => setPicking(true)} className="btn-ghost mt-4 h-10 w-full text-[14px]">
          ⏸ {t.pauseBtn}
        </button>
      ) : (
        <div className="mt-4">
          <p className="text-[14px] font-semibold">{t.pauseFor}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {quick.map(([label, n]) => (
              <button key={n} type="button" disabled={busy} onClick={() => save({ away: true, until: plusDays(n) })} className="btn-ghost h-9 text-[13px]">
                {label}
              </button>
            ))}
            <button type="button" disabled={busy} onClick={() => save({ away: true, until: null })} className="btn-ghost h-9 text-[13px]">
              {t.noEnd}
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <input type="date" value={date} min={plusDays(1)} max={plusDays(366)} onChange={(e) => setDate(e.target.value)} className="field h-9 flex-1 py-1 text-[14px]" />
            <button type="button" disabled={busy || !date} onClick={() => save({ away: true, until: date })} className="btn-primary h-9 px-3 text-[13px]">
              {t.untilDate}
            </button>
          </div>
          <p className="mt-2 text-[12px] text-muted">{t.autoResume}</p>
        </div>
      )}
      {err && <p className="mt-2 text-[13px] text-danger">{err}</p>}
    </div>
  );
}
