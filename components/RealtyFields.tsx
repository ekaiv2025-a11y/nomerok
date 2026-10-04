"use client";

import type { Locale } from "@/lib/i18n/config";
import { DISTRICTS } from "@/lib/districts";

/*
 * Заявка риелторам: вместо «что случилось» — понятные поля (снять/купить, комнаты, бюджет, район, срок).
 * Всё собирается в одну строку в начале текста заявки — так её сразу понимают и в Telegram, и в ленте.
 */

export type Realty = { deal: string; rooms: string; budget: string; district: string; term: string };
export const EMPTY_REALTY: Realty = { deal: "", rooms: "", budget: "", district: "", term: "" };

const T = {
  ru: {
    realty: "Недвижимость",
    deal: "Что нужно",
    deals: { rent: "Снять", buy: "Купить", sell: "Продать", let: "Сдать" },
    rooms: "Размер",
    roomsList: { studio: "Студия", "1": "1 спальня", "2": "2 спальни", "3": "3+ спальни", house: "Дом" },
    any: "Не важно",
    budget: "Бюджет",
    budgetPh: "Например: до 600 $ в месяц",
    district: "Район",
    term: "Срок аренды",
    terms: { long: "Долгосрочно", months: "Несколько месяцев", daily: "Посуточно" },
    notesLabel: "Пожелания",
    notesPh: "Например: у моря, с ремонтом, можно с животными, въезд с 1 ноября.",
    needDeal: "Выберите, что нужно: снять, купить, продать или сдать",
  },
  en: {
    realty: "Property",
    deal: "I want to",
    deals: { rent: "Rent", buy: "Buy", sell: "Sell", let: "Let out" },
    rooms: "Size",
    roomsList: { studio: "Studio", "1": "1 bedroom", "2": "2 bedrooms", "3": "3+ bedrooms", house: "House" },
    any: "Any",
    budget: "Budget",
    budgetPh: "E.g.: up to $600 a month",
    district: "Area",
    term: "Rental term",
    terms: { long: "Long-term", months: "A few months", daily: "Daily" },
    notesLabel: "Wishes",
    notesPh: "E.g.: near the sea, renovated, pets allowed, move in from 1 November.",
    needDeal: "Choose what you need: rent, buy, sell or let out",
  },
  ka: {
    realty: "უძრავი ქონება",
    deal: "რა გჭირდებათ",
    deals: { rent: "ქირაობა", buy: "ყიდვა", sell: "გაყიდვა", let: "გაქირავება" },
    rooms: "ზომა",
    roomsList: { studio: "სტუდიო", "1": "1 საძინებელი", "2": "2 საძინებელი", "3": "3+ საძინებელი", house: "სახლი" },
    any: "არ აქვს მნიშვნელობა",
    budget: "ბიუჯეტი",
    budgetPh: "მაგ.: თვეში 600 $-მდე",
    district: "უბანი",
    term: "ქირის ვადა",
    terms: { long: "გრძელვადიანი", months: "რამდენიმე თვე", daily: "დღიურად" },
    notesLabel: "სურვილები",
    notesPh: "მაგ.: ზღვასთან, რემონტით, შინაური ცხოველით, 1 ნოემბრიდან.",
    needDeal: "აირჩიეთ: ქირაობა, ყიდვა, გაყიდვა ან გაქირავება",
  },
} as const;

export function realtyText(lang: Locale) {
  return T[lang];
}

/** Строка для начала текста заявки: «🏠 Снять · 2 спальни · Бюджет: до 600 $ · Район: Новый бульвар · Срок: долгосрочно» */
export function realtySummary(r: Realty, lang: Locale): string {
  const t = T[lang];
  if (!r.deal) return "";
  const parts: string[] = [`🏠 ${t.realty}: ${t.deals[r.deal as keyof typeof t.deals].toLowerCase()}`];
  if (r.rooms) parts.push(t.roomsList[r.rooms as keyof typeof t.roomsList]);
  if (r.budget.trim()) parts.push(`${t.budget}: ${r.budget.trim()}`);
  const d = DISTRICTS.find((x) => x.id === r.district);
  if (d) parts.push(`${t.district}: ${d.name[lang]}`);
  if ((r.deal === "rent" || r.deal === "let") && r.term) parts.push(`${t.term}: ${t.terms[r.term as keyof typeof t.terms].toLowerCase()}`);
  return parts.join(" · ");
}

const chip = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-[14px] font-medium transition ${on ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"}`;

export function RealtyFields({ lang, value, onChange, error }: { lang: Locale; value: Realty; onChange: (r: Realty) => void; error?: string }) {
  const t = T[lang];
  const set = (k: keyof Realty, v: string) => onChange({ ...value, [k]: value[k] === v && k !== "budget" ? "" : v });
  return (
    <div className="space-y-4 rounded-2xl bg-cream p-4">
      <div>
        <p className="text-[14px] font-semibold">{t.deal}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(t.deals) as (keyof typeof t.deals)[]).map((k) => (
            <button key={k} type="button" onClick={() => set("deal", k)} className={chip(value.deal === k)}>
              {t.deals[k]}
            </button>
          ))}
        </div>
        {error && <p className="mt-1 text-[13px] text-danger">{error}</p>}
      </div>
      <div>
        <p className="text-[14px] font-semibold">{t.rooms}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(t.roomsList) as (keyof typeof t.roomsList)[]).map((k) => (
            <button key={k} type="button" onClick={() => set("rooms", k)} className={chip(value.rooms === k)}>
              {t.roomsList[k]}
            </button>
          ))}
        </div>
      </div>
      {(value.deal === "rent" || value.deal === "let") && (
        <div>
          <p className="text-[14px] font-semibold">{t.term}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(t.terms) as (keyof typeof t.terms)[]).map((k) => (
              <button key={k} type="button" onClick={() => set("term", k)} className={chip(value.term === k)}>
                {t.terms[k]}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[14px] font-semibold">{t.budget}</span>
          <input value={value.budget} onChange={(e) => onChange({ ...value, budget: e.target.value.slice(0, 60) })} placeholder={t.budgetPh} className="field mt-1.5" />
        </label>
        <label className="block">
          <span className="text-[14px] font-semibold">{t.district}</span>
          <select value={value.district} onChange={(e) => onChange({ ...value, district: e.target.value })} className="field mt-1.5">
            <option value="">{t.any}</option>
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name[lang]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
