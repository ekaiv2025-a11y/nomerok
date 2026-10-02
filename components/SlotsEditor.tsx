"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { SLOT_TEXT, slotLabel, todayTbilisiStr, type Slot } from "@/lib/slots";
import type { Locale } from "@/lib/i18n";

/** Кабинет: свободные окна (дата + время). */
export function SlotsEditor({ lang, initial }: { lang: Locale; initial: Slot[] }) {
  const t = SLOT_TEXT[lang];
  const today = todayTbilisiStr();
  const [slots, setSlots] = useState<Slot[]>(initial);
  const [d, setD] = useState(today);
  const [time, setTime] = useState("");
  const [state, setState] = useState<"" | "saving" | "saved">("");

  async function save(next: Slot[]) {
    setSlots(next);
    setState("saving");
    const r = await fetch("/api/cabinet/slots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slots: next }) }).catch(() => null);
    const data = await r?.json().catch(() => null);
    if (data?.slots) setSlots(data.slots);
    setState(r?.ok ? "saved" : "");
  }
  const quick = (days: number) => new Date(Date.parse(today) + days * 86400000).toISOString().slice(0, 10);

  return (
    <section className="rounded-2xl border border-line p-5">
      <h2 className="text-[18px] font-bold">🗓 {t.edTitle}</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.edHint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {slots.length === 0 && <span className="text-[14px] text-muted">{t.empty}</span>}
        {slots.map((s) => (
          <span key={s.d + s.t} className="inline-flex items-center gap-1 rounded-full bg-brand-soft py-1 pl-3 pr-1 text-[14px] text-brand-dark">
            {slotLabel(s, lang)}
            <button type="button" onClick={() => save(slots.filter((x) => x !== s))} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white" aria-label="×">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <input type="date" value={d} min={today} onChange={(e) => setD(e.target.value)} className="field h-10 w-auto py-0" />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field h-10 w-auto py-0" aria-label={t.time} title={t.time} />
        <button type="button" onClick={() => d && save([...slots, { d, t: time }])} className="btn-primary h-10 px-4 text-[14px]">
          + {t.add}
        </button>
        <button type="button" onClick={() => save([...slots, { d: quick(0), t: "" }])} className="btn-ghost h-10 px-3 text-[13px]">
          {slotLabel({ d: quick(0), t: "" }, lang)}
        </button>
        <button type="button" onClick={() => save([...slots, { d: quick(1), t: "" }])} className="btn-ghost h-10 px-3 text-[13px]">
          {slotLabel({ d: quick(1), t: "" }, lang)}
        </button>
        {slots.length > 0 && (
          <button type="button" onClick={() => save([])} className="h-10 px-2 text-[13px] text-muted underline">
            {t.clear}
          </button>
        )}
        {state === "saving" && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
        {state === "saved" && <span className="text-[13px] text-brand">{t.saved}</span>}
      </div>
    </section>
  );
}
