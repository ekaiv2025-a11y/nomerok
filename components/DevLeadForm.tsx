"use client";

import { useState } from "react";
import { track } from "@/lib/track";

/** «Написать застройщику»: заявка по ЖК или конкретной квартире уходит в отдел продаж (Telegram или почта), копия — администратору. */
export function DevLeadForm({ project, unit, compact }: { project: string; unit?: string; compact?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setErr("");
    setState("sending");
    const r = await fetch("/api/dev/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ project, unit, name: f.get("name"), contact: f.get("contact"), comment: f.get("comment"), website: f.get("website") }),
    }).catch(() => null);
    const j = await r?.json().catch(() => null);
    if (!r?.ok) {
      setErr(j?.error ?? "Не получилось отправить. Проверьте интернет и попробуйте ещё раз.");
      setState("idle");
      return;
    }
    track("done", "project");
    setState("done");
  }
  if (state === "done")
    return (
      <div className="rounded-2xl bg-brand-soft p-4 text-[15px]">
        <p className="font-bold text-brand-dark">Заявка отправлена ✓</p>
        <p className="mt-1 text-[#3d5a4c]">Отдел продаж свяжется с вами по указанному контакту.</p>
      </div>
    );
  const field = "field h-11 w-full rounded-xl px-3 text-[15px]";
  return (
    <form onSubmit={submit} className="space-y-2.5">
      <input name="name" required minLength={2} maxLength={80} placeholder="Ваше имя" className={field} />
      <input name="contact" required maxLength={80} placeholder="Телефон или Telegram (@имя)" className={field} />
      {!compact && <textarea name="comment" rows={2} maxLength={600} placeholder="Вопрос (необязательно): планировка, рассрочка, этаж…" className="field w-full rounded-xl px-3 py-2 text-[15px]" />}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {err && <p className="text-[13px] text-danger">{err}</p>}
      <button disabled={state === "sending"} className="btn-primary h-11 w-full text-[15px]">
        {state === "sending" ? "Отправляем…" : "Отправить застройщику"}
      </button>
    </form>
  );
}
