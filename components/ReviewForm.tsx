"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getDict, href, type Locale } from "@/lib/i18n";
import { Field, Honeypot, fc } from "./form-kit";
import { PhotoPicker } from "./PhotoPicker";
import { useMultipart } from "./useMultipart";

export function ReviewForm({ lang, token, defaultName, masterSlug }: { lang: Locale; token: string; defaultName: string; masterSlug: string }) {
  const d = getDict(lang);
  const t = d.reviews;
  const { state, errors, message, send, setMessage } = useMultipart("/api/reviews", lang);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand" />
        <h2 className="mt-3 text-xl font-bold">{t.doneTitle}</h2>
        <p className="mt-2 text-[15px] text-[#3d5a4c]">{t.doneText}</p>
        <Link href={href(lang, `/master/${masterSlug}`)} className="btn-ghost mt-5">
          {d.master.back.replace("←", "").trim()}
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const fd = new FormData();
    fd.set("t", token);
    fd.set("rating", String(rating));
    fd.set("text", String(f.get("text") ?? ""));
    fd.set("name", String(f.get("name") ?? ""));
    fd.set("website", String(f.get("website") ?? ""));
    files.forEach((x) => fd.append("photos", x));
    send(fd);
  }

  const shown = hover || rating;
  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot label={d.form.honeypot} />
      <div>
        <p className="text-[14px] font-semibold">{t.rating}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                className="p-1"
                aria-label={`${i}`}
              >
                <svg viewBox="0 0 20 20" width={34} height={34} className={i <= shown ? "text-[#e5a50a]" : "text-[#dcd8cc]"}>
                  <path fill="currentColor" d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                </svg>
              </button>
            ))}
          </div>
          {shown > 0 && <span className="text-[14px] text-muted">{t.ratingLabels[shown - 1]}</span>}
        </div>
        {errors.rating && <p className="mt-1 text-[13px] text-danger">{errors.rating}</p>}
      </div>
      <Field label={t.text} error={errors.text}>
        <textarea name="text" rows={5} className={fc(errors.text)} placeholder={t.textPlaceholder} maxLength={2000} />
      </Field>
      <div>
        <p className="text-[14px] font-semibold">
          {t.photos} <span className="font-normal text-muted">{d.form.optional}</span>
        </p>
        <p className="mt-0.5 text-[13px] text-muted">{t.photosHint}</p>
        <div className="mt-2">
          <PhotoPicker files={files} onChange={setFiles} addLabel={t.addPhoto} onError={setMessage} errorText={t.errPhotos} />
        </div>
        {errors.photos && <p className="mt-1 text-[13px] text-danger">{errors.photos}</p>}
      </div>
      <Field label={t.name} hint={t.nameHint} error={errors.name}>
        <input name="name" defaultValue={defaultName} className={fc(errors.name)} maxLength={60} />
      </Field>
      {message && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{message}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary h-12 w-full">
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />} {t.submit}
      </button>
    </form>
  );
}
