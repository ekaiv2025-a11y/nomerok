"use client";

import { useState } from "react";
import { CITIES } from "@/lib/cities";

/** Заявка по новостройкам: «узнать про этот ЖК» или «подобрать вариант». Уходит владельцу сайта, он передаёт партнёрскому агентству. */
export function ProjectLeadForm({ project, projectName, city }: { project?: string; projectName?: string; city?: string }) {
  const [mode, setMode] = useState<"this" | "other">(project ? "this" : "other");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setErr("");
    setState("sending");
    const r = await fetch("/api/project-lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project,
        mode,
        name: f.get("name"),
        contact: f.get("contact"),
        city: f.get("city") ?? city,
        budget: f.get("budget"),
        rooms: f.get("rooms"),
        goal: f.get("goal"),
        comment: f.get("comment"),
        consent: f.get("consent") === "on",
        website: f.get("website"),
      }),
    }).catch(() => null);
    const j = await r?.json().catch(() => null);
    if (!r?.ok) {
      setErr(j?.error ?? "Не получилось отправить. Проверьте интернет и попробуйте ещё раз.");
      setState("idle");
      return;
    }
    setState("done");
  }

  if (state === "done")
    return (
      <div className="rounded-2xl bg-brand-soft p-5 text-[15px]">
        <p className="text-[17px] font-bold text-brand-dark">Заявка отправлена ✓</p>
        <p className="mt-1 text-[#3d5a4c]">Специалист агентства недвижимости свяжется с вами по указанному контакту, обычно в течение рабочего дня.</p>
      </div>
    );

  const field = "field h-11 w-full rounded-xl px-3 text-[15px]";
  return (
    <form onSubmit={submit} className="space-y-3">
      {project && (
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["this", `Интересует ${projectName ?? "этот ЖК"}`],
              ["other", "Подберите и другие варианты"],
            ] as const
          ).map(([v, label]) => (
            <button key={v} type="button" onClick={() => setMode(v)} className={`rounded-xl border px-3 py-2.5 text-left text-[14px] font-semibold leading-snug transition ${mode === v ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white hover:border-brand"}`}>
              {label}
            </button>
          ))}
        </div>
      )}
      <div className={`grid gap-3 ${project ? "" : "sm:grid-cols-2"}`}>
        <input name="name" required minLength={2} maxLength={80} placeholder="Ваше имя" className={field} autoComplete="name" />
        <input name="contact" required maxLength={80} placeholder="Телефон или Telegram @имя" className={field} autoComplete="tel" />
        {(!project || mode === "other") && (
          <select name="city" defaultValue={city ?? "batumi"} className={field} aria-label="Город">
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label.ru}
              </option>
            ))}
          </select>
        )}
        <select name="budget" defaultValue="" className={field} aria-label="Бюджет">
          <option value="">Бюджет — любой</option>
          <option>до $50 000</option>
          <option>$50 000 – 80 000</option>
          <option>$80 000 – 120 000</option>
          <option>$120 000 – 200 000</option>
          <option>от $200 000</option>
        </select>
        <select name="rooms" defaultValue="" className={field} aria-label="Комнат">
          <option value="">Комнат — не важно</option>
          <option>Студия</option>
          <option>1 спальня</option>
          <option>2 спальни</option>
          <option>3+ спальни</option>
        </select>
        <select name="goal" defaultValue="" className={field} aria-label="Цель">
          <option value="">Для чего</option>
          <option>Для жизни</option>
          <option>Сдавать в аренду</option>
          <option>Вложение</option>
        </select>
      </div>
      <textarea name="comment" maxLength={600} rows={2} placeholder="Пожелания: район, вид на море, срок сдачи, рассрочка…" className="field w-full rounded-xl px-3 py-2.5 text-[15px]" />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex items-start gap-2 text-[13px] leading-snug text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#1f6b4f]" />
        <span>Согласен(на), что NomerOk передаст мой контакт партнёрскому агентству недвижимости, чтобы со мной связались по этой заявке.</span>
      </label>
      {err && <p className="text-[14px] font-medium text-[#b42318]">{err}</p>}
      <button disabled={state === "sending"} className="btn-primary h-12 w-full text-[16px] disabled:opacity-60">
        {state === "sending" ? "Отправляем…" : mode === "this" && project ? "Узнать цены и планировки" : "Подобрать варианты"}
      </button>
    </form>
  );
}
