"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { getDict, type Locale } from "@/lib/i18n";
import { Map } from "./map/Map";
import type { WorkMode } from "@/lib/types";

export type WhereValue = {
  work_mode: WorkMode;
  service_area: string;
  work_hours: string;
  place_address: string;
  place_lat: number | null;
  place_lng: number | null;
};

const MODES: WorkMode[] = ["at_client", "at_place", "both", "online"];

/** Кабинет: где работает специалист — выезд, у себя (точка на карте), онлайн. */
export function WhereFields({ lang, value, onChange, error }: { lang: Locale; value: WhereValue; onChange: (v: WhereValue) => void; error?: string }) {
  const t = getDict(lang).cabinet;
  const [query, setQuery] = useState(value.place_address);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [focus, setFocus] = useState<[number, number] | null>(null);
  const set = (patch: Partial<WhereValue>) => onChange({ ...value, ...patch });
  const needsPlace = value.work_mode === "at_place" || value.work_mode === "both";
  const visits = value.work_mode === "at_client" || value.work_mode === "both";

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setNotFound(false);
    const j = await fetch(`/api/geocode?lang=${lang}&q=${encodeURIComponent(query.includes("Batumi") || query.includes("Батуми") ? query : query + ", Батуми")}`)
      .then((r) => r.json())
      .catch(() => ({}));
    setSearching(false);
    if (j.ok) {
      set({ place_lat: j.lat, place_lng: j.lng, place_address: query.trim() });
      setFocus([j.lat, j.lng]);
    } else setNotFound(true);
  }

  async function pick(lat: number, lng: number) {
    const next = { place_lat: lat, place_lng: lng };
    onChange({ ...value, ...next });
    // Подставим адрес точки, если человек его ещё не ввёл сам
    if (!value.place_address.trim()) {
      const j = await fetch(`/api/geocode?lang=${lang}&lat=${lat}&lng=${lng}`)
        .then((r) => r.json())
        .catch(() => ({}));
      if (j.ok && j.address) {
        onChange({ ...value, ...next, place_address: j.address });
        setQuery(j.address);
      }
    }
  }

  return (
    <fieldset className="space-y-4 rounded-2xl border border-line p-4">
      <legend className="px-1 text-[15px] font-semibold">{t.whereTitle}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {MODES.map((m) => (
          <label
            key={m}
            className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line px-3.5 py-2.5 text-[15px] has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
          >
            <input type="radio" name="work_mode_ui" checked={value.work_mode === m} onChange={() => set({ work_mode: m })} className="h-4 w-4 accent-[#1f6b4f]" />
            {t.modes[m]}
          </label>
        ))}
      </div>

      {visits && (
        <label className="block">
          <span className="text-[14px] font-semibold">{t.serviceArea}</span>
          <input value={value.service_area} onChange={(e) => set({ service_area: e.target.value })} maxLength={200} placeholder={t.serviceAreaPlaceholder} className="field mt-1.5" />
        </label>
      )}

      {needsPlace && (
        <div>
          <span className="text-[14px] font-semibold">{t.placeAddress}</span>
          <span className="mt-0.5 block text-[13px] leading-snug text-muted">{t.placeAddressHint}</span>
          <div className="mt-2 flex gap-2">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                set({ place_address: e.target.value });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  search();
                }
              }}
              maxLength={200}
              placeholder="ул. Руставели, 12"
              className="field flex-1"
            />
            <button type="button" onClick={search} disabled={searching} className="btn-ghost h-12 shrink-0 px-4">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} {t.placeSearch}
            </button>
          </div>
          {notFound && <p className="mt-1 text-[13px] text-[#8a6a1f]">{t.placeNotFound}</p>}
          <p className="mt-3 text-[13px] text-muted">{t.placePin}</p>
          <div className="mt-2">
            <Map
              height={300}
              scrollZoom
              editable={{
                value: value.place_lat != null && value.place_lng != null ? [value.place_lat, value.place_lng] : null,
                onChange: pick,
                focus,
              }}
            />
          </div>
          {error && <p className="mt-1 text-[13px] text-danger">{error}</p>}
        </div>
      )}

      <label className="block">
        <span className="text-[14px] font-semibold">
          {t.workHours} <span className="font-normal text-muted">{getDict(lang).form.optional}</span>
        </span>
        <input value={value.work_hours} onChange={(e) => set({ work_hours: e.target.value })} maxLength={120} placeholder={t.workHoursPlaceholder} className="field mt-1.5" />
      </label>
    </fieldset>
  );
}
