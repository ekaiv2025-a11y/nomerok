"use client";

import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getDict, href, type Locale } from "@/lib/i18n";
import { ContactFields, Field, Honeypot, LinkedNote, TelegramStep, fc, useSubmit } from "./form-kit";

type Props = { lang: Locale; master: { slug: string; name: string; category: string }; me?: { name: string; phone: string } | null };

/** Сообщение конкретному специалисту: получает только он. */
export function MessageForm({ lang, master, me }: Props) {
  const d = getDict(lang);
  const t = d.message;
  const r = d.request;
  const first = master.name.split(" ")[0];
  const { state, errors, message, submit, result } = useSubmit("/api/requests", lang);

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand" />
        <h2 className="mt-3 text-xl font-bold">{t.doneTitle}</h2>
        <p className="mt-2 text-[15px] text-[#3d5a4c]">{t.doneText(first)}</p>
        <TelegramStep title={t.tgTitle} text={t.tgText} button={r.tgBtn} link={result.tgLink} />
        {result.linked ? <LinkedNote lang={lang} href={href(lang, "/my")} /> : null}
        <Link href={href(lang, `/master/${master.slug}`)} className="btn-ghost mt-5">
          ← {master.name}
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    submit({
      category: master.category,
      master_slug: master.slug,
      description: f.get("description"),
      when_text: f.get("when_text"),
      name: f.get("name"),
      phone: f.get("phone"),
      website: f.get("website"),
    });
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot label={d.form.honeypot} />
      <Field label={t.what} hint={r.whatHint} error={errors.description}>
        <textarea name="description" rows={5} className={fc(errors.description)} placeholder={t.whatPlaceholder} required />
      </Field>
      <Field label={r.when} optional={d.form.optional} error={errors.when_text}>
        <input name="when_text" className={fc(errors.when_text)} placeholder={r.whenPlaceholder} />
      </Field>
      <ContactFields
        lang={lang}
        me={me}
        errors={errors}
        labels={{ name: r.name, phone: r.phone, phoneHint: r.phoneHint, optional: d.form.optional, placeholder: d.form.phonePlaceholder }}
      />
      {errors.category && <p className="text-[13px] text-danger">{errors.category}</p>}
      {message && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{message}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary h-12 w-full">
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />} {t.submit}
      </button>
      <p className="text-center text-[12.5px] text-muted">{t.privacy}</p>
    </form>
  );
}
