"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { REF_TEXT } from "@/lib/referral-text";

type Props = {
  lang: Locale;
  initial: { active: boolean; friend: string; reward: string; max_uses: number; prefix: string } | null;
  suggestion: string;
  issued: number;
  codes: { code: string; name: string; created_at: string }[];
};

const LIMITS = [5, 10, 20, 50, 0];

/** Кабинет: бонус за рекомендацию — условия, лимит, начало кода и выданные коды. */
export function ReferralEditor({ lang, initial, suggestion, issued: issued0, codes }: Props) {
  const t = REF_TEXT[lang];
  const router = useRouter();
  const [active, setActive] = useState(initial?.active ?? false);
  const [friend, setFriend] = useState(initial?.friend ?? "");
  const [reward, setReward] = useState(initial?.reward ?? "");
  const [max, setMax] = useState(initial?.max_uses ?? 10);
  const [prefix, setPrefix] = useState(initial?.prefix ?? suggestion);
  const [issued, setIssued] = useState(issued0);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState("");
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);

  async function save(restart = false) {
    setErr("");
    if (active && friend.trim().length < 3) {
      setErr(t.friendLabel);
      return;
    }
    setState("saving");
    const r = await fetch("/api/cabinet/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active, friend, reward, max_uses: max, prefix, restart }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (j.ok) {
      setIssued(j.issued);
      setState("saved");
      router.refresh();
    } else setState("error");
  }

  return (
    <section className="rounded-2xl border border-line p-5">
      <h2 className="text-[18px] font-bold">{t.cabTitle}</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.cabHint}</p>
      <label className="mt-4 flex items-center gap-2 text-[15px] font-semibold">
        <input type="checkbox" checked={active} onChange={(e) => { setActive(e.target.checked); setState("idle"); }} className="h-5 w-5 accent-[#1f6b4f]" />
        {t.on}
      </label>
      {active && (
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-[14px] font-semibold">{t.friendLabel}</span>
            <input value={friend} onChange={(e) => { setFriend(e.target.value.slice(0, 140)); setState("idle"); }} placeholder={t.friendPh} className="field mt-1.5" />
          </label>
          <label className="block">
            <span className="text-[14px] font-semibold">{t.rewardLabel}</span> <span className="text-[13px] text-muted">{t.optional}</span>
            <input value={reward} onChange={(e) => { setReward(e.target.value.slice(0, 140)); setState("idle"); }} placeholder={t.rewardPh} className="field mt-1.5" />
          </label>
          <div>
            <p className="text-[14px] font-semibold">{t.limitLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {LIMITS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => { setMax(n); setState("idle"); }}
                  className={`rounded-full border px-3.5 py-1.5 text-[14px] font-medium ${max === n ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"}`}
                >
                  {n || t.noLimit}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[13px] text-muted">{t.issued(issued, max)}</p>
          </div>
          <label className="block">
            <span className="text-[14px] font-semibold">{t.prefixLabel}</span>
            <input value={prefix} onChange={(e) => { setPrefix(clean(e.target.value)); setState("idle"); }} className="field mt-1.5 font-mono uppercase tracking-wider" />
            <span className="mt-1 block text-[13px] text-muted">{t.prefixHint(`${prefix || "ANNA"}-7K2`)}</span>
          </label>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => save()} disabled={state === "saving"} className="btn-primary h-10 px-5 text-[14px]">
          {state === "saved" ? t.saved : t.save}
        </button>
        {active && issued > 0 && max > 0 && (
          <button type="button" onClick={() => save(true)} className="btn-ghost h-10 px-4 text-[14px]">
            {t.restart}
          </button>
        )}
        {err && <span className="text-[13px] text-danger">{err}</span>}
        {state === "error" && <span className="text-[13px] text-danger">{REF_TEXT[lang].error}</span>}
      </div>
      {active && (
        <div className="mt-5">
          <p className="text-[14px] font-semibold">{t.codes}</p>
          {codes.length === 0 ? (
            <p className="mt-1 text-[13px] text-muted">{t.noCodes}</p>
          ) : (
            <ul className="mt-2 divide-y divide-line text-[14px]">
              {codes.map((c) => (
                <li key={c.code} className="flex flex-wrap justify-between gap-2 py-1.5">
                  <span className="font-mono font-semibold tracking-wider">{c.code}</span>
                  <span className="text-muted">
                    {t.from} {c.name} · {new Date(c.created_at).toLocaleDateString(lang === "ka" ? "ka-GE" : lang === "en" ? "en-GB" : "ru-RU")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <p className="mt-4 text-[12px] text-muted">{t.disclaimer}</p>
    </section>
  );
}
