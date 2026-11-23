"use client";

import { useState } from "react";

/** «🔔 Сообщать о новых квартирах»: фильтр → ссылка на бота; после «Старт» раз в день приходят новые квартиры. */
export function AlertButton({ project, city, defaultDeal, label = "🔔 Сообщать о новых квартирах" }: { project?: string; city?: string; defaultDeal?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState("");
  const [max, setMax] = useState("");
  const [deal, setDeal] = useState(defaultDeal && ["sale", "rent", "daily", "pledge"].includes(defaultDeal) ? defaultDeal : "sale");
  const [state, setState] = useState<"" | "busy" | "done">("");
  const [err, setErr] = useState("");
  async function go() {
    setState("busy");
    setErr("");
    // окно открываем сразу (иначе телефон заблокирует всплывающее окно), адрес подставим после ответа
    const w = window.open("", "_blank");
    const r = await fetch("/api/realty/alert", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ project, city, rooms, max_price: max, deal: project ? "sale" : deal }) })
      .then((x) => x.json())
      .catch(() => null);
    if (!r?.ok) {
      w?.close();
      setErr(r?.error ?? "Не получилось. Попробуйте ещё раз.");
      setState("");
      return;
    }
    if (w) w.location.href = r.link;
    else location.href = r.link;
    setState("done");
  }
  if (state === "done")
    return <p className="rounded-2xl bg-brand-soft p-3 text-[14px] text-brand-dark">Откройте Telegram и нажмите «Старт» — подписка включится. Новые квартиры будут приходить раз в день, отписаться можно командой /alerts.</p>;
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost h-10 px-4 text-[14px]">
        {label}
      </button>
    );
  return (
    <div className="rounded-2xl border border-line bg-white p-3">
      <p className="text-[14px] font-semibold">Какие квартиры присылать?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {!project && (
          <select value={deal} onChange={(e) => setDeal(e.target.value)} className="field h-10 w-auto text-[14px]">
            <option value="sale">Купить</option>
            <option value="rent">Снять (помесячно)</option>
            <option value="daily">Снять посуточно</option>
            <option value="pledge">Под залог</option>
          </select>
        )}
        <select value={rooms} onChange={(e) => setRooms(e.target.value)} className="field h-10 w-auto text-[14px]">
          <option value="">Любые</option>
          <option value="0">Студии</option>
          <option value="1">1 спальня</option>
          <option value="2">2 спальни</option>
          <option value="3">3 спальни</option>
          <option value="4">4+ спальни</option>
        </select>
        <input value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={deal === "sale" || project ? "Цена до, $" : "Цена до"} className="field h-10 w-32 text-[14px]" />
        <button type="button" disabled={state === "busy"} onClick={go} className="btn h-10 rounded-full bg-[#229ED9] px-4 text-[14px] font-semibold text-white hover:bg-[#1c89bd]">
          Подписаться в Telegram
        </button>
      </div>
      {err && <p className="mt-1 text-[13px] text-danger">{err}</p>}
    </div>
  );
}
