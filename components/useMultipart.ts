"use client";

import { useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";

/** Отправка формы с файлами (multipart). Как useSubmit, но с FormData. */
export function useMultipart(url: string, lang: Locale) {
  const t = getDict(lang).form;
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function send(fd: FormData) {
    setState("sending");
    setErrors({});
    setMessage("");
    fd.set("lang", lang);
    try {
      const res = await fetch(url, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setState("done");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (data.fields) {
        setErrors(data.fields);
        setMessage(t.checkFields);
      } else setMessage(data.error || t.sendError);
      setState("error");
    } catch {
      setMessage(t.netError);
      setState("error");
    }
  }
  return { state, errors, message, send, setMessage };
}
