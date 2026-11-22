"use client";

import { useEffect, useState } from "react";
import { openNow } from "@/lib/places";
import type { Locale } from "@/lib/i18n/config";

const T = { ru: ["Открыто сейчас", "Сейчас закрыто"], en: ["Open now", "Closed now"], ka: ["ახლა ღიაა", "ახლა დაკეტილია"] } as const;

/** «Открыто сейчас» по часам работы — считается в браузере посетителя по времени Грузии. */
export function OpenBadge({ hours, lang }: { hours: string; lang: Locale }) {
  const [v, setV] = useState<boolean | null>(null);
  useEffect(() => {
    setV(openNow(hours));
    const id = setInterval(() => setV(openNow(hours)), 60_000);
    return () => clearInterval(id);
  }, [hours]);
  if (v == null) return null;
  return <b className={`ml-2 rounded-full px-2 py-0.5 text-[12px] font-semibold ${v ? "bg-brand-soft text-brand-dark" : "bg-[#fbeee6] text-[#b4532a]"}`}>{T[lang][v ? 0 : 1]}</b>;
}
