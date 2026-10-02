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
import { SUBCATS, subcatLabel, subcatsOf } from "@/lib/subcats";
import { detectIntent } from "@/lib/search-intent";

const F = {
  ru: { where: "Где", any: "Любой формат", atClient: "Выезд к клиенту", atPlace: "Принимает у себя", online: "Онлайн", lang: "Любой язык", price: "С ценой", sort: "По умолчанию", reviews: "С отзывами", cheap: "Сначала дешевле", reset: "Сбросить" },
  en: { where: "Where", any: "Any format", atClient: "Comes to you", atPlace: "At their place", online: "Online", lang: "Any language", price: "With price", sort: "Default", reviews: "With reviews", cheap: "Cheapest first", reset: "Reset" },
  ka: { where: "სად", any: "ნებისმიერი", atClient: "გამოძახებით", atPlace: "თავისთან", online: "ონლაინ", lang: "ნებისმიერი ენა", price: "ფასით", sort: "ნაგულისხმევი", reviews: "შეფასებებით", cheap: "ჯერ იაფი", reset: "გასუფთავება" },
} as const;
const LANG_OPTS: [string, string][] = [["Грузинский", "ქართ. / KA"], ["Русский", "Рус. / RU"], ["Английский", "Eng / EN"], ["Украинский", "Укр. / UA"], ["Турецкий", "Türk / TR"]];

const INTENT_HINT = { ru: "Похоже, вам нужен:", en: "Looks like you need:", ka: "როგორც ჩანს, გჭირდებათ:" } as const;

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
  const [sub, setSub] = useState<string>("all");
  const chooseCat = (c: string, sb = "all") => {
    setCat(c);
    setSub(sb);
  };
  const [q, setQ] = useState("");
  const [fMode, setFMode] = useState("");
  const [fLang, setFLang] = useState("");
  const [fPrice, setFPrice] = useState(false);
  const [sort, setSort] = useState("");
  const [view, setView] = useState<"list" | "map">("list");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const m of masters) for (const id of new Set([m.category, ...(m.extra_categories ?? [])])) c[id] = (c[id] ?? 0) + 1;
    return c;
  }, [masters]);

  const visibleCats = CATEGORIES.filter((c) => counts[c.id]);

  const intents = useMemo(() => detectIntent(q), [q]);
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    // Запрос понятен по смыслу («течёт кран» → сантехник) — показываем специалистов этого направления
    const byIntent = (m: PublicMaster) =>
      intents.some((it) => (m.category === it.cat || (m.extra_categories ?? []).includes(it.cat)) && (!it.sub || subcatsOf(m, it.cat).includes(it.sub)));
    const list = masters.filter((m) => {
      if (fMode === "at_client" && !(m.work_mode === "at_client" || m.work_mode === "both")) return false;
      if (fMode === "at_place" && !(m.work_mode === "at_place" || m.work_mode === "both")) return false;
      if (fMode === "online" && m.work_mode !== "online") return false;
      if (fLang && !(m.languages ?? []).includes(fLang)) return false;
      if (fPrice && m.price_from == null) return false;
      if (cat !== "all" && m.category !== cat && !(m.extra_categories ?? []).includes(cat)) return false;
      if (cat !== "all" && sub !== "all" && !subcatsOf(m, cat).includes(sub)) return false;
      if (!query) return true;
      // Ищем по названию категории на всех трёх языках — человек может писать на любом
      const catNames = [m.category, ...(m.extra_categories ?? [])].flatMap((id) => ["ru", "ka", "en"].map((l) => categoryLabel(id, l as Locale))).join(" ");
      const subNames = [m.category, ...(m.extra_categories ?? [])].flatMap((c) => subcatsOf(m, c).flatMap((id) => (["ru", "ka", "en"] as Locale[]).map((l) => subcatLabel(c, id, l)))).join(" ");
      const hay = `${m.name} ${m.services} ${m.about} ${catNames} ${subNames}`.toLowerCase();
      return byIntent(m) || query.split(/\s+/).every((w) => hay.includes(w));
    });
    if (sort === "reviews") return [...list].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0) || (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "cheap") return [...list].sort((a, b) => (a.price_from ?? 1e9) - (b.price_from ?? 1e9));
    return list;
  }, [masters, cat, sub, q, intents, fMode, fLang, fPrice, sort]);
  const ft = F[lang];
  const anyFilter = !!(fMode || fLang || fPrice || sort);

  // Уточнения внутри направления (например, «Красота» → парикмахер, маникюр…)
  const subCounts = useMemo(() => {
    const c: Record<string, number> = {};
    if (cat === "all" || !SUBCATS[cat]) return c;
    for (const m of masters) for (const s of subcatsOf(m, cat)) c[s] = (c[s] ?? 0) + 1;
    return c;
  }, [masters, cat]);
  const visibleSubs = cat !== "all" ? (SUBCATS[cat] ?? []).filter((s) => subCounts[s.id]) : [];

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

      {intents.length > 0 && (
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
          {INTENT_HINT[lang]}
          {intents.map((it) => (
            <button
              key={it.cat + (it.sub ?? "")}
              type="button"
              onClick={() => {
                setQ("");
                chooseCat(it.cat, it.sub ?? "all");
              }}
              className="rounded-full bg-brand-soft px-2.5 py-0.5 font-semibold text-brand-dark hover:bg-[#d6eadf]"
            >
              {it.sub ? subcatLabel(it.cat, it.sub, lang) : categoryLabel(it.cat, lang)}
            </button>
          ))}
        </p>
      )}

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
          <Chip active={cat === "all"} onClick={() => chooseCat("all")}>
            {t.all} · {masters.length}
          </Chip>
          {visibleCats.map((c) => (
            <Chip key={c.id} active={cat === c.id} onClick={() => chooseCat(c.id)}>
              {c.plural[lang]} · {counts[c.id]}
            </Chip>
          ))}
        </div>
      )}

      {visibleSubs.length > 1 && (
        <div className="-mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" style={{ scrollbarWidth: "none" }}>
          <SubChip active={sub === "all"} onClick={() => setSub("all")}>
            {t.all}
          </SubChip>
          {visibleSubs.map((s) => (
            <SubChip key={s.id} active={sub === s.id} onClick={() => setSub(s.id)}>
              {s.label[lang]} · {subCounts[s.id]}
            </SubChip>
          ))}
        </div>
      )}

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" style={{ scrollbarWidth: "none" }}>
        <select value={fMode} onChange={(e) => setFMode(e.target.value)} className={`h-9 rounded-full border bg-white px-3 text-[13px] outline-none ${fMode ? "border-brand text-brand-dark" : "border-line"}`} aria-label={ft.where}>
          <option value="">{ft.any}</option>
          <option value="at_client">{ft.atClient}</option>
          <option value="at_place">{ft.atPlace}</option>
          <option value="online">{ft.online}</option>
        </select>
        <select value={fLang} onChange={(e) => setFLang(e.target.value)} className={`h-9 rounded-full border bg-white px-3 text-[13px] outline-none ${fLang ? "border-brand text-brand-dark" : "border-line"}`}>
          <option value="">{ft.lang}</option>
          {LANG_OPTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setFPrice((v) => !v)} className={`h-9 shrink-0 whitespace-nowrap rounded-full border px-3 text-[13px] ${fPrice ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white"}`}>
          {fPrice ? "✓ " : ""}{ft.price}
        </button>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={`h-9 rounded-full border bg-white px-3 text-[13px] outline-none ${sort ? "border-brand text-brand-dark" : "border-line"}`}>
          <option value="">↕ {ft.sort}</option>
          <option value="reviews">⭐ {ft.reviews}</option>
          <option value="cheap">₾ {ft.cheap}</option>
        </select>
        {anyFilter && (
          <button type="button" onClick={() => { setFMode(""); setFLang(""); setFPrice(false); setSort(""); }} className="h-9 shrink-0 whitespace-nowrap px-2 text-[13px] text-muted underline">
            {ft.reset}
          </button>
        )}
      </div>

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

function SubChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-8 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-colors ${
        active ? "bg-brand text-white" : "bg-brand-soft text-brand-dark hover:bg-[#d6eadf]"
      }`}
    >
      {children}
    </button>
  );
}
