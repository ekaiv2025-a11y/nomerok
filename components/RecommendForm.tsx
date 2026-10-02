"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { SOCIAL } from "@/lib/social-text";
import type { Locale } from "@/lib/i18n";

export function RecommendForm({ lang }: { lang: Locale }) {
  const t = SOCIAL[lang];
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    const you = String(f.get("you") ?? "").trim();
    try {
      await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ master: f.get("master"), contact: f.get("contact"), what: f.get("what"), you, website: f.get("website") }),
      });
    } catch {}
    setText(t.recInvite(you));
    setState("done");
  }

  if (state === "done")
    return (
      <div className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[19px] font-bold">{t.recDoneTitle}</h2>
        <p className="mt-1 text-[14px] text-muted">{t.recDoneText}</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="field mt-3 w-full py-2 text-[14px]" />
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent("https://nomerok.ge/join")}&text=${encodeURIComponent(text.replace(/\s*https:\/\/nomerok\.ge\/join\s*$/, ""))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn h-11 bg-[#229ED9] px-5 text-white hover:bg-[#1c89bd]"
          >
            <Send className="h-4 w-4" /> {t.recShareTg}
          </a>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
              } catch {}
            }}
            className="btn-ghost h-11 px-5"
          >
            {copied ? t.recCopied : t.recCopy}
          </button>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-5">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="block">
        <span className="text-[14px] font-semibold">{t.recMaster}</span>
        <input name="master" required maxLength={80} className="field mt-1 w-full" />
      </label>
      <label className="block">
        <span className="text-[14px] font-semibold">{t.recWhat}</span>
        <input name="what" maxLength={120} placeholder={t.recWhatPh} className="field mt-1 w-full" />
      </label>
      <label className="block">
        <span className="text-[14px] font-semibold">{t.recContact}</span>
        <span className="ml-1 text-[12px] text-muted">{t.recContactHint}</span>
        <input name="contact" maxLength={80} className="field mt-1 w-full" />
      </label>
      <label className="block">
        <span className="text-[14px] font-semibold">{t.recYou}</span>
        <input name="you" maxLength={60} className="field mt-1 w-full" />
      </label>
      <button disabled={state === "sending"} className="btn-primary h-12 w-full">
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />} {t.recSend}
      </button>
    </form>
  );
}
