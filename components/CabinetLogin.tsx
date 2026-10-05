"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

const T = {
  ru: {
    phone: "Номер телефона из анкеты",
    getCode: "Получить код",
    sent: "Мы отправили код в Telegram — в чат с ботом NomerOk.",
    code: "Код из Telegram",
    enter: "Войти",
    again: "Другой номер",
    errors: {
      phone: "Проверьте номер",
      notfound: "Анкеты с таким номером нет. Проверьте номер или зарегистрируйтесь.",
      nobot: "К этой анкете не подключён Telegram-бот. Войдите через кнопку Telegram ниже.",
      limit: "Слишком много попыток — подождите немного.",
      wrong: "Неверный код — проверьте и попробуйте ещё раз.",
      expired: "Код устарел — запросите новый.",
      net: "Нет связи — попробуйте ещё раз.",
    },
  },
  en: {
    phone: "Phone number from your profile",
    getCode: "Get a code",
    sent: "We've sent a code to Telegram — to the chat with the NomerOk bot.",
    code: "Code from Telegram",
    enter: "Log in",
    again: "Another number",
    errors: {
      phone: "Check the number",
      notfound: "No profile with this number. Check it or sign up.",
      nobot: "This profile isn't connected to the Telegram bot. Log in with the Telegram button below.",
      limit: "Too many attempts — please wait a bit.",
      wrong: "Wrong code — check it and try again.",
      expired: "The code has expired — request a new one.",
      net: "No connection — try again.",
    },
  },
  ka: {
    phone: "ტელეფონის ნომერი ანკეტიდან",
    getCode: "კოდის მიღება",
    sent: "კოდი გამოგიგზავნეთ Telegram-ში — NomerOk ბოტის ჩატში.",
    code: "კოდი Telegram-იდან",
    enter: "შესვლა",
    again: "სხვა ნომერი",
    errors: {
      phone: "შეამოწმეთ ნომერი",
      notfound: "ამ ნომრით ანკეტა არ არის. შეამოწმეთ ან დარეგისტრირდით.",
      nobot: "ამ ანკეტას Telegram-ბოტი არ აქვს მიერთებული. შედით Telegram-ის ღილაკით ქვემოთ.",
      limit: "ძალიან ბევრი მცდელობა — ცოტა მოიცადეთ.",
      wrong: "არასწორი კოდი — სცადეთ ხელახლა.",
      expired: "კოდს ვადა გაუვიდა — მოითხოვეთ ახალი.",
      net: "კავშირი არ არის — სცადეთ ხელახლა.",
    },
  },
} as const;

/** Вход в кабинет: номер → код из Telegram → готово. Без перехода по ссылкам. */
export function CabinetLogin({ lang }: { lang: Locale }) {
  const t = T[lang];
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function call(body: Record<string, string>) {
    setBusy(true);
    setErr("");
    const r = await fetch("/api/cabinet/code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : { error: "net" };
    setBusy(false);
    return j as { ok?: boolean; error?: keyof typeof t.errors };
  }

  return (
    <form
      className="mt-6 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (step === "phone") {
          const j = await call({ phone });
          if (j.ok) {
            setStep("code");
            setCode("");
          } else setErr(t.errors[j.error ?? "net"] ?? t.errors.net);
        } else {
          const j = await call({ code });
          if (j.ok) router.refresh();
          else {
            setErr(t.errors[j.error ?? "net"] ?? t.errors.net);
            if (j.error === "expired") setStep("phone");
          }
        }
      }}
    >
      {step === "phone" ? (
        <label className="block">
          <span className="text-[14px] font-semibold">{t.phone}</span>
          <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+995 5XX XX XX XX" className="field mt-1.5 text-[17px]" required />
        </label>
      ) : (
        <>
          <p className="rounded-xl bg-brand-soft p-3 text-[14px] text-brand-dark">✈️ {t.sent}</p>
          <label className="block">
            <span className="text-[14px] font-semibold">{t.code}</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="field mt-1.5 text-center font-mono text-[24px] tracking-[0.4em]"
              autoFocus
            />
          </label>
        </>
      )}
      {err && <p className="text-[14px] text-danger">{err}</p>}
      <button type="submit" disabled={busy || (step === "code" && code.length !== 6)} className="btn-primary h-12 w-full text-[16px]">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} {step === "phone" ? t.getCode : t.enter}
      </button>
      {step === "code" && (
        <button type="button" onClick={() => { setStep("phone"); setErr(""); }} className="w-full text-center text-[14px] text-muted underline">
          {t.again}
        </button>
      )}
    </form>
  );
}
