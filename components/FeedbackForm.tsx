"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { getDict, type Locale } from "@/lib/i18n";
import { Field, Honeypot, fc, useSubmit } from "./form-kit";

export function FeedbackForm({ lang }: { lang: Locale }) {
  const d = getDict(lang);
  const t = d.contacts;
  const { state, errors, message, submit, result } = useSubmit("/api/feedback", lang);
  const tg = typeof result.tg === "string" ? result.tg : null;

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand" />
        <h2 className="mt-3 text-xl font-bold">{t.doneTitle}</h2>
        <p className="mt-2 text-[15px] text-[#3d5a4c]">{t.doneText}</p>
        {tg && (
          <div className="mt-5 rounded-xl bg-white p-4">
            <p className="text-[14px] text-[#3a3935]">{TG_T[lang].text}</p>
            <a href={tg} target="_blank" rel="noopener noreferrer" className="btn mt-3 h-11 bg-[#229ED9] px-5 text-[15px] text-white hover:bg-[#1c89bd]">
              {TG_T[lang].btn}
            </a>
          </div>
        )}
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    submit({ name: f.get("name"), contact: f.get("contact"), message: f.get("message"), website: f.get("website") });
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot label={d.form.honeypot} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t.name} optional={d.form.optional} error={errors.name}>
          <input name="name" autoComplete="name" className={fc(errors.name)} />
        </Field>
        <Field label={t.contact} hint={t.contactHint} error={errors.contact}>
          <input name="contact" className={fc(errors.contact)} required />
        </Field>
      </div>
      <Field label={t.message} error={errors.message}>
        <textarea name="message" rows={5} className={fc(errors.message)} placeholder={t.messagePlaceholder} required />
      </Field>
      {message && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{message}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary h-12 w-full">
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />} {t.submit}
      </button>
    </form>
  );
}

const TG_T = {
  ru: { text: "Хотите получить ответ быстрее? Подключите Telegram — мы ответим вам прямо туда.", btn: "Получить ответ в Telegram" },
  en: { text: "Want a faster reply? Connect Telegram and we'll answer you there.", btn: "Get the reply in Telegram" },
  ka: { text: "გსურთ უფრო სწრაფი პასუხი? დააკავშირეთ Telegram — პასუხს იქ მიიღებთ.", btn: "პასუხის მიღება Telegram-ში" },
} as const;
