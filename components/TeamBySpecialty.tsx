"use client";

import { useState } from "react";
import { MasterCard } from "./MasterCard";
import type { PublicMaster } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

export type TeamGroup = { id: string; label: string; ids: string[] };

const T = {
  ru: { all: "Все", more: (n: number) => `Показать всех (${n})` },
  en: { all: "All", more: (n: number) => `Show all (${n})` },
  ka: { all: "ყველა", more: (n: number) => `ყველას ჩვენება (${n})` },
} as const;

/** Команда организации с фильтром по специальности (клиника: кардиологи, онкологи…). */
export function TeamBySpecialty({ team, groups, lang }: { team: PublicMaster[]; groups: TeamGroup[]; lang: Locale }) {
  const [g, setG] = useState("all");
  const [open, setOpen] = useState(false);
  const cur = groups.find((x) => x.id === g);
  const list = cur ? team.filter((m) => cur.ids.includes(m.id)) : team;
  const shown = open || cur ? list : list.slice(0, 9);
  const chip = (on: boolean) =>
    `inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-medium ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`;
  return (
    <div className="mt-3">
      {groups.length > 1 && (
        <div className="-mx-1 flex flex-wrap gap-2 px-1 pb-1">
          <button type="button" onClick={() => setG("all")} className={chip(g === "all")}>
            {T[lang].all} <span className="opacity-60">{team.length}</span>
          </button>
          {groups.map((x) => (
            <button key={x.id} type="button" onClick={() => setG(x.id)} className={chip(g === x.id)}>
              {x.label} <span className="opacity-60">{x.ids.length}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map((m) => (
          <MasterCard key={m.id} m={m} lang={lang} />
        ))}
      </div>
      {!open && !cur && list.length > 9 && (
        <button type="button" onClick={() => setOpen(true)} className="btn-ghost mt-3 h-11 px-5 text-[14px]">
          {T[lang].more(list.length)}
        </button>
      )}
    </div>
  );
}
