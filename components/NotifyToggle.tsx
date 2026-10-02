"use client";

import { useState } from "react";
import { SUB } from "@/lib/sub-text";
import type { Locale } from "@/lib/i18n";

export function NotifyToggle({ lang, initial, hasBot }: { lang: Locale; initial: boolean; hasBot: boolean }) {
  const t = SUB[lang];
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    const next = !on;
    const r = await fetch("/api/cabinet/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on: next }) }).catch(() => null);
    if (r?.ok) setOn(next);
    setBusy(false);
  }
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${on ? "border-brand/40 bg-brand-soft" : "border-line bg-white"}`}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={busy}
        onClick={toggle}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-brand" : "bg-[#d6d2c8]"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
      </button>
      <div>
        <p className="text-[15px] font-semibold">🔔 {t.label}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.hint}</p>
        {on && !hasBot && <p className="mt-1 text-[13px] text-[#8a5a00]">⚠️ Подключите Telegram-бота — без него заявки не дойдут.</p>}
      </div>
    </div>
  );
}
