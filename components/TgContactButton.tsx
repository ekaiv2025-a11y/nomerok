"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { telegramLink } from "@/lib/phone";
import type { Locale } from "@/lib/i18n";

const TEXT: Record<Locale, { label: string; value: string }> = {
  ru: { label: "Telegram", value: "Написать в Telegram" },
  en: { label: "Telegram", value: "Message on Telegram" },
  ka: { label: "Telegram", value: "მიწერეთ Telegram-ში" },
};

/** Кнопка личного Telegram в блоке соцсетей. Ник берём через /api/contacts — так же, как «Показать контакты» (учитывается открытие). */
export function TgContactButton({ masterId, lang, icon, bg }: { masterId: string; lang: Locale; icon: React.ReactNode; bg: string }) {
  const [busy, setBusy] = useState(false);
  const t = TEXT[lang];
  async function open() {
    const w = window.open("about:blank", "_blank"); // открываем сразу, иначе браузер заблокирует окно
    setBusy(true);
    try {
      const res = await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ masterId, lang }) });
      const data = await res.json();
      if (!data.ok || !data.telegram) throw new Error(data.error || "no telegram");
      const url = telegramLink(data.telegram, data.phone);
      if (w) w.location.href = url;
      else window.location.href = url;
    } catch {
      w?.close();
      window.dispatchEvent(new Event("nm:reveal"));
      document.getElementById("contact")?.scrollIntoView({ block: "center", behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      type="button"
      onClick={open}
      className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5 pr-4 text-left transition hover:border-[#cfcac0] hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: bg }}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px] text-muted">{t.label}</span>
        <span className="block truncate text-[15px] font-semibold group-hover:text-brand">{t.value}</span>
      </span>
    </button>
  );
}
