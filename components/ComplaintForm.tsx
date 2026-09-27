"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getDict, href, type Locale } from "@/lib/i18n";
import { Field, Honeypot, fc } from "./form-kit";
import { PhotoPicker } from "./PhotoPicker";
import { useMultipart } from "./useMultipart";

const REASONS = ["no_contact", "quality", "price", "fraud", "fake", "rude", "other"] as const;

export function ComplaintForm({ lang, master }: { lang: Locale; master: { slug: string; name: string } | null }) {
  const d = getDict(lang);
  const t = d.complaint;
  const { state, errors, message, send, setMessage } = useMultipart("/api/complaints", lang);
  const [files, setFiles] = useState<File[]>([]);

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand" />
        <h2 className="mt-3 text-xl font-bold">{t.doneTitle}</h2>
        <p className="mt-2 text-[15px] text-[#3d5a4c]">{t.doneText}</p>
        <Link href={href(lang)} className="btn-ghost mt-5">
          {d.form.toHome}
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const fd = new FormData();
    for (const k of ["reason", "text", "contact", "master_text", "website"]) fd.set(k, String(f.get(k) ?? ""));
    if (master) fd.set("master_slug", master.slug);
    files.forEach((x) => fd.append("photos", x));
    send(fd);
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot label={d.form.honeypot} />
      {master ? (
        <p className="rounded-xl bg-cream p-3.5 text-[15px]">
          {t.master}: <b>{master.name}</b>
        </p>
      ) : (
        <Field label={t.master} optional={d.form.optional}>
          <input name="master_text" className="field" placeholder={t.masterPlaceholder} maxLength={200} />
        </Field>
      )}
      <fieldset>
        <legend className="text-[14px] font-semibold">{t.reason}</legend>
        <div className="mt-2 space-y-2">
          {REASONS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3.5 py-2.5 text-[15px] has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
              <input type="radio" name="reason" value={r} className="h-4 w-4 accent-[#1f6b4f]" />
              {t.reasons[r]}
            </label>
          ))}
        </div>
        {errors.reason && <p className="mt-1 text-[13px] text-danger">{errors.reason}</p>}
      </fieldset>
      <Field label={t.text} error={errors.text}>
        <textarea name="text" rows={5} className={fc(errors.text)} placeholder={t.textPlaceholder} maxLength={3000} />
      </Field>
      <div>
        <p className="text-[14px] font-semibold">
          {t.photos} <span className="font-normal text-muted">{d.form.optional}</span>
        </p>
        <p className="mt-0.5 text-[13px] text-muted">{t.photosHint}</p>
        <div className="mt-2">
          <PhotoPicker files={files} onChange={setFiles} addLabel={d.reviews.addPhoto} onError={setMessage} errorText={d.reviews.errPhotos} />
        </div>
      </div>
      <Field label={t.contact} hint={t.contactHint} error={errors.contact}>
        <input name="contact" className={fc(errors.contact)} placeholder="+995 555 12 34 56 / @username" maxLength={100} />
      </Field>
      {message && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{message}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary h-12 w-full">
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />} {t.submit}
      </button>
      <p className="text-center text-[13px] text-muted">{t.urgent}</p>
    </form>
  );
}
