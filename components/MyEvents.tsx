"use client";

import Link from "next/link";
import { useState } from "react";
import { eventWhen, kindOf, type CityEvent } from "@/lib/events";
import type { Locale } from "@/lib/i18n/config";

/** Кабинет: мои мероприятия в афише — посмотреть или снять. */
export function MyEvents({ events, lang }: { events: CityEvent[]; lang: Locale }) {
  const [list, setList] = useState(events);
  if (!list.length) return null;
  return (
    <div className="space-y-2">
      {list.map((e) => (
        <div key={e.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream text-[22px]">{kindOf(e.kind).emoji}</span>
          <div className="min-w-0 grow">
            <p className="text-[12.5px] font-semibold text-brand">{eventWhen(e, lang)}</p>
            <p className="truncate text-[15px] font-semibold">{e.title}</p>
            {e.status === "pending" && <p className="text-[12px] text-[#8a6a1f]">На проверке</p>}
          </div>
          {e.status === "published" && (
            <Link href={`/${lang}/afisha/${e.slug}`} className="text-[13px] font-semibold text-brand hover:underline">
              Открыть
            </Link>
          )}
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm("Снять мероприятие с афиши?")) return;
              await fetch("/api/events/remove", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: e.id }) });
              setList((l) => l.filter((x) => x.id !== e.id));
            }}
            className="text-[13px] text-muted hover:text-danger"
          >
            Снять
          </button>
        </div>
      ))}
    </div>
  );
}
