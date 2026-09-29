"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";
import { LANGUAGES, PRICE_UNITS, languageLabel, unitLabel } from "@/lib/categories";
import { getDict, href, type Locale } from "@/lib/i18n";
import { CategoryOptions } from "./CategoryOptions";
import { WhereFields, type WhereValue } from "./WhereFields";
import { CITY_LABEL, CityOptions } from "./CitySelect";
import { LinkFields, readLinkFields } from "./SocialLinks";
import { Field, Honeypot, TelegramStep, fc, useSubmit } from "./form-kit";

export type JoinPrefill = { token: string; name: string; phone: string; telegram: string | null; hasPhoto: boolean };

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function JoinForm({ lang, prefill, tgFastLink }: { lang: Locale; prefill?: JoinPrefill | null; tgFastLink?: string | null }) {
  const d = getDict(lang);
  const t = d.join;
  const opt = d.form.optional;
  const { state, errors, message, submit, result } = useSubmit("/api/masters", lang);

  // Фото: своё (файл) или аватарка из Telegram
  const [file, setFile] = useState<File | null>(null);
  const [city, setCity] = useState("batumi");
  const [where, setWhere] = useState<WhereValue>({ work_mode: "at_client", service_area: "", work_hours: "", place_address: "", place_lat: null, place_lng: null });
  const [preview, setPreview] = useState<string | null>(null);
  const [useTgPhoto, setUseTgPhoto] = useState(!!prefill?.hasPhoto);
  const [photoError, setPhotoError] = useState("");
  const [upload, setUpload] = useState<"idle" | "uploading" | "failed" | "done">("idle");
  const fileInput = useRef<HTMLInputElement>(null);
  const shownPhoto = preview ?? (useTgPhoto && prefill ? `/api/join/photo?t=${encodeURIComponent(prefill.token)}` : null);

  function pickFile(f: File | undefined) {
    setPhotoError("");
    if (!f) return;
    if (!PHOTO_TYPES.includes(f.type)) return setPhotoError(d.cabinet.photoType);
    if (f.size > 5 * 1024 * 1024) return setPhotoError(d.cabinet.photoSize);
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUseTgPhoto(false);
  }
  function removePhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setUseTgPhoto(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  // После отправки анкеты загружаем выбранное фото (сервер уже «впустил» в кабинет новой анкеты)
  useEffect(() => {
    if (state !== "done" || !file || upload !== "idle") return;
    setUpload("uploading");
    const fd = new FormData();
    fd.set("photo", file);
    fd.set("lang", lang);
    fetch("/api/cabinet/photo", { method: "POST", body: fd })
      .then((r) => r.json())
      .then((j) => setUpload(j.ok ? "done" : "failed"))
      .catch(() => setUpload("failed"));
  }, [state, file, upload, lang]);

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand" />
        <h2 className="mt-3 text-xl font-bold">{t.doneTitle}</h2>
        <p className="mt-2 text-[15px] text-[#3d5a4c]">{result.verified ? t.doneVerified : t.doneText}</p>
        {upload === "uploading" && (
          <p className="mt-3 inline-flex items-center gap-2 text-[14px] text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> {t.photoUploading}
          </p>
        )}
        {upload === "failed" && <p className="mt-3 text-[14px] text-danger">{t.photoFailed}</p>}
        <TelegramStep title={t.tgTitle} text={t.tgText} button={t.tgBtn} link={result.tgLink} />
        <Link href={href(lang)} className="btn-ghost mt-5">
          {d.form.toHome}
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = String(f.get(k) ?? "").trim();
      return v === "" ? null : v;
    };
    submit({
      name: f.get("name"),
      category: f.get("category"),
      city: f.get("city"),
      links: readLinkFields(f),
      services: f.get("services"),
      about: f.get("about"),
      credentials: f.get("credentials"),
      experience_years: num("experience_years"),
      price_from: num("price_from"),
      price_unit: f.get("price_unit"),
      languages: f.getAll("languages"),
      phone: f.get("phone"),
      telegram: f.get("telegram"),
      whatsapp: f.get("whatsapp") === "on",
      ...where,
      tg: prefill?.token,
      tgPhoto: !!prefill && useTgPhoto && !file,
      consent: f.get("consent") === "on",
      website: f.get("website"),
    });
  }

  const defaultLanguage = lang === "ka" ? "Грузинский" : lang === "en" ? "Английский" : "Русский";

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot label={d.form.honeypot} />
      {prefill ? (
        <p className="flex items-center gap-2 rounded-2xl bg-brand-soft p-4 text-[15px] font-semibold text-brand-dark">
          <CheckCircle2 className="h-5 w-5 shrink-0" /> {t.filled}
        </p>
      ) : (
        tgFastLink && (
          <div className="rounded-2xl border border-[#229ED9]/30 bg-[#eaf6fc] p-5">
            <p className="font-semibold text-[#0f5c82]">{t.fastTitle}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-[#2f5d74]">{t.fastText}</p>
            <a href={tgFastLink} target="_blank" rel="noopener noreferrer" className="btn mt-4 h-12 w-full gap-2 bg-[#229ED9] text-white hover:bg-[#1c89bd]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
              {t.fastBtn}
            </a>
            <p className="mt-3 text-center text-[13px] text-muted">{t.orManual}</p>
          </div>
        )
      )}
      <div className="flex items-center gap-4">
        {shownPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownPhoto} alt="" className="h-20 w-20 shrink-0 rounded-2xl bg-cream object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-line bg-cream text-muted hover:border-brand hover:text-brand"
            aria-label={t.photoChoose}
          >
            <Camera className="h-7 w-7" />
          </button>
        )}
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">
            {t.photo} <span className="font-normal text-muted">{opt}</span>
          </p>
          <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.photoHint}</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => fileInput.current?.click()} className="btn-ghost h-9 px-3.5 text-[13px]">
              {shownPhoto ? t.photoChange : t.photoChoose}
            </button>
            {shownPhoto && (
              <button type="button" onClick={removePhoto} className="h-9 px-2 text-[13px] text-muted hover:text-danger">
                {t.photoRemove}
              </button>
            )}
          </div>
          {photoError && <p className="mt-1 text-[13px] text-danger">{photoError}</p>}
        </div>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t.name} hint={t.nameHint} error={errors.name}>
          <input name="name" autoComplete="name" className={fc(errors.name)} defaultValue={prefill?.name} required />
        </Field>
        <Field label={t.direction} error={errors.category}>
          <select name="category" defaultValue="" className={fc(errors.category)} required>
            <option value="" disabled>
              {d.form.choose}
            </option>
            <CategoryOptions lang={lang} />
          </select>
        </Field>
        <Field label={CITY_LABEL[lang]}>
          <select name="city" value={city} onChange={(e) => setCity(e.target.value)} className={fc()}>
            <CityOptions lang={lang} />
          </select>
        </Field>
      </div>
      <Field label={t.services} hint={t.servicesHint} error={errors.services}>
        <textarea name="services" rows={5} className={fc(errors.services)} required placeholder={t.servicesPlaceholder} />
      </Field>
      <Field label={t.about} optional={opt} hint={t.aboutHint} error={errors.about}>
        <textarea name="about" rows={4} className={fc(errors.about)} />
      </Field>
      <Field label={t.credentials} optional={opt} hint={t.credentialsHint} error={errors.credentials}>
        <textarea name="credentials" rows={3} className={fc(errors.credentials)} placeholder={t.credentialsPlaceholder} />
      </Field>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        <Field label={t.experience} optional={opt} error={errors.experience_years}>
          <input name="experience_years" type="number" min={0} max={70} inputMode="numeric" className={fc(errors.experience_years)} />
        </Field>
        <Field label={t.priceFrom} optional={opt} error={errors.price_from}>
          <input name="price_from" type="number" min={0} inputMode="numeric" className={fc(errors.price_from)} />
        </Field>
        <Field label={t.per} error={errors.price_unit}>
          <select name="price_unit" defaultValue="час" className={fc(errors.price_unit)}>
            {PRICE_UNITS.map((u) => (
              <option key={u} value={u}>
                {t.perUnit(unitLabel(u, lang))}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <fieldset>
        <legend className="text-[14px] font-semibold">{t.languages}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <label
              key={l}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[14px] has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
            >
              <input type="checkbox" name="languages" value={l} className="accent-[#1f6b4f]" defaultChecked={l === defaultLanguage} />
              {languageLabel(l, lang)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t.phone} hint={prefill ? `✓ ${t.phoneLocked}` : t.phoneHint} error={errors.phone}>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={`${fc(errors.phone)} ${prefill ? "bg-cream" : ""}`}
            placeholder={d.form.phonePlaceholder}
            defaultValue={prefill?.phone}
            readOnly={!!prefill}
            required
          />
        </Field>
        <Field label={t.telegram} optional={opt} error={errors.telegram}>
          <input name="telegram" className={fc(errors.telegram)} placeholder="@ivan_master" autoCapitalize="off" defaultValue={prefill?.telegram ? `@${prefill.telegram}` : undefined} />
        </Field>
      </div>
      {/* Где работает: выезд / у себя (адрес и точка на карте) / онлайн */}
      <WhereFields lang={lang} value={where} onChange={setWhere} error={errors.place} city={city} />
      <LinkFields lang={lang} />
      <label className="flex items-start gap-3 rounded-xl bg-cream p-3.5 text-[14px] leading-snug">
        <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-[#1f6b4f]" />
        <span>
          {t.consentA}{" "}
          <Link href={href(lang, "/rules")} className="underline" target="_blank">
            {t.consentTerms}
          </Link>
          .{errors.consent && <span className="mt-1 block text-danger">{errors.consent}</span>}
        </span>
      </label>
      {message && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{message}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary h-12 w-full">
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />} {t.submit}
      </button>
    </form>
  );
}
