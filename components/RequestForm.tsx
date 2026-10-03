"use client";

import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { getDict, href, type Locale } from "@/lib/i18n";
import { CategoryOptions } from "./CategoryOptions";
import { ContactFields, Field, Honeypot, LinkedNote, PHOTO_TEXT, TelegramStep, fc, uploadRequestPhotos, useSubmit } from "./form-kit";
import { PhotoPicker } from "./PhotoPicker";
import { useState } from "react";
import { detectIntent } from "@/lib/search-intent";
import { categoryLabel } from "@/lib/categories";
import { CITY_LABEL, CityOptions } from "./CitySelect";
import { isCity } from "@/lib/cities";
import { looksLikeSelf } from "@/lib/request-check";

const SELF = {
  ru: { title: "Похоже, вы рассказываете о себе как о специалисте", text: "Эта форма — для тех, кто ищет мастера. Если вы специалист и хотите получать заказы, разместите анкету — так вы сможете получать заявки клиентов в Telegram.", join: "Я специалист — разместить анкету", no: "Нет, я ищу мастера" },
  en: { title: "Looks like you're describing yourself as a specialist", text: "This form is for people looking for a specialist. If you are a specialist and want orders, create a profile — then you can get client requests in Telegram.", join: "I'm a specialist — create a profile", no: "No, I'm looking for a specialist" },
  ka: { title: "როგორც ჩანს, საკუთარ თავზე წერთ როგორც სპეციალისტი", text: "ეს ფორმა მათთვისაა, ვინც ეძებს ხელოსანს. თუ სპეციალისტი ხართ და გინდათ შეკვეთები, განათავსეთ პროფილი — მოთხოვნებს Telegram-ში მიიღებთ.", join: "სპეციალისტი ვარ — პროფილის განთავსება", no: "არა, ხელოსანს ვეძებ" },
} as const;

const SUGGEST = { ru: "Похоже, подойдёт раздел:", en: "Looks like:", ka: "როგორც ჩანს:" } as const;

type Props = { lang: Locale; defaultCategory?: string; defaultCity?: string; me?: { name: string; phone: string } | null };

/** Общая заявка — для всех специалистов направления. */
export function RequestForm({ lang, defaultCategory, defaultCity, me }: Props) {
  const d = getDict(lang);
  const t = d.request;
  const { state, errors, message, submit, result } = useSubmit("/api/requests", lang);
  const [files, setFiles] = useState<File[]>([]);
  const [catSel, setCatSel] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [photoErr, setPhotoErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selfOk, setSelfOk] = useState(false);
  const selfWarn = !selfOk && looksLikeSelf(desc);

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand" />
        <h2 className="mt-3 text-xl font-bold">{t.doneTitle}</h2>
        <p className="mt-2 text-[15px] text-[#3d5a4c]">{t.doneGeneral}</p>
        <TelegramStep title={t.tgTitle} text={t.tgText} button={t.tgBtn} link={result.tgLink} />
        {result.linked ? <LinkedNote lang={lang} href={href(lang, "/my")} /> : null}
        <Link href={href(lang)} className="btn-ghost mt-5">
          {d.form.toHome}
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selfWarn) {
      document.getElementById("self-warn")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const f = new FormData(e.currentTarget);
    setPhotoErr("");
    setUploading(true);
    const photos = await uploadRequestPhotos(files);
    setUploading(false);
    if (photos === null) {
      setPhotoErr(PHOTO_TEXT[lang].upErr);
      return;
    }
    submit({
      photos,
      category: f.get("category"),
      city: f.get("city"),
      description: f.get("description"),
      when_text: f.get("when_text"),
      name: f.get("name"),
      phone: f.get("phone"),
      website: f.get("website"),
    });
  }

  const initialCat = CATEGORIES.some((c) => c.id === defaultCategory) ? defaultCategory : "";

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot label={d.form.honeypot} />
      <Field label={t.who} error={errors.category}>
        <select name="category" value={catSel || initialCat || ""} onChange={(e) => setCatSel(e.target.value)} className={fc(errors.category)} required>
          <option value="" disabled>
            {d.form.choose}
          </option>
          <CategoryOptions lang={lang} />
        </select>
      </Field>
      <Field label={t.what} hint={t.whatHint} error={errors.description}>
        <textarea name="description" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} className={fc(errors.description)} placeholder={t.whatPlaceholder} required />
        {selfWarn && (
          <div id="self-warn" className="mt-2 rounded-xl border border-[#f0d58a] bg-[#fff8e6] p-3 text-[13px] leading-snug">
            <p className="font-semibold">🙋 {SELF[lang].title}</p>
            <p className="mt-1 text-muted">{SELF[lang].text}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href={href(lang, "/join")} className="btn-primary h-9 px-3 text-[13px]">
                {SELF[lang].join}
              </Link>
              <button type="button" onClick={() => setSelfOk(true)} className="btn-ghost h-9 px-3 text-[13px]">
                {SELF[lang].no}
              </button>
            </div>
          </div>
        )}
        {(() => {
          const cur = catSel || initialCat || "";
          const sug = detectIntent(desc).map((x) => x.cat).filter((c, i, a) => a.indexOf(c) === i && c !== cur);
          if (!sug.length || (cur && cur !== "other" && detectIntent(desc).some((x) => x.cat === cur))) return null;
          return (
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
              {SUGGEST[lang]}
              {sug.slice(0, 2).map((c) => (
                <button key={c} type="button" onClick={() => setCatSel(c)} className="rounded-full bg-brand-soft px-2.5 py-0.5 font-semibold text-brand-dark hover:bg-[#d6eadf]">
                  {categoryLabel(c, lang)}
                </button>
              ))}
            </p>
          );
        })()}
      </Field>
      <Field label={CITY_LABEL[lang]}>
        <select name="city" defaultValue={isCity(defaultCity) ? defaultCity : "batumi"} className={fc()}>
          <CityOptions lang={lang} />
        </select>
      </Field>
      <Field label={t.when} optional={d.form.optional} error={errors.when_text}>
        <input name="when_text" className={fc(errors.when_text)} placeholder={t.whenPlaceholder} />
      </Field>
      <div>
        <p className="text-[14px] font-semibold">
          📷 {PHOTO_TEXT[lang].label} <span className="font-normal text-muted">{d.form.optional}</span>
        </p>
        <p className="mt-0.5 text-[13px] text-muted">{PHOTO_TEXT[lang].hint}</p>
        <div className="mt-2">
          <PhotoPicker files={files} onChange={setFiles} addLabel={PHOTO_TEXT[lang].add} onError={setPhotoErr} errorText={PHOTO_TEXT[lang].err} />
        </div>
        {photoErr && <p className="mt-1 text-[13px] text-danger">{photoErr}</p>}
      </div>
      <ContactFields
        lang={lang}
        me={me}
        errors={errors}
        labels={{ name: t.name, phone: t.phone, phoneHint: t.phoneHint, optional: d.form.optional, placeholder: d.form.phonePlaceholder }}
      />
      {message && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{message}</p>}
      <button type="submit" disabled={state === "sending" || uploading} className="btn-primary h-12 w-full">
        {(state === "sending" || uploading) && <Loader2 className="h-4 w-4 animate-spin" />} {t.submit}
      </button>
      <p className="text-center text-[12px] text-muted">{t.consentA}</p>
    </form>
  );
}
