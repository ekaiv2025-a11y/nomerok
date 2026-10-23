"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { AUTH } from "@/lib/auth-text";
import type { Locale } from "@/lib/i18n";

export type LoginIntent = "client" | "spec" | "join" | "link";

const TG_PATH = "M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/**
 * Вход/регистрация: Google, Facebook, Telegram и код на почту.
 * intent — куда попасть после входа (клиент → «Мои заявки», специалист → кабинет, join → анкета).
 */
export function LoginBox({
  lang,
  intent,
  next,
  claim,
  google,
  facebook,
  tgLink,
  tgLabel,
}: {
  lang: Locale;
  intent: LoginIntent;
  next?: string | null;
  claim?: string | null;
  google: boolean;
  facebook: boolean;
  tgLink?: string | null;
  tgLabel?: string;
}) {
  const t = AUTH[lang];
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const q = new URLSearchParams({ as: intent, lang, ...(next ? { next } : {}), ...(claim ? { claim } : {}) }).toString();

  async function call(action: "send" | "verify") {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, email, code, lang, intent, next, claim }),
      });
      const j = await r.json().catch(() => ({}));
      if (!j.ok) {
        setErr(j.error || t.failed);
        if (j.expired) setCode("");
        return;
      }
      if (action === "send") setStep("code");
      else window.location.href = j.url;
    } catch {
      setErr(t.failed);
    } finally {
      setBusy(false);
    }
  }

  const big = "btn h-12 w-full gap-2.5 rounded-2xl text-[15px]";
  return (
    <div className="space-y-2.5">
      {google && (
        <a href={`/api/auth/google?${q}`} className={`${big} border border-line bg-white text-ink hover:bg-cream`}>
          <GoogleIcon /> {t.google}
        </a>
      )}
      {facebook && (
        <a href={`/api/auth/facebook?${q}`} className={`${big} bg-[#1877F2] text-white hover:bg-[#166fe0]`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
          </svg>
          {t.facebook}
        </a>
      )}
      {tgLink && (
        <a href={tgLink} target="_blank" rel="noopener noreferrer" className={`${big} bg-[#229ED9] text-white hover:bg-[#1c89bd]`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d={TG_PATH} />
          </svg>
          {tgLabel ?? t.telegram}
        </a>
      )}

      {(google || facebook || tgLink) && <p className="flex items-center gap-3 pt-2 text-[13px] text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">{t.or}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          call(step === "email" ? "send" : "verify");
        }}
        className="space-y-2.5"
      >
        {step === "email" ? (
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.email}
            aria-label={t.email}
            className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-[15px] outline-none focus:border-brand"
          />
        ) : (
          <>
            <p className="rounded-xl bg-brand-soft p-3 text-[14px] leading-snug text-brand-dark">{t.codeSent(email)}</p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={7}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ""))}
              placeholder="000000"
              aria-label={t.code}
              className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-center text-[22px] tracking-[0.3em] outline-none focus:border-brand"
            />
          </>
        )}
        {err && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{err}</p>}
        <button type="submit" disabled={busy} className={`${big} btn-primary`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} {step === "email" ? t.sendCode : t.verify}
        </button>
        {step === "code" && (
          <div className="flex justify-between text-[13px]">
            <button type="button" className="text-muted underline" onClick={() => (setStep("email"), setCode(""), setErr(""))}>
              {t.otherEmail}
            </button>
            <button type="button" className="text-muted underline" disabled={busy} onClick={() => call("send")}>
              {t.resend}
            </button>
          </div>
        )}
      </form>
      <p className="text-center text-[12px] text-muted">{t.noPass}</p>
    </div>
  );
}
