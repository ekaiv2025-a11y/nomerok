"use client";

import { useState } from "react";
import { CITIES } from "@/lib/cities";
import { EVENT_KINDS } from "@/lib/events";
import type { Locale } from "@/lib/i18n/config";

/** Форма «Добавить своё мероприятие» — уходит на проверку. Подписи по-русски (раздел для ru), город и тип — на языке страницы. */
export function EventAddForm({ lang }: { lang: Locale }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setState("sending");
    setErrors({});
    setMsg("");
    const r = await fetch("/api/events/add", { method: "POST", body: new FormData(ev.currentTarget) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok) return setState("done");
    setErrors(j.errors ?? {});
    setMsg(j.error ?? (j.errors ? "Проверьте поля, отмеченные красным" : "Не получилось отправить. Попробуйте ещё раз."));
    setState("idle");
  }
  if (state === "done")
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
        <p className="text-[34px]">🎉</p>
        <p className="mt-2 text-[18px] font-bold">Спасибо! Событие отправлено на проверку</p>
        <p className="mt-1 text-[14.5px] text-[#3d5a4c]">Обычно публикуем в течение суток. Если будут вопросы — напишем по указанному контакту.</p>
      </div>
    );
  const inp = (name: string) => `h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] outline-none focus:border-brand ${errors[name] ? "border-danger" : "border-line"}`;
  const Err = ({ n }: { n: string }) => (errors[n] ? <p className="mt-1 text-[12.5px] text-danger">{errors[n]}</p> : null);
  const L = ({ children }: { children: React.ReactNode }) => <span className="mb-1 block text-[13px] font-semibold">{children}</span>;
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="block">
        <L>Название *</L>
        <input name="title" className={inp("title")} placeholder="Например: Джазовый вечер на бульваре" />
        <Err n="title" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <L>Город *</L>
          <select name="city" defaultValue="batumi" className={inp("city")}>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label[lang]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <L>Что это</L>
          <select name="kind" defaultValue="concert" className={inp("kind")}>
            {EVENT_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.emoji} {k.label[lang]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <L>Дата *</L>
          <input type="date" name="date" className={inp("date")} />
          <Err n="date" />
        </label>
        <label className="block">
          <L>Начало</L>
          <input type="time" name="time" className={inp("time")} />
        </label>
        <label className="block">
          <L>До (если несколько дней)</L>
          <input type="date" name="end_date" className={inp("end_date")} />
          <Err n="end_date" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <L>Место</L>
          <input name="venue" className={inp("venue")} placeholder="Драмтеатр, клуб, парк…" />
        </label>
        <label className="block">
          <L>Адрес</L>
          <input name="address" className={inp("address")} placeholder="ул. Руставели, 1" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <L>Цена</L>
          <input name="price" className={inp("price")} placeholder="20–50 лари, вход свободный…" />
        </label>
        <label className="block">
          <L>Ссылка на билеты или подробности</L>
          <input name="url" className={inp("url")} placeholder="https://" />
          <Err n="url" />
        </label>
      </div>
      <label className="block">
        <L>Описание</L>
        <textarea name="description" rows={5} className={`${inp("description")} h-auto py-2.5`} placeholder="Что будет, для кого, программа, возраст" />
      </label>
      <label className="block">
        <L>Афиша или фото</L>
        <input type="file" name="image" accept="image/*" className="block w-full text-[14px]" />
        <Err n="image" />
      </label>
      <label className="block">
        <L>Ваш контакт для связи *</L>
        <input name="contact" className={inp("contact")} placeholder="Телефон, Telegram или почта — на сайте не показываем" />
        <Err n="contact" />
      </label>
      {msg && <p className="text-[14px] text-danger">{msg}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary h-12 w-full text-[16px] disabled:opacity-60">
        {state === "sending" ? "Отправляем…" : "Отправить на проверку"}
      </button>
      <p className="text-center text-[12.5px] text-muted">Бесплатно. Публикуем после проверки, обычно в течение суток.</p>
    </form>
  );
}
