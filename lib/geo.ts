import type { Block } from "./articles";
import BATUMI from "@/data/geo/batumi.json";

/*
 * «Грузия» — энциклопедия городов и регионов (как путеводитель, но с упором на жизнь здесь).
 * Каждая страница — файл data/geo/<id>.json, шаблон один. Новый город: положить файл и добавить строку в GEO ниже.
 * Пишет и дополняет бот по инструкции scripts/geo-bot.md (очередь — scripts/geo-topics.txt); проверка — node scripts/check-geo.mjs.
 */
export type GeoMonth = { tmin: number; tmax: number; rain: number; rainDays: number; sun?: number; sea?: number };
export type GeoSight = { name: string; text: string; lat?: number; lng?: number; photo?: string; guide?: string };
export type GeoPage = {
  id: string; // = id города сайта (batumi, tbilisi…) или новый (mtskheta, signagi…)
  kind: "city" | "resort" | "region";
  name: string; // Батуми
  nameIn: string; // в Батуми
  nameGen: string; // Батуми (род. падеж: «погода Батуми», «районы Батуми»)
  region?: string; // Аджария
  title: string; // SEO-заголовок
  description: string;
  lead: string;
  photo: { q: string; alt: string };
  coords: [number, number];
  facts: { k: string; v: string }[];
  sections: { id: string; title: string; emoji?: string; blocks: Block[] }[];
  districts?: { name: string; text: string }[];
  sights?: GeoSight[];
  climate?: { months: GeoMonth[]; source: { name: string; url: string }; seaSource?: { name: string; url: string } };
  /** что делать и что надеть в каждом месяце (12 строк) */
  months?: { what: string; wear: string }[];
  faq?: { q: string; a: string }[];
  sources: { name: string; url: string }[];
  updated: string;
};

export const GEO: GeoPage[] = [BATUMI as unknown as GeoPage];
export const geoPage = (id: string) => GEO.find((g) => g.id === id) ?? null;

export const MONTHS = [
  { slug: "yanvar", name: "январь", in: "в январе" },
  { slug: "fevral", name: "февраль", in: "в феврале" },
  { slug: "mart", name: "март", in: "в марте" },
  { slug: "aprel", name: "апрель", in: "в апреле" },
  { slug: "may", name: "май", in: "в мае" },
  { slug: "iyun", name: "июнь", in: "в июне" },
  { slug: "iyul", name: "июль", in: "в июле" },
  { slug: "avgust", name: "август", in: "в августе" },
  { slug: "sentyabr", name: "сентябрь", in: "в сентябре" },
  { slug: "oktyabr", name: "октябрь", in: "в октябре" },
  { slug: "noyabr", name: "ноябрь", in: "в ноябре" },
  { slug: "dekabr", name: "декабрь", in: "в декабре" },
] as const;
export const monthIndex = (slug: string) => MONTHS.findIndex((m) => m.slug === slug);
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
