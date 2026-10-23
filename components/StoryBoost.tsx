"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { BONUS } from "@/lib/bonus-text";

/** Кабинет → «Продвижение»: поднимем анкету за сторис со скриншотом. */
export function StoryBoost({ lang, state }: { lang: Locale; state: { status: "pending" | "approved" | "rejected" | null; activeUntil: string | null; canSend: boolean; nextFrom: string | null } }) {
  const b = BONUS[lang];
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(lang === "ka" ? "ka-GE" : lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "long" });

  async function send(f: File | undefined) {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 8 * 1024 * 1024) return setMsg({ ok: false, text: b.bBad });
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.set("shot", f);
    const r = await fetch("/api/cabinet/boost", { method: "POST", body: fd }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (j.ok) {
      setMsg({ ok: true, text: b.bSent });
      router.refresh();
    } else setMsg({ ok: false, text: j.error === "type" ? b.bBad : b.bErr });
    if (input.current) input.current.value = "";
  }

  return (
    <section id="boost" className="scroll-mt-28 rounded-2xl border border-line p-5">
      <h2 className="text-[18px] font-bold">{b.bTitle}</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{b.bLead}</p>
      <ol className="mt-3 space-y-1.5 text-[14px]">
        {b.bSteps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand-dark">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      {state.activeUntil && <p className="mt-3 rounded-xl bg-brand-soft p-3 text-[14px] font-semibold text-brand-dark">{b.bActive(fmt(state.activeUntil))}</p>}
      {state.status === "pending" && <p className="mt-3 rounded-xl bg-[#fdf6e6] p-3 text-[14px]">⏳ {b.bWait}</p>}
      {state.status === "rejected" && state.canSend && <p className="mt-3 rounded-xl bg-[#fdecea] p-3 text-[14px]">{b.bRejected}</p>}
      {!state.canSend && state.status !== "pending" && state.nextFrom && !state.activeUntil && <p className="mt-3 text-[13px] text-muted">{b.bLater(fmt(state.nextFrom))}</p>}
      {state.canSend && (
        <>
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn mt-4 h-11 gap-2 rounded-full bg-accent px-5 font-semibold text-ink hover:bg-[#cf9620]">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {busy ? b.bSending : b.bUpload}
          </button>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => send(e.target.files?.[0])} />
        </>
      )}
      {msg && <p className={`mt-3 text-[14px] ${msg.ok ? "font-semibold text-brand" : "text-danger"}`}>{msg.text}</p>}
    </section>
  );
}
