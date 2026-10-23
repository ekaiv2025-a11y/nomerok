"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const T = {
  ru: { title: "🔗 Ваша короткая ссылка", hint: "Вместо длинного адреса — короткий, например nomerok.ge/anna. Придумайте его один раз, нажмите «Сохранить» и вставляйте везде: в шапку Instagram, в описание Telegram, в сообщения клиентам. По ссылке откроется ваш профиль с контактами и отзывами.", save: "Сохранить", copy: "Скопировать", copied: "Скопировано ✓", saved: "Сохранено ✓", invalid: "Только латинские буквы, цифры, - и _, от 3 до 30 символов", taken: "Это имя уже занято — попробуйте другое", err: "Не получилось сохранить" },
  en: { title: "🔗 Your short link", hint: "A short address instead of a long one, e.g. nomerok.ge/anna. Choose it once, tap “Save” and use it everywhere: Instagram bio, Telegram description, messages to clients. It opens your profile with contacts and reviews.", save: "Save", copy: "Copy", copied: "Copied ✓", saved: "Saved ✓", invalid: "Latin letters, digits, - and _ only, 3–30 characters", taken: "This name is taken — try another", err: "Could not save" },
  ka: { title: "🔗 თქვენი მოკლე ბმული", hint: "გრძელი მისამართის ნაცვლად — მოკლე, მაგ. nomerok.ge/anna. მოიფიქრეთ ერთხელ, დააჭირეთ «შენახვას» და ჩასვით ყველგან: Instagram-ის აღწერაში, Telegram-ში, შეტყობინებებში. ბმული გახსნის თქვენს პროფილს კონტაქტებით და შეფასებებით.", save: "შენახვა", copy: "კოპირება", copied: "დაკოპირდა ✓", saved: "შენახულია ✓", invalid: "მხოლოდ ლათინური ასოები, ციფრები, - და _, 3–30 სიმბოლო", taken: "ეს სახელი დაკავებულია", err: "ვერ შეინახა" },
} as const;

export function ShortLinkCard({ lang, initial, suggestion }: { lang: Locale; initial: string | null; suggestion: string }) {
  const t = T[lang];
  const [value, setValue] = useState(initial ?? suggestion);
  const [saved, setSaved] = useState(initial);
  const [state, setState] = useState<"" | "saving" | "saved" | "copied">("");
  const [error, setError] = useState("");
  const url = `nomerok.ge/${saved ?? ""}`;
  async function save() {
    setState("saving");
    setError("");
    const r = await fetch("/api/cabinet/short", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ short: value }) }).catch(() => null);
    const d = await r?.json().catch(() => null);
    if (r?.ok) {
      setSaved(value.trim().replace(/^@/, "").toLowerCase() || null);
      setState("saved");
    } else {
      setError(d?.error === "invalid" ? t.invalid : d?.error === "taken" ? t.taken : t.err);
      setState("");
    }
  }
  return (
    <section className="rounded-2xl border border-line p-5">
      <h2 className="text-[18px] font-bold">🔗 {t.title}</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.hint}</p>
      <div className="mt-3 flex items-center rounded-xl border border-line bg-white pl-3 focus-within:border-brand">
        <span className="text-[15px] text-muted">nomerok.ge/</span>
        <input value={value} onChange={(e) => setValue(e.target.value)} className="h-11 min-w-0 flex-1 bg-transparent pr-2 text-[15px] font-semibold outline-none" autoCapitalize="off" spellCheck={false} />
      </div>
      {error && <p className="mt-1 text-[13px] text-danger">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={save} disabled={state === "saving"} className="btn-primary h-10 px-4 text-[14px]">
          {state === "saving" && <Loader2 className="h-4 w-4 animate-spin" />} {state === "saved" ? t.saved : t.save}
        </button>
        {saved && (
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText("https://" + url);
                setState("copied");
              } catch {}
            }}
            className="btn-ghost h-10 px-4 text-[14px]"
          >
            <Copy className="h-4 w-4" /> {state === "copied" ? t.copied : `${t.copy} ${url}`}
          </button>
        )}
      </div>
    </section>
  );
}
