import type { Block } from "./articles";
import DATA from "@/data/projects.json";

/*
 * «Новостройки Грузии»: строящиеся дома и жилые комплексы.
 * Каждый ЖК — запись в data/projects.json. Пишет и обновляет бот по scripts/projects-bot.md.
 * Проверка: node scripts/check-projects.mjs.
 * Только факты из открытых источников (сайт застройщика, korter.ge, новости) своими словами.
 * Чужие фото и тексты объявлений не копируем.
 */
export type ProjectStatus = "presale" | "building" | "done";

export type Project = {
  slug: string; // ru-латиница: zhk-orbi-city-batumi
  name: string; // «Orbi City»
  city?: string; // id города сайта (batumi, tbilisi…)
  place?: string; // если не город сайта: «Гонио», «Бакуриани»
  district?: string; // район словами
  address?: string;
  coords?: [number, number];
  developer: string;
  developerUrl?: string;
  status: ProjectStatus;
  /** срок сдачи словами: «IV квартал 2027» */
  completion?: string;
  /** цена «от»: число в $ за м² и/или за квартиру; дата и источник обязательны */
  price?: { perM2?: number; from?: number; currency?: "USD" | "GEL"; date: string; src: string };
  floors?: string; // «22» или «12–18»
  units?: number; // квартир
  /** короткие факты-плашки: «у моря», «рассрочка», «белый каркас» — только подтверждённые */
  features?: string[];
  lead: string; // 2–3 предложения
  body: Block[];
  faq?: { q: string; a: string }[];
  sources: { name: string; url: string }[];
  /** обложка с Wikimedia Commons (вид района, улицы) — по-английски */
  photo?: { q: string; alt?: string };
  updated: string; // YYYY-MM-DD
  added: string; // YYYY-MM-DD
  hidden?: boolean;
};

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; cls: string }> = {
  presale: { label: "Старт продаж", cls: "bg-[#fdf3dc] text-[#5a4410]" },
  building: { label: "Строится", cls: "bg-[#e3f1f6] text-[#1d5a78]" },
  done: { label: "Сдан", cls: "bg-brand-soft text-brand-dark" },
};

export const PROJECTS: Project[] = (DATA as unknown as Project[])
  .filter((p) => p && p.slug && p.name && !p.hidden)
  .sort((a, b) => b.added.localeCompare(a.added) || a.name.localeCompare(b.name));

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug) ?? null;

export const fmtMoney = (n: number, cur: "USD" | "GEL" = "USD") => (cur === "USD" ? "$" : "") + n.toLocaleString("ru-RU").replace(/,/g, " ") + (cur === "GEL" ? " ₾" : "");

export function priceLine(p: Project): string | null {
  if (!p.price) return null;
  const c = p.price.currency ?? "USD";
  const parts = [p.price.perM2 ? `от ${fmtMoney(p.price.perM2, c)}/м²` : "", p.price.from ? `квартиры от ${fmtMoney(p.price.from, c)}` : ""].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export const projectPlace = (p: Project, label: (id: string) => string) => p.place || (p.city ? label(p.city) : "Грузия");
