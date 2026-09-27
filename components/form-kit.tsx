"use client";

import { useRef, useState } from "react";

export type SubmitState = "idle" | "sending" | "done" | "error";

export function useSubmit(url: string) {
  const [state, setState] = useState<SubmitState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const startedAt = useRef(Date.now());

  async function submit(payload: Record<string, unknown>) {
    setState("sending");
    setErrors({});
    setMessage("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, startedAt: startedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setState("done");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (data.fields) {
        setErrors(data.fields);
        setMessage("Проверьте поля, отмеченные красным.");
        const first = Object.keys(data.fields)[0];
        document.querySelector<HTMLElement>(`form [name="${first}"]`)?.focus();
      } else {
        setMessage(data.error || "Не получилось отправить. Попробуйте ещё раз.");
      }
      setState("error");
    } catch {
      setMessage("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
      setState("error");
    }
  }

  return { state, errors, message, submit };
}

export function Field({ label, hint, error, children, optional }: { label: string; hint?: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[14px] font-semibold">
        {label} {optional && <span className="font-normal text-muted">(необязательно)</span>}
      </span>
      {hint && <span className="mt-0.5 block text-[13px] text-muted">{hint}</span>}
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-[13px] text-danger">{error}</span>}
    </label>
  );
}

/** Скрытое поле-ловушка для ботов. Люди его не видят и не заполняют. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Не заполняйте это поле
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function fc(err?: string) {
  return `field ${err ? "field-error" : ""}`;
}
