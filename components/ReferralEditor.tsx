"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { REF_TEXT } from "@/lib/referral-text";
import { BONUS } from "@/lib/bonus-text";
import { RefCodes, type RefCode } from "./RefCodes";

type Props = {
  lang: Locale;
  initial: { active: boolean; friend: string; reward: string; max_uses: number; prefix: string; repost?: string; repost_active?: boolean } | null;
  suggestion: string;
  issued: number;
  codes: (RefCode & { notify: boolean })[];
  /** ни у кого на сайте ещё нет бонуса — подсказка «будете первым» */
  nobodyYet?: boolean;
};

const LIMITS = [5, 10, 20, 50, 0];

function Switch({ on, onChange, labels }: { on: boolean; onChange: (v: boolean) => void; labels: [string, string] }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full p-1 text-[13px] font-semibold transition ${on ? "flex-row-reverse bg-brand pl-3 text-white" : "border border-line bg-white pr-3 text-muted"}`}
    >
      <span className={`h-6 w-6 rounded-full shadow ${on ? "bg-white" : "bg-[#d9d5cb]"}`} />
      {on ? labels[0] : labels[1]}
    </button>
  );
}

/** Кабинет: бонусы клиентам — за рекомендацию другу (личные коды) и за репост профиля. Готовые варианты в одно нажатие. */
export function ReferralEditor({ lang, initial, suggestion, issued: issued0, codes, nobodyYet }: Props) {
  const t = REF_TEXT[lang];
  const b = BONUS[lang];
  const router = useRouter();
  const [active, setActive] = useState(initial?.active ?? false);
  const [friend, setFriend] = useState(initial?.friend ?? "");
  const [reward, setReward] = useState(initial?.reward ?? "");
  const [max, setMax] = useState(initial?.max_uses ?? 0);
  const [prefix, setPrefix] = useState(initial?.prefix ?? suggestion);
  const [repOn, setRepOn] = useState(initial?.repost_active ?? false);
  const [repost, setRepost] = useState(initial?.repost ?? "");
  const [issued, setIssued] = useState(issued0);
  const [more, setMore] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState("");
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  const dirty = () => setState("idle");

  async function save(restart = false) {
    setErr("");
    if (active && friend.trim().length < 3) return setErr(b.needFriend);
    if (repOn && repost.trim().length < 3) return setErr(b.needRepost);
    setState("saving");
    const r = await fetch("/api/cabinet/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active, friend, reward, max_uses: max, prefix, restart, repost, repost_active: repOn }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (j.ok) {
      setIssued(j.issued);
      setState("saved");
      router.refresh();
    } else setState("error");
  }

  const chip = "rounded-full border border-[#f0d58a] bg-[#fffaf0] px-3 py-1.5 text-left text-[13px] font-medium hover:border-accent";

  return (
    <section id="bonus" className="scroll-mt-28 rounded-2xl border-2 border-[#f0d58a] bg-white p-5">
      <h2 className="text-[19px] font-bold">{b.edTitle}</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{b.edLead}</p>
      {nobodyYet && !active && !repOn && <p className="mt-3 rounded-xl bg-[#fdf3dc] p-3 text-[13px] font-medium text-[#5a4410]">✨ {b.nobodyYet}</p>}

      {/* За рекомендацию */}
      <div className="mt-5 rounded-2xl bg-cream p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[16px] font-bold">{b.refTitle}</p>
          <Switch on={active} onChange={(v) => (setActive(v), dirty())} labels={[b.on, b.off]} />
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{b.refHow}</p>
        {active && (
          <div className="mt-3 space-y-3">
            <p className="text-[13px] font-semibold">{b.pick}</p>
            <div className="flex flex-wrap gap-2">
              {b.refPresets.map((p) => (
                <button key={p.friend} type="button" className={chip} onClick={() => (setFriend(p.friend), setReward(p.reward), dirty())}>
                  {p.friend}
                  {p.reward ? ` + ${p.reward.toLowerCase()}` : ""}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="text-[14px] font-semibold">{b.friendLabel}</span>
              <input value={friend} onChange={(e) => (setFriend(e.target.value.slice(0, 140)), dirty())} placeholder={t.friendPh} className="field mt-1.5 bg-white" />
            </label>
            <label className="block">
              <span className="text-[14px] font-semibold">{b.rewardLabel}</span> <span className="text-[13px] text-muted">{t.optional}</span>
              <input value={reward} onChange={(e) => (setReward(e.target.value.slice(0, 140)), dirty())} placeholder={t.rewardPh} className="field mt-1.5 bg-white" />
            </label>
            <button type="button" onClick={() => setMore((v) => !v)} className="text-[13px] font-semibold text-brand underline">
              {more ? "▾" : "▸"} {b.more}
            </button>
            {more && (
              <div className="space-y-3">
                <div>
                  <p className="text-[14px] font-semibold">{t.limitLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {LIMITS.map((n) => (
                      <button key={n} type="button" onClick={() => (setMax(n), dirty())} className={`rounded-full border px-3.5 py-1.5 text-[14px] font-medium ${max === n ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"}`}>
                        {n || t.noLimit}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[13px] text-muted">{t.issued(issued, max)}</p>
                  {issued > 0 && max > 0 && (
                    <button type="button" onClick={() => save(true)} className="btn-ghost mt-2 h-9 px-4 text-[13px]">
                      {t.restart}
                    </button>
                  )}
                </div>
                <label className="block">
                  <span className="text-[14px] font-semibold">{t.prefixLabel}</span>
                  <input value={prefix} onChange={(e) => (setPrefix(clean(e.target.value)), dirty())} className="field mt-1.5 bg-white font-mono uppercase tracking-wider" />
                  <span className="mt-1 block text-[13px] text-muted">{t.prefixHint(`${prefix || "ANNA"}-7K2`)}</span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {(active || codes.length > 0) && <RefCodes lang={lang} codes={codes} hasReward={!!reward.trim()} />}

      {/* За репост */}
      <div className="mt-3 rounded-2xl bg-cream p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[16px] font-bold">{b.repTitle}</p>
          <Switch on={repOn} onChange={(v) => (setRepOn(v), dirty())} labels={[b.on, b.off]} />
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{b.repHow}</p>
        {repOn && (
          <div className="mt-3 space-y-3">
            <p className="text-[13px] font-semibold">{b.pick}</p>
            <div className="flex flex-wrap gap-2">
              {b.repPresets.map((p) => (
                <button key={p} type="button" className={chip} onClick={() => (setRepost(p), dirty())}>
                  {p}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="text-[14px] font-semibold">{b.repostLabel}</span>
              <input value={repost} onChange={(e) => (setRepost(e.target.value.slice(0, 140)), dirty())} placeholder={b.repostPh} className="field mt-1.5 bg-white" />
            </label>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => save()} disabled={state === "saving"} className="btn-primary h-11 px-5 text-[14px]">
          {b.save}
        </button>
        {state === "saved" && <span className="text-[13px] font-semibold text-brand">{b.saved}</span>}
        {err && <span className="text-[13px] text-danger">{err}</span>}
        {state === "error" && <span className="text-[13px] text-danger">{t.error}</span>}
      </div>
    </section>
  );
}
