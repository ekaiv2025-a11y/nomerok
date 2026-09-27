"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getDict, type Locale } from "@/lib/i18n";

/** Ответ специалиста на отзыв — в кабинете. */
export function ReviewReply({ lang, reviewId, initial }: { lang: Locale; reviewId: string; initial: string }) {
  const t = getDict(lang).reviews;
  const [text, setText] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState("");

  async function save() {
    setState("saving");
    setErr("");
    const res = await fetch("/api/cabinet/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, reply: text, lang }),
    }).catch(() => null);
    const j = res ? await res.json().catch(() => ({})) : {};
    if (j.ok) setState("saved");
    else {
      setErr(j.error || getDict(lang).form.sendError);
      setState("error");
    }
  }

  return (
    <div className="mt-3">
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setState("idle");
        }}
        rows={2}
        maxLength={1500}
        className="field text-[14px]"
        placeholder={t.replyPlaceholder}
      />
      <div className="mt-2 flex items-center gap-3">
        <button type="button" onClick={save} disabled={state === "saving" || text.trim() === initial.trim()} className="btn-ghost h-9 px-4 text-[13px] disabled:opacity-50">
          {state === "saving" && <Loader2 className="h-4 w-4 animate-spin" />} {t.replySave}
        </button>
        {state === "saved" && <span className="text-[13px] text-brand-dark">{t.replySaved}</span>}
        {err && <span className="text-[13px] text-danger">{err}</span>}
      </div>
    </div>
  );
}
