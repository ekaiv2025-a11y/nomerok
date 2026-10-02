"use client";

import { useRef, useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import { formatPhone } from "@/lib/phone";

export type SubmitState = "idle" | "sending" | "done" | "error";

export function useSubmit(url: string, lang: Locale) {
  const t = getDict(lang).form;
  const [state, setState] = useState<SubmitState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Record<string, unknown>>({});
  const startedAt = useRef(Date.now());

  async function submit(payload: Record<string, unknown>) {
    setState("sending");
    setErrors({});
    setMessage("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, lang, startedAt: startedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setResult(data);
        setState("done");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (data.fields) {
        setErrors(data.fields);
        setMessage(t.checkFields);
        const first = Object.keys(data.fields)[0];
        document.querySelector<HTMLElement>(`form [name="${first}"]`)?.focus();
      } else {
        setMessage(data.error || t.sendError);
      }
      setState("error");
    } catch {
      setMessage(t.netError);
      setState("error");
    }
  }

  return { state, errors, message, submit, result };
}

export function Field({
  label,
  hint,
  error,
  children,
  optional,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[14px] font-semibold">
        {label} {optional && <span className="font-normal text-muted">{optional}</span>}
      </span>
      {hint && <span className="mt-0.5 block text-[13px] text-muted">{hint}</span>}
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-[13px] text-danger">{error}</span>}
    </label>
  );
}

/** Скрытое поле-ловушка для ботов. Люди его не видят и не заполняют. */
export function Honeypot({ label }: { label: string }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        {label}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function fc(err?: string) {
  return `field ${err ? "field-error" : ""}`;
}

/** Блок «подключите Telegram» после отправки формы. */
export function TelegramStep({ title, text, button, link }: { title: string; text: string; button: string; link?: unknown }) {
  if (typeof link !== "string" || !link) return null;
  return (
    <div className="mt-5 rounded-2xl border border-[#229ED9]/30 bg-[#eaf6fc] p-5 text-left">
      <p className="font-semibold text-[#0f5c82]">{title}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-[#2f5d74]">{text}</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="btn mt-4 h-12 w-full bg-[#229ED9] text-white hover:bg-[#1c89bd]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M9.04 15.47 8.9 19.6c.42 0 .6-.18.82-.4l1.97-1.88 4.08 2.99c.75.41 1.28.2 1.48-.69l2.68-12.57c.26-1.2-.44-1.67-1.17-1.39L3.2 11.05c-1.08.42-1.06 1.03-.19 1.3l4.04 1.26 9.39-5.92c.44-.29.84-.13.51.16"/>
        </svg>
        {button}
      </a>
    </div>
  );
}

const ME_TEXT = {
  ru: { from: "Заявка от", change: "изменить", linked: "Отклики придут вам в Telegram и в «Мои заявки» — ничего подключать не нужно.", my: "Мои заявки" },
  en: { from: "From", change: "change", linked: "Responses will arrive in Telegram and in “My requests” — nothing else to connect.", my: "My requests" },
  ka: { from: "განაცხადი", change: "შეცვლა", linked: "გამოხმაურებები მოვა Telegram-ში და „ჩემ განაცხადებში“.", my: "ჩემი განაცხადები" },
} as const;

/**
 * Имя и телефон в заявке. Если клиент вошёл в «Мои заявки» и мы знаем его данные —
 * показываем одной строкой «Заявка от: Ольга, +995…» с кнопкой «изменить».
 */
export function ContactFields({
  lang,
  me,
  labels,
  errors,
}: {
  lang: "ru" | "en" | "ka";
  me?: { name: string; phone: string } | null;
  labels: { name: string; phone: string; phoneHint: string; optional: string; placeholder: string };
  errors: Record<string, string | undefined>;
}) {
  const [edit, setEdit] = useState(!me?.phone || !!errors.phone);
  const t = ME_TEXT[lang];
  if (!edit && me?.phone)
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-cream px-4 py-3 text-[15px]">
        <input type="hidden" name="name" value={me.name} />
        <input type="hidden" name="phone" value={me.phone} />
        <span className="text-muted">{t.from}:</span>
        <b>{[me.name, formatPhone(me.phone)].filter(Boolean).join(", ")}</b>
        <button type="button" onClick={() => setEdit(true)} className="text-[13px] text-brand underline">
          {t.change}
        </button>
      </div>
    );
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label={labels.name} optional={labels.optional} error={errors.name}>
        <input name="name" autoComplete="given-name" defaultValue={me?.name ?? ""} className={fc(errors.name)} />
      </Field>
      <Field label={labels.phone} hint={labels.phoneHint} error={errors.phone}>
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={me?.phone ?? ""} className={fc(errors.phone)} placeholder={labels.placeholder} required />
      </Field>
    </div>
  );
}

export function LinkedNote({ lang, href: myHref }: { lang: "ru" | "en" | "ka"; href: string }) {
  const t = ME_TEXT[lang];
  return (
    <div className="mt-5 rounded-2xl border border-[#229ED9]/30 bg-[#eaf6fc] p-4 text-left text-[14px] text-[#2f5d74]">
      ✅ {t.linked}{" "}
      <a href={myHref} className="font-semibold text-[#0f5c82] underline">
        {t.my} →
      </a>
    </div>
  );
}

export const PHOTO_TEXT = {
  ru: { label: "Фото", hint: "Покажите, что нужно сделать, — специалисту проще понять задачу и назвать цену.", add: "Добавить фото", err: "Можно до 3 фото JPG/PNG до 5 МБ", upErr: "Не удалось загрузить фото — попробуйте ещё раз или отправьте без фото" },
  en: { label: "Photos", hint: "Show what needs doing — it helps the specialist understand and quote.", add: "Add photo", err: "Up to 3 JPG/PNG photos, max 5 MB", upErr: "Could not upload photos — try again or send without them" },
  ka: { label: "ფოტო", hint: "აჩვენეთ, რა უნდა გაკეთდეს — სპეციალისტს გაუადვილდება ფასის დასახელება.", add: "ფოტოს დამატება", err: "მაქს. 3 ფოტო, 5 მბ-მდე", upErr: "ფოტო ვერ აიტვირთა" },
} as const;

/** Загружает фото к заявке и возвращает ссылки (или null при ошибке). */
export async function uploadRequestPhotos(files: File[]): Promise<string[] | null> {
  if (!files.length) return [];
  const { resizeImage } = await import("@/lib/image-resize");
  const fd = new FormData();
  for (const f of files) fd.append("photos", await resizeImage(f, 1600, 0.85));
  const r = await fetch("/api/requests/photos", { method: "POST", body: fd }).catch(() => null);
  const d = await r?.json().catch(() => null);
  return r?.ok && Array.isArray(d?.urls) ? d.urls : null;
}
