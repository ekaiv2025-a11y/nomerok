"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { CATEGORIES, LANGUAGES, PRICE_UNITS, categoryLabel, languageLabel, unitLabel } from "@/lib/categories";
import { MAX_EXTRA_CATEGORIES } from "@/lib/availability";
import { WhereFields, type WhereValue } from "./WhereFields";
import { CITY_LABEL, CityOptions } from "./CitySelect";
import { LinkFields, readLinkFields } from "./SocialLinks";
import type { MasterLinks } from "@/lib/links";
import { resizeImage } from "@/lib/image-resize";
import { getDict, type Locale } from "@/lib/i18n";
import { Field, fc } from "./form-kit";

type Initial = {
  name: string;
  services: string;
  about: string;
  credentials: string;
  experience_years: number | null;
  price_from: number | null;
  price_unit: string;
  languages: string[];
  telegram: string | null;
  whatsapp: boolean;
  notify_requests: boolean;
  photo_url: string | null;
  category: string;
  city: string;
  links: MasterLinks;
  extra_categories: string[];
  where: WhereValue;
};

export function CabinetForm({ lang, phone, initial }: { lang: Locale; phone: string; initial: Initial }) {
  const d = getDict(lang);
  const t = d.cabinet;
  const j = d.join;
  const opt = d.form.optional;
  const router = useRouter();
  const [photo, setPhoto] = useState(initial.photo_url);
  const [photoState, setPhotoState] = useState<"idle" | "loading">("idle");
  const [photoError, setPhotoError] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [extra, setExtra] = useState<string[]>(initial.extra_categories ?? []);
  const [where, setWhere] = useState<WhereValue>(initial.where);
  const [city, setCity] = useState(initial.city || "batumi");
  function toggleExtra(id: string) {
    setExtra((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX_EXTRA_CATEGORIES ? cur : [...cur, id]));
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0];
    if (!raw) return;
    const file = await resizeImage(raw, 800);
    setPhotoError("");
    setPhotoState("loading");
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("lang", lang);
    try {
      const res = await fetch("/api/cabinet/photo", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!data.ok) throw new Error(data.error || t.photoError);
      setPhoto(data.url);
      router.refresh();
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : t.photoError);
    } finally {
      setPhotoState("idle");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = String(f.get(k) ?? "").trim();
      return v === "" ? null : v;
    };
    setState("saving");
    setErrors({});
    setMessage("");
    try {
      const res = await fetch("/api/cabinet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          name: f.get("name"),
          services: f.get("services"),
          about: f.get("about"),
          credentials: f.get("credentials"),
          experience_years: num("experience_years"),
          price_from: num("price_from"),
          price_unit: f.get("price_unit"),
          languages: f.getAll("languages"),
          telegram: f.get("telegram"),
          whatsapp: f.get("whatsapp") === "on",
          extra_categories: extra,
          city: f.get("city"),
          links: readLinkFields(f),
          ...where,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setState("saved");
        router.refresh();
        setTimeout(() => setState("idle"), 2500);
        return;
      }
      if (data.fields) {
        setErrors(data.fields);
        setMessage(d.form.checkFields);
      } else setMessage(data.error || d.form.sendError);
      setState("error");
    } catch {
      setMessage(d.form.netError);
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-line p-5 sm:p-6" noValidate>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream">
          {photo ? (
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              <Camera className="h-8 w-8" />
            </div>
          )}
          {photoState === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          )}
        </div>
        <div>
          <p className="text-[14px] font-semibold">{t.photo}</p>
          <p className="mt-0.5 text-[13px] text-muted">{t.photoHint}</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost mt-2 h-9 px-4 text-[13px]" disabled={photoState === "loading"}>
            {photo ? t.photoChange : t.photoUpload}
          </button>
          {photoError && <p className="mt-1 text-[13px] text-danger">{photoError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={j.name} error={errors.name}>
          <input name="name" defaultValue={initial.name} className={fc(errors.name)} />
        </Field>
        <Field label={t.phone} hint={t.phoneNote}>
          <input value={phone} disabled className="field bg-cream text-muted" />
        </Field>
      </div>
      <Field label={j.services} hint={j.servicesHint} error={errors.services}>
        <textarea name="services" rows={5} defaultValue={initial.services} className={fc(errors.services)} />
      </Field>
      <Field label={j.about} optional={opt} hint={j.aboutHint} error={errors.about}>
        <textarea name="about" rows={4} defaultValue={initial.about} className={fc(errors.about)} />
      </Field>
      <Field label={j.credentials} optional={opt} hint={j.credentialsHint} error={errors.credentials}>
        <textarea name="credentials" rows={3} defaultValue={initial.credentials} className={fc(errors.credentials)} />
      </Field>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        <Field label={j.experience} optional={opt} error={errors.experience_years}>
          <input name="experience_years" type="number" min={0} max={70} defaultValue={initial.experience_years ?? ""} className={fc(errors.experience_years)} />
        </Field>
        <Field label={j.priceFrom} optional={opt} error={errors.price_from}>
          <input name="price_from" type="number" min={0} defaultValue={initial.price_from ?? ""} className={fc(errors.price_from)} />
        </Field>
        <Field label={j.per}>
          <select name="price_unit" defaultValue={initial.price_unit} className="field">
            {PRICE_UNITS.map((u) => (
              <option key={u} value={u}>
                {j.perUnit(unitLabel(u, lang))}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <fieldset>
        <legend className="text-[14px] font-semibold">{j.languages}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <label key={l} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[14px] has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
              <input type="checkbox" name="languages" value={l} defaultChecked={initial.languages.includes(l)} className="accent-[#1f6b4f]" />
              {languageLabel(l, lang)}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label={CITY_LABEL[lang]}>
        <select name="city" value={city} onChange={(e) => setCity(e.target.value)} className={fc()}>
          <CityOptions lang={lang} />
        </select>
      </Field>
      <Field label={j.telegram} optional={opt} error={errors.telegram}>
        <input name="telegram" defaultValue={initial.telegram ? "@" + initial.telegram : ""} className={fc(errors.telegram)} autoCapitalize="off" />
      </Field>
      <WhereFields lang={lang} value={where} onChange={setWhere} error={errors.place} city={city} />
      <LinkFields lang={lang} initial={initial.links} />
      <fieldset>
        <legend className="text-[14px] font-semibold">
          {t.extraTitle} <span className="font-normal text-muted">{opt}</span>
        </legend>
        <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.extraHint}</p>
        <p className="mt-2 text-[13px]">
          {categoryLabel(initial.category, lang)} · <b>{extra.length}/{MAX_EXTRA_CATEGORIES}</b>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.id !== initial.category).map((c) => {
            const on = extra.includes(c.id);
            const disabled = !on && extra.length >= MAX_EXTRA_CATEGORIES;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleExtra(c.id)}
                disabled={disabled}
                aria-pressed={on}
                className={`rounded-full border px-3 py-1.5 text-[13px] ${on ? "border-brand bg-brand-soft font-semibold text-brand-dark" : "border-line"} ${disabled ? "opacity-40" : "hover:border-brand"}`}
              >
                {on ? "✓ " : ""}
                {c.label[lang]}
              </button>
            );
          })}
        </div>
        {errors.extra_categories && <p className="mt-1 text-[13px] text-danger">{errors.extra_categories}</p>}
      </fieldset>
      {message && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{message}</p>}
      <button type="submit" disabled={state === "saving"} className="btn-primary h-12 w-full">
        {state === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
        {state === "saved" ? t.saved : t.save}
      </button>
    </form>
  );
}
