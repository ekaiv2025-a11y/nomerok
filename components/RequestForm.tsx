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
import { CategoryIcon } from "@/lib/category-icons";
import { CITY_LABEL, CityOptions } from "./CitySelect";
import { isCity } from "@/lib/cities";
import { looksLikeSelf } from "@/lib/request-check";
import { HINT_TITLE, requestHints } from "@/lib/request-hints";
import { EMPTY_REALTY, RealtyFields, realtySummary, realtyText, type Realty } from "./RealtyFields";

const SELF = {
  ru: { title: "Похоже, вы рассказываете о себе как о специалисте", text: "Эта форма — для тех, кто ищет мастера. Если вы специалист и хотите получать заказы, разместите анкету — так вы сможете получать заявки клиентов в Telegram.", join: "Я специалист — разместить анкету", no: "Нет, я ищу мастера" },
  en: { title: "Looks like you're describing yourself as a specialist", text: "This form is for people looking for a specialist. If you are a specialist and want orders, create a profile — then you can get client requests in Telegram.", join: "I'm a specialist — create a profile", no: "No, I'm looking for a specialist" },
  ka: { title: "როგორც ჩანს, საკუთარ თავზე წერთ როგორც სპეციალისტი", text: "ეს ფორმა მათთვისაა, ვინც ეძებს ხელოსანს. თუ სპეციალისტი ხართ და გინდათ შეკვეთები, განათავსეთ პროფილი — მოთხოვნებს Telegram-ში მიიღებთ.", join: "სპეციალისტი ვარ — პროფილის განთავსება", no: "არა, ხელოსანს ვეძებ" },
} as const;

const PICK = {
  ru: { auto: "подобрали по описанию", change: "Изменить", tap: "Выберите или просто опишите задачу выше — подберём сами", notSure: "Не поняли по описанию — выберите, кто нужен:", all: "Все направления…" },
  en: { auto: "matched from your description", change: "Change", tap: "Pick one or just describe the task above — we'll match it", notSure: "Couldn't tell from the description — pick who you need:", all: "All categories…" },
  ka: { auto: "შერჩეულია აღწერით", change: "შეცვლა", tap: "აირჩიეთ ან უბრალოდ აღწერეთ ამოცანა ზემოთ — თავად შევარჩევთ", notSure: "აღწერით ვერ გავიგეთ — აირჩიეთ, ვინ გჭირდებათ:", all: "ყველა მიმართულება…" },
} as const;
const POPULAR = ["handyman", "plumber", "electrician", "appliances", "repair", "cleaning", "beauty", "tutor", "doctor", "moving"];

type Props = { lang: Locale; defaultCategory?: string; defaultCity?: string; defaultText?: string; org?: string; me?: { name: string; phone: string } | null };

/** Общая заявка — для всех специалистов направления. */
export function RequestForm({ lang, defaultCategory, defaultCity, defaultText, org, me }: Props) {
  const d = getDict(lang);
  const t = d.request;
  const { state, errors, message, submit, result } = useSubmit("/api/requests", lang, "request");
  const [files, setFiles] = useState<File[]>([]);
  const [catSel, setCatSel] = useState<string>("");
  const [desc, setDesc] = useState(defaultText ?? "");
  const [photoErr, setPhotoErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selfOk, setSelfOk] = useState(false);
  const [realty, setRealty] = useState<Realty>(EMPTY_REALTY);
  const [realtyErr, setRealtyErr] = useState("");
  const selfWarn = !selfOk && looksLikeSelf(desc);
  const [pick, setPick] = useState(false);
  // Направление: выбрано вручную → пришло со страницы направления → угадано по описанию
  const autoList = detectIntent(desc).map((x) => x.cat).filter((c, i, a) => a.indexOf(c) === i && CATEGORIES.some((k) => k.id === c));
  const auto = autoList[0] ?? "";

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand" />
        <h2 className="mt-3 text-xl font-bold">{result.pending ? t.pendingTitle : t.doneTitle}</h2>
        {!result.pending && <p className="mt-2 text-[15px] text-[#3d5a4c]">{t.doneGeneral}</p>}
        {result.held === "specialist" && (
          <p className="mt-3 rounded-xl bg-[#fff8e6] p-3 text-left text-[14px] text-[#5a4a22]">
            {lang === "ru"
              ? "Похоже, вы специалист: этот номер уже есть в анкете на NomerOk. Заявки — для тех, кто ищет мастера, поэтому эту мы проверим вручную. Чтобы получать заказы, следите за заявками в боте и в кабинете."
              : lang === "ka"
                ? "როგორც ჩანს, თქვენ სპეციალისტი ხართ — ეს ნომერი უკვე არის ანკეტაში. განაცხადს ხელით შევამოწმებთ."
                : "Looks like you're a specialist — this number is already in a NomerOk profile. We'll review this request manually."}
          </p>
        )}
        {result.held === "self" && (
          <p className="mt-3 rounded-xl bg-[#fff8e6] p-3 text-left text-[14px] text-[#5a4a22]">
            {lang === "ru" ? "Текст похож на рекламу услуг, поэтому заявку проверим вручную. Если вы специалист — " : lang === "ka" ? "ტექსტი სარეკლამოს ჰგავს, ამიტომ ხელით შევამოწმებთ. თუ სპეციალისტი ხართ — " : "The text looks like an ad for services, so we'll review it manually. If you're a specialist — "}
            <Link href={href(lang, "/join")} className="font-semibold text-brand underline">
              {lang === "ru" ? "разместите анкету" : lang === "ka" ? "განათავსეთ ანკეტა" : "create a profile"}
            </Link>
            {lang === "ru" ? ", и заявки клиентов будут приходить вам сами." : lang === "ka" ? "." : " and client requests will come to you."}
          </p>
        )}
        {!!result.pending ? (
          <TelegramStep title={t.pendingTitle} text={t.pendingText} button={t.pendingBtn} link={result.tgLink} />
        ) : (
          <TelegramStep title={t.tgTitle} text={t.tgText} button={t.tgBtn} link={result.tgLink} />
        )}
        {typeof result.claim === "string" && (
          <Link href={href(lang, `/login?as=client&claim=${result.claim}`)} className="btn-ghost mt-3 h-11 w-full gap-2 text-[14px]">
            📧 {result.pending ? t.pendingAlt : lang === "ru" ? "Получать отклики на почту (или через Google)" : lang === "ka" ? "პასუხების მიღება ელფოსტაზე (ან Google-ით)" : "Get replies by email (or via Google)"}
          </Link>
        )}
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
    const isRealty = f.get("category") === "realtor";
    if (isRealty && !realty.deal) {
      setRealtyErr(realtyText(lang).needDeal);
      document.getElementById("realty")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const description = isRealty ? [realtySummary(realty, lang), String(f.get("description") ?? "").trim()].filter(Boolean).join("\n") : f.get("description");
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
      description,
      when_text: f.get("when_text"),
      name: f.get("name"),
      phone: f.get("phone"),
      website: f.get("website"),
      notSelf: selfOk,
      org: org ?? null,
    });
  }

  const initialCat = CATEGORIES.some((c) => c.id === defaultCategory) ? defaultCategory! : "";
  const cat = catSel || initialCat || auto;

  return (
    <form onSubmit={onSubmit} data-funnel="request" className="relative space-y-5" noValidate>
      <Honeypot label={d.form.honeypot} />
      <Field
        label={cat === "realtor" ? realtyText(lang).notesLabel : t.what}
        hint={cat === "realtor" ? undefined : t.whatHint}
        optional={cat === "realtor" ? d.form.optional : undefined}
        error={errors.description}
      >
        <textarea name="description" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} className={fc(errors.description)} placeholder={cat === "realtor" ? realtyText(lang).notesPh : t.whatPlaceholder} required={cat !== "realtor"} />
        {cat && cat !== "realtor" && desc.trim().length < 80 && (
          <div className="mt-2 rounded-xl bg-cream px-3 py-2.5 text-[13px] leading-snug">
            <p className="font-semibold">{HINT_TITLE[lang]}</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted">
              {requestHints(cat, lang).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        )}
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
      </Field>
      <Field label={t.who} error={errors.category}>
        <input type="hidden" name="category" value={cat} />
        {cat && !pick ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3.5 py-2 text-[15px] font-semibold text-brand-dark">
              <CategoryIcon id={cat} className="h-4 w-4" /> {categoryLabel(cat, lang)}
            </span>
            {!catSel && !initialCat && <span className="text-[13px] text-muted">{PICK[lang].auto}</span>}
            <button type="button" onClick={() => setPick(true)} className="text-[14px] font-semibold text-brand underline-offset-2 hover:underline">
              {PICK[lang].change}
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-[13px] text-muted">{desc.trim().length >= 3 && !auto ? PICK[lang].notSure : PICK[lang].tap}</p>
            <div className="flex flex-wrap gap-2">
              {[...new Set([...autoList, ...POPULAR])].slice(0, 10).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCatSel(c);
                    setPick(false);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[14px] ${c === cat ? "border-brand bg-brand-soft font-semibold text-brand-dark" : "border-line bg-white hover:border-brand"}`}
                >
                  <CategoryIcon id={c} className="h-4 w-4" /> {categoryLabel(c, lang)}
                </button>
              ))}
            </div>
            <select
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                setCatSel(e.target.value);
                setPick(false);
              }}
              className={`${fc()} mt-2`}
              aria-label={PICK[lang].all}
            >
              <option value="">{PICK[lang].all}</option>
              <CategoryOptions lang={lang} />
            </select>
          </div>
        )}
      </Field>
      {cat === "realtor" && (
        <div id="realty">
          <RealtyFields
            lang={lang}
            value={realty}
            onChange={(r) => {
              setRealty(r);
              setRealtyErr("");
            }}
            error={realtyErr}
          />
        </div>
      )}
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
