import type { Locale } from "./i18n/config";

/* Свободные окна: [{ d: "2026-10-04", t: "15:00" }]. Прошедшие не показываем. */
export type Slot = { d: string; t: string };

export function todayTbilisiStr(): string {
  return new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 10);
}

export function cleanSlots(raw: unknown): Slot[] {
  if (!Array.isArray(raw)) return [];
  const today = todayTbilisiStr();
  const out: Slot[] = [];
  for (const x of raw) {
    const d = String((x as Slot)?.d ?? "");
    const t = String((x as Slot)?.t ?? "").slice(0, 20);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d < today) continue;
    if (t && !/^([01]?\d|2[0-3]):[0-5]\d$/.test(t) && !/^(утро|день|вечер|morning|afternoon|evening|весь день|all day)$/i.test(t)) continue;
    if (!out.some((o) => o.d === d && o.t === t)) out.push({ d, t });
  }
  return out.sort((a, b) => (a.d + a.t).localeCompare(b.d + b.t)).slice(0, 12);
}

const LOC: Record<Locale, string> = { ru: "ru-RU", en: "en-GB", ka: "ka-GE" };
const WORDS = { ru: ["сегодня", "завтра"], en: ["today", "tomorrow"], ka: ["დღეს", "ხვალ"] } as const;

export function slotDay(d: string, lang: Locale): string {
  const today = todayTbilisiStr();
  const tomorrow = new Date(Date.parse(today) + 86400000).toISOString().slice(0, 10);
  if (d === today) return WORDS[lang][0];
  if (d === tomorrow) return WORDS[lang][1];
  return new Date(d + "T12:00:00Z").toLocaleDateString(LOC[lang], { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export function slotLabel(s: Slot, lang: Locale): string {
  return `${slotDay(s.d, lang)}${s.t ? `, ${s.t}` : ""}`;
}

export const SLOT_TEXT = {
  ru: { badge: "Есть окно", title: "Свободные окна", book: "Записаться", empty: "Окон пока нет", edTitle: "Свободные окна", edHint: "Отметьте, когда вы свободны, — на карточке появится «🗓 Есть окно сегодня». Прошедшие окна исчезают сами.", add: "Добавить", time: "Время (необязательно)", saved: "Сохранено ✓", save: "Сохранить", clear: "Очистить всё" },
  en: { badge: "Free slot", title: "Free slots", book: "Book", empty: "No free slots yet", edTitle: "Free slots", edHint: "Mark when you're free — your card will show “🗓 Free slot today”. Past slots disappear automatically.", add: "Add", time: "Time (optional)", saved: "Saved ✓", save: "Save", clear: "Clear all" },
  ka: { badge: "თავისუფალია", title: "თავისუფალი დრო", book: "ჩაწერა", empty: "თავისუფალი დრო ჯერ არ არის", edTitle: "თავისუფალი დრო", edHint: "მონიშნეთ, როდის ხართ თავისუფალი — ბარათზე გამოჩნდება „🗓 თავისუფალია დღეს“.", add: "დამატება", time: "დრო (არასავალდებულო)", saved: "შენახულია ✓", save: "შენახვა", clear: "გასუფთავება" },
} as const;
