"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { PRICE_MAX, type PriceItem } from "@/lib/price-list";

/*
 * Кабинет: прайс «услуга — цена от». Строки уходят в форму скрытым полем price_list (JSON).
 * На карточке в каталоге видны первые 3 строки — их можно поднять стрелками.
 */
const T = {
  ru: { title: "Прайс: услуги и цены", hint: "Добавьте 3–10 самых частых работ. Первые 3 строки клиенты видят прямо в карточке каталога — это главная причина написать именно вам.", name: "Услуга, например: Сборка шкафа", from: "от, ₾", add: "+ Добавить услугу", deal: "пусто — по договорённости", up: "Выше", del: "Удалить" },
  en: { title: "Price list: services and prices", hint: "Add your 3–10 most common jobs. Clients see the first 3 right on your catalog card.", name: "Service, e.g. Wardrobe assembly", from: "from, ₾", add: "+ Add a service", deal: "empty — negotiable", up: "Up", del: "Remove" },
  ka: { title: "ფასები: მომსახურება და ფასი", hint: "დაამატეთ 3–10 ყველაზე ხშირი სამუშაო. პირველ 3-ს კლიენტები კატალოგის ბარათზე ხედავენ.", name: "მომსახურება, მაგ.: კარადის აწყობა", from: "დან, ₾", add: "+ მომსახურების დამატება", deal: "ცარიელი — შეთანხმებით", up: "ზემოთ", del: "წაშლა" },
} as const;

type Row = { name: string; from: string };

export function PriceListEditor({ initial, lang }: { initial?: PriceItem[]; lang: Locale }) {
  const t = T[lang];
  const [rows, setRows] = useState<Row[]>(() => (initial?.length ? initial.map((x) => ({ name: x.name, from: x.from == null ? "" : String(x.from) })) : [{ name: "", from: "" }]));
  const value = rows.filter((r) => r.name.trim().length >= 2).map((r) => ({ name: r.name.trim(), from: r.from.trim() === "" ? null : Number(r.from) }));
  const set = (i: number, patch: Partial<Row>) => setRows((l) => l.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <fieldset>
      <legend className="text-[14px] font-semibold">{t.title}</legend>
      <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{t.hint}</p>
      <input type="hidden" name="price_list" value={JSON.stringify(value)} />
      <div className="mt-2.5 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className={`flex items-center gap-2 ${i < 3 ? "" : "opacity-90"}`}>
            <span className={`w-5 shrink-0 text-center text-[12px] font-bold ${i < 3 ? "text-brand" : "text-muted"}`}>{i + 1}</span>
            <input value={r.name} onChange={(e) => set(i, { name: e.target.value })} placeholder={t.name} maxLength={80} className="field min-w-0 grow" />
            <input value={r.from} onChange={(e) => set(i, { from: e.target.value.replace(/[^\d]/g, "") })} placeholder={t.from} inputMode="numeric" className="field w-24 shrink-0" title={t.deal} />
            <button type="button" onClick={() => i > 0 && setRows((l) => [...l.slice(0, i - 1), l[i], l[i - 1], ...l.slice(i + 1)])} disabled={i === 0} className="h-9 w-8 shrink-0 rounded-lg text-muted hover:bg-cream disabled:opacity-30" title={t.up} aria-label={t.up}>
              ↑
            </button>
            <button type="button" onClick={() => setRows((l) => (l.length > 1 ? l.filter((_, j) => j !== i) : [{ name: "", from: "" }]))} className="h-9 w-8 shrink-0 rounded-lg text-muted hover:bg-cream hover:text-danger" title={t.del} aria-label={t.del}>
              ✕
            </button>
          </div>
        ))}
      </div>
      {rows.length < PRICE_MAX && (
        <button type="button" onClick={() => setRows((l) => [...l, { name: "", from: "" }])} className="mt-2 text-[13.5px] font-semibold text-brand hover:underline">
          {t.add}
        </button>
      )}
    </fieldset>
  );
}
