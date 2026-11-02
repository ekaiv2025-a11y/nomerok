import type { Block } from "./articles";
import DATA from "@/data/developers.json";
import { PROJECTS, type Project } from "./projects";

/*
 * Страницы застройщиков (/ru/novostroyki/z/<slug>): о компании, проекты, новости.
 * Данные — data/developers.json, пишет бот по scripts/projects-bot.md. Текст — своими словами по сайту застройщика.
 * Это не официальный сайт застройщика: внизу всегда пометка «описание NomerOk по материалам застройщика».
 */
export type Developer = {
  slug: string; // archi, alliance-group
  name: string;
  lead: string;
  founded?: string; // «2010»
  site?: string; // официальный сайт — только ссылкой в источниках, заявки — через нашу форму
  facts?: { k: string; v: string }[]; // «Сдано проектов: 12»
  body: Block[];
  cover?: { url: string; credit: string; src: string };
  sources: { name: string; url: string }[];
  updated: string;
};

export const DEVELOPERS: Developer[] = (DATA as unknown as Developer[]).filter((d) => d?.slug && d.name);
export const developerBySlug = (slug: string) => DEVELOPERS.find((d) => d.slug === slug) ?? null;
export const projectsOf = (d: Developer): Project[] => PROJECTS.filter((p) => p.developerSlug === d.slug);
