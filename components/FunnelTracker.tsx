"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { finished, flush, funnelOfPath, started, track, type Funnel } from "@/lib/track";
import { SURVEY, SV_UI } from "@/lib/funnel-survey";
import type { Locale } from "@/lib/i18n";

/*
 * Воронки: открыл страницу → начал форму → отправил. Плюс где бросил и короткий опрос «что помешало?».
 * Формы помечены data-funnel="request|message|join|project"; кнопки — data-ev="имя".
 */
const LI = { ru: 0, en: 1, ka: 2 } as const;
const abandoned = new Set<Funnel>();
const seenKey = (f: Funnel) => `nm_sv_${f}`;

export function FunnelTracker({ lang }: { lang: Locale }) {
  const path = usePathname();
  const funnel = funnelOfPath(path);
  const lastField = useRef<Partial<Record<Funnel, string>>>({});
  const [survey, setSurvey] = useState<Funnel | null>(null);

  // открыл страницу воронки
  useEffect(() => {
    if (!funnel) return;
    track("view", funnel);
    // ушёл на другую страницу сайта, не отправив форму
    return () => {
      if (started.has(funnel) && !finished.has(funnel) && !abandoned.has(funnel)) {
        track("abandon", funnel, { field: lastField.current[funnel] ?? "_none" });
        finished.add(funnel);
      }
      started.delete(funnel);
      finished.delete(funnel);
      abandoned.delete(funnel);
    };
  }, [path, funnel]);

  useEffect(() => {
    const formFunnel = (el: EventTarget | null) => (el instanceof Element ? (el.closest("form[data-funnel]")?.getAttribute("data-funnel") as Funnel | null) : null);
    const onFocus = (e: FocusEvent) => {
      const f = formFunnel(e.target);
      if (!f) return;
      const name = (e.target as HTMLInputElement).name;
      if (name && name !== "website") lastField.current[f] = name;
      if (!started.has(f)) track("start", f, { field: name || undefined });
    };
    const onSubmit = (e: SubmitEvent) => {
      const f = formFunnel(e.target);
      if (f) track("submit", f);
    };
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest("[data-ev]") : null;
      if (!el) return;
      const f = (el.getAttribute("data-ev-f") as Funnel | null) ?? funnelOfPath(location.pathname);
      if (f) {
        track("click", f, { name: el.getAttribute("data-ev") });
        flush(); // кнопка может увести на другой сайт (Telegram)
      }
    };
    // ушёл со страницы или свернул браузер (на телефоне pagehide часто не приходит) — отмечаем, где остановился
    const onHide = () => {
      if (document.visibilityState === "visible") return;
      for (const f of started) if (!finished.has(f) && !abandoned.has(f)) {
        track("abandon", f, { field: lastField.current[f] ?? "_none" });
        abandoned.add(f);
      }
      flush();
    };
    document.addEventListener("focusin", onFocus);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  // Опрос: компьютер — когда мышь уходит за верх окна; телефон — 45 с без действий после начала формы
  // или 40 с на странице регистрации без нажатий. Один раз на человека для каждой воронки.
  useEffect(() => {
    if (!funnel) return;
    let shown = false;
    try {
      shown = !!localStorage.getItem(seenKey(funnel));
    } catch {}
    if (shown) return;
    const show = () => {
      if (finished.has(funnel) || document.querySelector("[data-modal-open]")) return;
      if (!started.has(funnel) && funnel !== "join") return;
      setSurvey(funnel);
      try {
        localStorage.setItem(seenKey(funnel), "1");
      } catch {}
      cleanup();
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) show();
    };
    let idle: ReturnType<typeof setTimeout> | null = null;
    const mobile = window.matchMedia("(pointer: coarse)").matches;
    const arm = () => {
      if (!mobile) return;
      if (idle) clearTimeout(idle);
      idle = setTimeout(show, started.has(funnel) ? 45_000 : 40_000);
    };
    const cleanup = () => {
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("input", arm, true);
      document.removeEventListener("click", arm, true);
      if (idle) clearTimeout(idle);
    };
    document.addEventListener("mouseout", onOut);
    document.addEventListener("input", arm, true);
    document.addEventListener("click", arm, true);
    arm();
    return cleanup;
  }, [funnel]);

  if (!survey) return null;
  return <Survey f={survey} lang={lang} onClose={() => setSurvey(null)} />;
}

function Survey({ f, lang, onClose }: { f: Funnel; lang: Locale; onClose: () => void }) {
  const s = SURVEY[f];
  const ui = SV_UI[lang];
  const li = LI[lang];
  const [pick, setPick] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const other = pick === s.o.length - 1;
  const send = (i: number, t = "") => {
    track("survey", f, { answer: s.o[i][0], text: t.trim() || undefined });
    flush();
    setDone(true);
    setTimeout(onClose, 1800);
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:bottom-4 sm:left-auto sm:right-4 sm:w-[380px] sm:p-0" role="dialog" aria-label={s.q[li]}>
      <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,.18)]">
        {done ? (
          <p className="text-[15px] font-semibold text-brand-dark">{ui.thanks}</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[16px] font-bold leading-snug">{s.q[li]}</p>
              <button onClick={onClose} className="-mr-1 -mt-1 h-8 w-8 shrink-0 rounded-full text-[18px] text-muted hover:bg-cream" aria-label={ui.skip}>
                ×
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.o.map((o, i) => (
                <button
                  key={o[0]}
                  onClick={() => (i === s.o.length - 1 ? setPick(i) : send(i))}
                  className={`rounded-full border px-3 py-1.5 text-left text-[13.5px] leading-snug transition ${pick === i ? "border-brand bg-brand-soft" : "border-line hover:border-brand"}`}
                >
                  {o[li]}
                </button>
              ))}
            </div>
            {other && (
              <div className="mt-3 flex gap-2">
                <input autoFocus value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder={ui.other} className="field h-10 min-w-0 flex-1 rounded-xl px-3 text-[14px]" />
                <button onClick={() => send(pick!, text)} className="btn-primary h-10 px-4 text-[14px]">
                  {ui.send}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
