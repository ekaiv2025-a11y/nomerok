/* «В отпуске / не принимаю заявки». Дата away_until — включительно, по времени Батуми. */

export function todayTbilisi(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tbilisi" }).format(new Date());
}

export function isAwayNow(m: { is_away?: boolean | null; away_until?: string | null }): boolean {
  if (!m.is_away) return false;
  if (!m.away_until) return true;
  return m.away_until >= todayTbilisi();
}

/** Работает ли специалист в этом направлении (основном или дополнительном). */
export function servesCategory(m: { category: string; extra_categories?: string[] | null }, cat: string): boolean {
  return m.category === cat || (m.extra_categories ?? []).includes(cat);
}

export const MAX_EXTRA_CATEGORIES = 3;

/** «15 октября» на языке сайта. */
export function formatDay(date: string, lang: string): string {
  const loc = lang === "ka" ? "ka-GE" : lang === "en" ? "en-GB" : "ru-RU";
  return new Intl.DateTimeFormat(loc, { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(date + "T00:00:00Z"));
}

/** Дата через n дней (по Батуми), YYYY-MM-DD. */
export function daysFromToday(n: number): string {
  const d = new Date(todayTbilisi() + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
