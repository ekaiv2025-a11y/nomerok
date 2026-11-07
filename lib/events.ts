/* Афиша: типы и подписи (можно и на сервере, и в браузере). */
import type { Locale } from "./i18n/config";

export type EventKind = "concert" | "theatre" | "kids" | "festival" | "exhibition" | "party" | "games" | "sport" | "talk" | "other";
export type CityEvent = {
  id: string;
  slug: string;
  title: string;
  city: string;
  kind: EventKind;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  address: string | null;
  price: string | null;
  url: string | null;
  image: string | null;
  description: string | null;
  source: string | null;
  status: "published" | "pending" | "rejected";
  contact?: string | null;
  /** организатор — специалист из каталога (0051) */
  master_id?: string | null;
  created_at: string;
  updated_at: string;
};

export const EVENT_KINDS: { id: EventKind; emoji: string; label: Record<Locale, string> }[] = [
  { id: "concert", emoji: "🎵", label: { ru: "Концерты", en: "Concerts", ka: "კონცერტები" } },
  { id: "theatre", emoji: "🎭", label: { ru: "Театр", en: "Theatre", ka: "თეატრი" } },
  { id: "kids", emoji: "🧸", label: { ru: "Детям", en: "For kids", ka: "ბავშვებს" } },
  { id: "festival", emoji: "🎪", label: { ru: "Фестивали", en: "Festivals", ka: "ფესტივალები" } },
  { id: "exhibition", emoji: "🖼", label: { ru: "Выставки", en: "Exhibitions", ka: "გამოფენები" } },
  { id: "party", emoji: "🪩", label: { ru: "Вечеринки", en: "Parties", ka: "წვეულებები" } },
  { id: "games", emoji: "🎲", label: { ru: "Игры, мафия, квизы", en: "Games & quizzes", ka: "თამაშები, ქვიზები" } },
  { id: "sport", emoji: "⚽", label: { ru: "Спорт", en: "Sport", ka: "სპორტი" } },
  { id: "talk", emoji: "🎤", label: { ru: "Лекции и встречи", en: "Talks & meetups", ka: "ლექციები" } },
  { id: "other", emoji: "✨", label: { ru: "Другое", en: "Other", ka: "სხვა" } },
];
export const kindOf = (k: string) => EVENT_KINDS.find((x) => x.id === k) ?? EVENT_KINDS[EVENT_KINDS.length - 1];

const TZ = "Asia/Tbilisi";
const LOC: Record<Locale, string> = { ru: "ru-RU", en: "en-GB", ka: "ka-GE" };

/** «сб, 8 ноября · 19:00» по времени Тбилиси (если время 00:00 — без времени). */
export function eventWhen(e: Pick<CityEvent, "starts_at" | "ends_at">, lang: Locale): string {
  const s = new Date(e.starts_at);
  const day = (d: Date) => d.toLocaleDateString(LOC[lang], { timeZone: TZ, weekday: "short", day: "numeric", month: "long" });
  const time = s.toLocaleTimeString(LOC[lang], { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  const out = `${day(s)}${time !== "00:00" ? ` · ${time}` : ""}`;
  if (e.ends_at) {
    const en = new Date(e.ends_at);
    if (en.getTime() - s.getTime() > 20 * 3600 * 1000) return `${day(s)} — ${day(en)}`;
  }
  return out;
}

/** Событие ещё не закончилось (если конца нет — считаем, что идёт до конца дня начала + 6 часов). */
export function isUpcoming(e: Pick<CityEvent, "starts_at" | "ends_at">, now = Date.now()): boolean {
  const end = e.ends_at ? new Date(e.ends_at).getTime() : new Date(e.starts_at).getTime() + 6 * 3600 * 1000;
  return end >= now;
}
