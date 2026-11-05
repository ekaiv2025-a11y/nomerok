"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Map, type MapPoint } from "./map/Map";
import { href } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { formatPhone } from "@/lib/phone";
import { placeAddr, placeCat, placeDesc, placeName, type Place } from "@/lib/places";

/*
 * Раздел мест: список и карта рядом. Номер на карточке = номер метки на карте.
 * Наведение на карточку подсвечивает метку, «На карте» — перемещает карту к месту; щелчок по метке — подсвечивает карточку.
 */

const T = {
  ru: { list: "Список", map: "Карта", call: "Позвонить", route: "Маршрут", onMap: "На карте", more: "Подробнее", noMap: "Без точки на карте" },
  en: { list: "List", map: "Map", call: "Call", route: "Directions", onMap: "On map", more: "Details", noMap: "Not on the map" },
  ka: { list: "სია", map: "რუკა", call: "დარეკვა", route: "მარშრუტი", onMap: "რუკაზე", more: "დეტალები", noMap: "რუკაზე არ არის" },
} as const;

// мягкие цвета для «аватарок» без фото — у каждого места свой, по названию
const TONES = ["#e7f2ec:#1f6b4f", "#fdf3dc:#7a5a10", "#e8eefc:#2f4f9a", "#fbe9ef:#9a2f55", "#eef7f9:#1e6878", "#f3ecfb:#5b3a91", "#fdeee6:#9a4a1f", "#eef3e4:#4f6a1f"];
function tone(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length].split(":");
}
function initials(name: string) {
  const w = name.replace(/[«»"'()]/g, "").split(/\s+/).filter(Boolean);
  return ((w[0]?.[0] ?? "") + (w[1]?.[0] ?? "")).toUpperCase() || "•";
}

export function PlacesBrowser({ items, lang }: { items: Place[]; lang: Locale }) {
  const t = T[lang];
  const [hover, setHover] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "map">("list");

  // номера только у мест с координатами — они же метки на карте
  const { points, numOf } = useMemo(() => {
    const points: MapPoint[] = [];
    const numOf = new globalThis.Map<string, number>();
    for (const p of items) {
      if (p.lat == null || p.lng == null) continue;
      numOf.set(p.id, points.length);
      points.push({ lat: p.lat, lng: p.lng, label: points.length + 1, title: placeName(p, lang), subtitle: p.sub ?? placeCat(p.cat).label[lang], href: href(lang, `/places/${p.slug}`), photo: p.photos?.[0] ?? null });
    }
    return { points, numOf };
  }, [items, lang]);

  const showOnMap = (i: number) => {
    setPicked(i);
    setView("map");
  };
  const select = (i: number) => {
    setPicked(i);
    const id = items.find((p) => numOf.get(p.id) === i)?.id;
    if (id && window.matchMedia("(min-width: 1024px)").matches) document.getElementById(`pl-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const active = hover ?? picked;

  return (
    <div className="mt-5">
      {points.length > 0 && (
        <div className="sticky top-[64px] z-10 -mx-4 mb-3 flex justify-center bg-[#f7f6f2]/90 px-4 py-2 backdrop-blur lg:hidden">
          <div className="inline-flex rounded-full border border-line bg-white p-1 text-[14px] font-semibold">
            {(["list", "map"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} className={`rounded-full px-5 py-1.5 ${view === v ? "bg-ink text-white" : "text-muted"}`}>
                {v === "list" ? `☰ ${t.list}` : `🗺 ${t.map} · ${points.length}`}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={`grid gap-5 ${points.length ? "lg:grid-cols-[minmax(0,1fr)_440px]" : ""}`}>
        <div className={`space-y-3 ${view === "map" ? "hidden lg:block" : ""}`}>
          {items.map((p) => {
            const i = numOf.get(p.id);
            const on = i != null && active === i;
            const name = placeName(p, lang);
            const addr = placeAddr(p, lang)?.replace(/^Батуми,\s*/, "");
            const desc = placeDesc(p, lang);
            const phone = p.phones?.[0];
            const [bg, fg] = tone(name);
            const route = p.lat != null && p.lng != null ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}` : addr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${addr}`)}` : null;
            const tags = lang === "ru" ? (p.tags ?? []).slice(0, 4) : [];
            return (
              <div
                key={p.id}
                id={`pl-${p.id}`}
                onMouseEnter={() => i != null && setHover(i)}
                onMouseLeave={() => setHover(null)}
                className={`flex gap-3.5 rounded-2xl border bg-white p-4 transition ${on ? "border-accent shadow-[0_6px_20px_rgba(224,165,38,0.18)]" : "border-line hover:border-[#cfcabd]"}`}
              >
                <Link href={href(lang, `/places/${p.slug}`)} className="relative shrink-0" tabIndex={-1} aria-hidden>
                  {p.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photos[0]} alt="" loading="lazy" className="h-14 w-14 rounded-xl bg-cream object-cover sm:h-[72px] sm:w-[72px]" />
                  ) : (
                    <span style={{ background: bg, color: fg }} className="flex h-14 w-14 items-center justify-center rounded-xl text-[18px] font-extrabold tracking-tight sm:h-[72px] sm:w-[72px] sm:text-[22px]">
                      {initials(name)}
                    </span>
                  )}
                  {i != null && <b className={`absolute -left-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white px-1 text-[11.5px] ${on ? "bg-accent text-ink" : "bg-brand text-white"}`}>{i + 1}</b>}
                </Link>
                <div className="min-w-0 grow">
                  <Link translate="no" href={href(lang, `/places/${p.slug}`)} className="notranslate block text-[16.5px] font-semibold leading-snug hover:text-brand">
                    {name}
                    {p.owner_verified_at && <span className="ml-1.5 text-[12px] font-medium text-brand">✓</span>}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {p.sub || placeCat(p.cat).label[lang]}
                    {addr ? ` · ${addr}` : ""}
                  </p>
                  {p.hours && <p className="mt-1 line-clamp-1 text-[12.5px] text-muted">🕒 {p.hours}</p>}
                  {tags.length > 0 && (
                    <p className="mt-1.5 flex flex-wrap gap-1">
                      {tags.map((x) => (
                        <span key={x} className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-muted">
                          {x}
                        </span>
                      ))}
                    </p>
                  )}
                  {desc && <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-[#3a3935]">{desc}</p>}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {phone && (
                      <a href={`tel:${phone}`} className="inline-flex h-8 items-center gap-1 rounded-full bg-brand px-3 text-[12.5px] font-semibold text-white hover:bg-brand-dark">
                        📞 {formatPhone(phone)}
                      </a>
                    )}
                    {route && (
                      <a href={route} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-full border border-line px-3 text-[12.5px] font-semibold hover:border-brand">
                        🧭 {t.route}
                      </a>
                    )}
                    {i != null && (
                      <button type="button" onClick={() => showOnMap(i)} className="inline-flex h-8 items-center gap-1 rounded-full border border-line px-3 text-[12.5px] font-semibold hover:border-brand">
                        📍 {t.onMap}
                      </button>
                    )}
                    <Link href={href(lang, `/places/${p.slug}`)} className="inline-flex h-8 items-center px-2 text-[12.5px] font-semibold text-brand hover:underline">
                      {t.more} →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {points.length > 0 && (
          <div className={`${view === "list" ? "hidden lg:block" : ""} lg:sticky lg:top-20 lg:self-start`}>
            <div className="hidden lg:block">
              <Map height={640} points={points} active={active} focus={picked} onSelect={select} />
            </div>
            <div className="lg:hidden">{view === "map" && <Map height={560} points={points} active={active} focus={picked} onSelect={(i) => setPicked(i)} />}</div>
            {view === "map" && picked != null && (
              <button type="button" onClick={() => setView("list")} className="mt-2 w-full rounded-full border border-line bg-white py-2 text-[13px] font-semibold lg:hidden">
                ☰ {t.list}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
