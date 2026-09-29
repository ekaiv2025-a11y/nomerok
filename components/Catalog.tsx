"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { List, Map as MapIcon, Search, X } from "lucide-react";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { Map, type MapPoint } from "./map/Map";
import { getDict, href, type Locale } from "@/lib/i18n";
import type { PublicMaster } from "@/lib/types";
import { MasterCard } from "./MasterCard";
import { useRouter } from "next/navigation";
import { CITIES, type CityId } from "@/lib/cities";
import { MapPin } from "lucide-react";

export function Catalog({ masters: all, lang, city }: { masters: PublicMaster[]; lang: Locale; city: CityId }) {
  const t = getDict(lang).catalog;
  const router = useRouter();
  // Город: показываем специалистов выбранного города; в списке — Батуми и города, где уже кто-то есть
  const masters = useMemo(() => all.filter((m) => (m.city ?? "batumi") === city), [all, city]);
  const cityCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const m of all) c[m.city ?? "batumi"] = (c[m.city ?? "batumi"] ?? 0) + 1;
    return c;
  }, [all]);
  const cities = CITIES.filter((c) => c.id === "batumi" || c.id === city || cityCounts[c.id]);
  const [cat, setCat] = useState<string>("all");
  // Ссылка вида nomerok.ge/ru?cat=plumber сразу открывает нужное направление (удобно для баннеров и чатов)
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("cat");
    if (c && CATEGORIES.some((x) => x.id === c)) {
      setCat(c);
      document.getElementById("masters")?.scrollIntoView({ block: "start" });
    }
  }, []);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "map">("list");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const m of masters) for (const id of new Set([m.category, ...(m.extra_categories ?? [])])) c[id] = (c[id] ?? 0) + 1;
    return c;
  }, [masters]);

  const visibleCats = CATEGORIES.filter((c) => counts[c.id]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return masters.filter((m) => {
      if (cat !== "all" && m.category !== cat && !(m.extra_categories ?? []).includes(cat)) return false;
      if (!query) return true;
      // Ищем по названию категории на всех трёх языках — человек может писать на любом
      const catNames = [m.category, ...(m.extra_categories ?? [])].flatMap((id) => ["ru", "ka", "en"].map((l) => categoryLabel(id, l as Locale))).join(" ");
      const hay = `${m.name} ${m.services} ${m.about} ${catNames}`.toLowerCase();
      return query.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [masters, cat, q]);

  const mapPoints: MapPoint[] = filtered
    .filter((m) => m.place_lat != null && m.place_lng != null && (m.work_mode === "at_place" || m.work_mode === "both"))
    .map((m) => ({
      lat: m.place_lat!,
      lng: m.place_lng!,
      title: m.name,
      subtitle: `${categoryLabel(m.category, lang)}${m.place_address ? " · " + m.place_address : ""}`,
      href: href(lang, `/master/${m.slug}`),
      photo: m.photo_url,
    }));
  const requestHref = href(lang, `/request?${new URLSearchParams({ ...(cat !== "all" ? { category: cat } : {}), ...(city !== "batumi" ? { city } : {}) }).toString()}`);

  return (
    <section id="masters" className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex h-12 items-center rounded-full border-2 border-line bg-white pl-4 pr-1.5 focus-within:border-brand">
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] outline-none sm:text-[15px]"
          aria-label={t.searchAria}
        />
        {q && (
          <button onClick={() => setQ("")} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream" aria-label={t.clear}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {cities.length > 1 && (
        <label className="mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white pl-3.5 pr-2 text-[14px] font-semibold">
          <MapPin className="h-4 w-4 text-brand" aria-hidden />
          <select
            value={city}
            onChange={(e) => router.push(e.target.value === "batumi" ? `/${lang}#masters` : `/${lang}?city=${e.target.value}#masters`)}
            className="h-full bg-transparent pr-1 outline-none"
            aria-label="City"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label[lang]}
                {cityCounts[c.id] ? ` · ${cityCounts[c.id]}` : ""}
              </option>
            ))}
          </select>
        </label>
      )}

      {visibleCats.length > 1 && (
        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" style={{ scrollbarWidth: "none" }}>
          <Chip active={cat === "all"} onClick={() => setCat("all")}>
            {t.all} · {masters.length}
          </Chip>
          {visibleCats.map((c) => (
            <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              {c.plural[lang]} · {counts[c.id]}
            </Chip>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-1 rounded-full bg-cream p-1 text-[13px] font-medium sm:w-fit">
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full px-4 sm:flex-none ${view === v ? "bg-white shadow-sm" : "text-muted hover:text-ink"}`}
          >
            {v === "list" ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            {v === "list" ? t.viewList : t.viewMap}
          </button>
        ))}
      </div>

      {view === "map" ? (
        <div className="mt-4">
          {mapPoints.length > 0 ? (
            <>
              <Map height={480} points={mapPoints} />
              <p className="mt-2 text-[13px] text-muted">{t.mapNote}</p>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-cream px-5 py-10 text-center text-[15px] text-muted">{t.mapEmpty}</div>
          )}
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {filtered.map((m) => (
            <MasterCard key={m.id} m={m} lang={lang} />
          ))}
          <Link href={requestHref} className="col-span-2 flex flex-col justify-center rounded-2xl border border-dashed border-brand/40 bg-brand-soft p-5 sm:col-span-1 transition hover:border-brand">
            <p className="font-semibold text-brand-dark">{t.notFoundTitle}</p>
            <p className="mt-1 text-[14px] text-[#3d5a4c]">{t.notFoundText}</p>
            <span className="mt-3 text-[14px] font-semibold text-brand">{t.notFoundCta}</span>
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-cream px-5 py-10 text-center">
          <p className="font-semibold">{masters.length === 0 ? t.emptyFirst : t.emptyQuery}</p>
          <p className="mx-auto mt-1 max-w-md text-[14px] text-muted">{t.emptyHint}</p>
          <Link href={requestHref} className="btn-primary mt-5">
            {t.leaveRequest}
          </Link>
        </div>
      )}
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-[13px] font-medium transition-colors ${
        active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
