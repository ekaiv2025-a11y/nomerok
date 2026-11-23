"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { UNIT_STATUS, roomsLabel, type DevUnit } from "@/lib/dev-projects";
import { fmtMoney } from "@/lib/projects";
import { DevLeadForm } from "./DevLeadForm";

/*
 * Квартиры ЖК на сайте: фильтры (спальни, цена, площадь, этаж), список с планировками и «шахматка» по этажам.
 * Нажали на квартиру — карточка с планировкой и кнопкой «Узнать про эту квартиру» (заявка уходит застройщику).
 */
const perM2 = (u: DevUnit) => (u.price && u.area ? Math.round(u.price / u.area) : null);
const money = (u: DevUnit) => (u.price ? fmtMoney(u.price, u.currency) : "цена по запросу");

export function UnitsBrowser({ units, project, projectName }: { units: DevUnit[]; project: string; projectName: string }) {
  const [view, setView] = useState<"list" | "grid">("list");
  const [rooms, setRooms] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [minFloor, setMinFloor] = useState("");
  const [onlyFree, setOnlyFree] = useState(true);
  const [sort, setSort] = useState<"price" | "area" | "floor">("price");
  const [open, setOpen] = useState<DevUnit | null>(null);
  const [limit, setLimit] = useState(24);
  const buildings = [...new Set(units.map((u) => u.building))].sort();
  const [bld, setBld] = useState(buildings[0] ?? "");
  const roomOpts = [...new Set(units.map((u) => u.rooms).filter((r): r is number => r != null))].sort((a, b) => a - b);

  const match = (u: DevUnit) =>
    (!onlyFree || u.status === "free") &&
    (rooms == null || u.rooms === rooms) &&
    (!maxPrice || (u.price != null && u.price <= Number(maxPrice))) &&
    (!minArea || (u.area != null && u.area >= Number(minArea))) &&
    (!minFloor || (u.floor != null && u.floor >= Number(minFloor)));
  const list = useMemo(
    () =>
      units
        .filter(match)
        .sort((a, b) => (sort === "price" ? (a.price ?? 1e12) - (b.price ?? 1e12) : sort === "area" ? (b.area ?? 0) - (a.area ?? 0) : (b.floor ?? 0) - (a.floor ?? 0))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [units, rooms, maxPrice, minArea, minFloor, onlyFree, sort],
  );
  const free = units.filter((u) => u.status === "free").length;

  // шахматка выбранного корпуса: этажи сверху вниз
  const floors = useMemo(() => {
    const m = new Map<number, DevUnit[]>();
    for (const u of units.filter((x) => x.building === bld)) {
      const f = u.floor ?? 0;
      m.set(f, [...(m.get(f) ?? []), u]);
    }
    return [...m.entries()].sort((a, b) => b[0] - a[0]).map(([f, us]) => [f, us.sort((a, b) => a.number.localeCompare(b.number, "ru", { numeric: true }))] as const);
  }, [units, bld]);

  const chip = (on: boolean) => `whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-semibold ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`;
  return (
    <div>
      <p className="text-[14px] text-muted">
        Свободно <b className="text-ink">{free}</b> из {units.length} · данные застройщика, обновляются в кабинете
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setRooms(null)} className={chip(rooms == null)}>Все</button>
        {roomOpts.map((r) => (
          <button key={r} type="button" onClick={() => setRooms(r)} className={chip(rooms === r)}>
            {roomsLabel(r)}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Цена до, $" className="field h-10 w-32 text-[14px]" />
        <input value={minArea} onChange={(e) => setMinArea(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="Площадь от, м²" className="field h-10 w-36 text-[14px]" />
        <input value={minFloor} onChange={(e) => setMinFloor(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Этаж от" className="field h-10 w-24 text-[14px]" />
        <label className="flex items-center gap-1.5 text-[13px]">
          <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} className="accent-[#1f6b4f]" /> только свободные
        </label>
        <span className="ml-auto flex rounded-full bg-cream p-1">
          <button type="button" onClick={() => setView("list")} className={`rounded-full px-3 py-1 text-[13px] font-semibold ${view === "list" ? "bg-white shadow-sm" : ""}`}>Списком</button>
          <button type="button" onClick={() => setView("grid")} className={`rounded-full px-3 py-1 text-[13px] font-semibold ${view === "grid" ? "bg-white shadow-sm" : ""}`}>По этажам</button>
        </span>
      </div>

      {view === "list" ? (
        <>
          <div className="mt-3 flex items-center gap-2 text-[13px] text-muted">
            Найдено: {list.length}
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="ml-auto h-8 rounded-full border border-line bg-white px-2 text-[13px]">
              <option value="price">Сначала дешевле</option>
              <option value="area">Сначала больше</option>
              <option value="floor">Сначала выше</option>
            </select>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {list.slice(0, limit).map((u) => (
              <button key={u.id} type="button" onClick={() => setOpen(u)} className="overflow-hidden rounded-2xl border border-line bg-white text-left transition hover:border-brand">
                {u.plan_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.plan_url} alt={`Планировка: ${roomsLabel(u.rooms)}, ${u.area ?? ""} м²`} loading="lazy" className="aspect-[4/3] w-full bg-white object-contain p-2" />
                ) : (
                  <span className="flex aspect-[4/3] w-full items-center justify-center bg-cream text-[13px] text-muted">планировка по запросу</span>
                )}
                <span className="block p-3">
                  <span className="block text-[15px] font-bold">{money(u)}</span>
                  <span className="block text-[13px] text-[#3a3935]">
                    {roomsLabel(u.rooms)}
                    {u.area ? ` · ${u.area} м²` : ""}
                  </span>
                  <span className="block text-[12px] text-muted">
                    {u.floor != null ? `${u.floor} этаж` : ""}
                    {u.building ? ` · корпус ${u.building}` : ""}
                    {perM2(u) ? ` · ${fmtMoney(perM2(u)!, u.currency)}/м²` : ""}
                  </span>
                  {u.status !== "free" && <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${UNIT_STATUS[u.status].cls}`}>{UNIT_STATUS[u.status].label}</span>}
                </span>
              </button>
            ))}
          </div>
          {list.length > limit && (
            <button type="button" onClick={() => setLimit((l) => l + 24)} className="btn-ghost mt-3 h-11 w-full text-[14px]">
              Показать ещё ({list.length - limit})
            </button>
          )}
          {!list.length && <p className="mt-3 rounded-2xl bg-cream p-5 text-center text-[14px]">По этим условиям квартир нет — ослабьте фильтр или оставьте заявку ниже.</p>}
        </>
      ) : (
        <div className="mt-3">
          {buildings.length > 1 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {buildings.map((b) => (
                <button key={b} type="button" onClick={() => setBld(b)} className={chip(bld === b)}>
                  Корпус {b || "—"}
                </button>
              ))}
            </div>
          )}
          <div className="mb-2 flex flex-wrap gap-3 text-[12px] text-muted">
            {(["free", "reserved", "sold"] as const).map((s) => (
              <span key={s} className="flex items-center gap-1">
                <span className={`h-3 w-3 rounded ${UNIT_STATUS[s].dot}`} /> {UNIT_STATUS[s].label}
              </span>
            ))}
            <span>· подходит под фильтр — с рамкой</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white p-2">
            {floors.map(([f, us]) => (
              <div key={f} className="flex items-center gap-1 py-0.5">
                <span className="w-8 shrink-0 text-right text-[11px] text-muted">{f}</span>
                {us.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setOpen(u)}
                    title={`${u.number} · ${roomsLabel(u.rooms)} · ${u.area ?? "?"} м² · ${money(u)} · ${UNIT_STATUS[u.status].label}`}
                    className={`h-7 min-w-[34px] shrink-0 rounded px-1 text-[10px] font-semibold ${u.status === "free" ? "bg-brand text-white" : u.status === "reserved" ? "bg-accent text-ink" : "bg-[#e7e3da] text-muted"} ${match({ ...u, status: "free" }) && (rooms != null || maxPrice || minArea || minFloor) ? "ring-2 ring-ink ring-offset-1" : ""}`}
                  >
                    {u.rooms === 0 ? "С" : u.rooms ?? "·"}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-1 text-[12px] text-muted">В клетке — число спален (С — студия). Нажмите, чтобы открыть квартиру.</p>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={() => setOpen(null)}>
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="grow">
                <p className="text-[20px] font-bold">{money(open)}</p>
                <p className="text-[14px] text-[#3a3935]">
                  {roomsLabel(open.rooms)}
                  {open.area ? ` · ${open.area} м²` : ""}
                  {perM2(open) ? ` · ${fmtMoney(perM2(open)!, open.currency)}/м²` : ""}
                </p>
                <p className="text-[13px] text-muted">
                  {[open.building && `корпус ${open.building}`, open.floor != null && `${open.floor} этаж`, open.number && `кв. ${open.number}`].filter(Boolean).join(" · ")}
                </p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[12px] font-semibold ${UNIT_STATUS[open.status].cls}`}>{UNIT_STATUS[open.status].label}</span>
              </div>
              <button type="button" onClick={() => setOpen(null)} className="rounded-full p-2 hover:bg-cream" aria-label="Закрыть">
                <X className="h-5 w-5" />
              </button>
            </div>
            {open.plan_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={open.plan_url} alt="Планировка" className="mt-3 max-h-[50vh] w-full rounded-xl border border-line bg-white object-contain" />
            )}
            <p className="mt-4 font-semibold">Узнать про эту квартиру</p>
            <p className="text-[13px] text-muted">Заявка уйдёт в отдел продаж {projectName}.</p>
            <div className="mt-3">
              <DevLeadForm project={project} unit={open.id} compact />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
