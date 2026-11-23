"use client";

import { useState } from "react";

/** Калькулятор: рассрочка от застройщика (без процентов) или ипотека (аннуитет). Расчёт примерный. */
export function InstallmentCalc({ price: price0 }: { price?: number }) {
  const [mode, setMode] = useState<"inst" | "mort">("inst");
  const [price, setPrice] = useState(String(price0 ?? 60000));
  const [down, setDown] = useState("30");
  const [months, setMonths] = useState("24");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");
  const P = Number(price) || 0;
  const first = Math.round((P * Math.min(100, Number(down) || 0)) / 100);
  const rest = P - first;
  let monthly = 0, total = P;
  if (mode === "inst") {
    const n = Math.max(1, Number(months) || 1);
    monthly = rest / n;
  } else {
    const n = Math.max(1, (Number(years) || 1) * 12);
    const r = (Number(rate) || 0) / 100 / 12;
    monthly = r ? (rest * r) / (1 - Math.pow(1 + r, -n)) : rest / n;
    total = first + monthly * n;
  }
  const $ = (v: number) => "$" + Math.round(v).toLocaleString("ru-RU").replace(/,/g, " ");
  const f = "field h-10 w-full text-[14px]";
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex rounded-full bg-cream p-1 text-[13px] font-semibold">
        <button type="button" onClick={() => setMode("inst")} className={`flex-1 rounded-full py-1.5 ${mode === "inst" ? "bg-white shadow-sm" : ""}`}>Рассрочка</button>
        <button type="button" onClick={() => setMode("mort")} className={`flex-1 rounded-full py-1.5 ${mode === "mort" ? "bg-white shadow-sm" : ""}`}>Ипотека</button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] font-medium">
        <label className="col-span-2">Цена квартиры, $<input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={f} /></label>
        <label>Первый взнос, %<input value={down} onChange={(e) => setDown(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={f} /></label>
        {mode === "inst" ? (
          <label>Срок, месяцев<input value={months} onChange={(e) => setMonths(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={f} /></label>
        ) : (
          <>
            <label>Срок, лет<input value={years} onChange={(e) => setYears(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={f} /></label>
            <label className="col-span-2">Ставка банка, % годовых<input value={rate} onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className={f} /></label>
          </>
        )}
      </div>
      <div className="mt-3 rounded-xl bg-brand-soft p-3 text-[14px]">
        <p>Первый взнос: <b>{$(first)}</b></p>
        <p className="text-[17px]">В месяц: <b>{$(monthly)}</b></p>
        {mode === "mort" && <p className="text-[13px] text-[#3d5a4c]">Всего с процентами: {$(total)} · переплата {$(total - P)}</p>}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-muted">Расчёт примерный. {mode === "inst" ? "Рассрочка у застройщиков обычно без процентов, но условия у каждого свои." : "Ставку и условия уточняйте в банке."}</p>
    </div>
  );
}
