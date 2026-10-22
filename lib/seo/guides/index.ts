import { GUIDES_HOME } from "./home";
import { GUIDES_SERVICES } from "./services";
import { GUIDES_PEOPLE } from "./people";
import { EXTRA_HOME } from "./extra-home";
import { EXTRA_PEOPLE } from "./extra-people";
import { EXTRA_SERVICES } from "./extra-services";
import { EXTRA2_A } from "./extra2-a";
import { EXTRA2_B } from "./extra2-b";

/*
 * Большие статьи-руководства для страниц направлений (/ru/services/plumber): 1000+ слов про Батуми.
 * Только факты, в которых уверены; цены не выдумываем — они в профилях специалистов.
 */
export type GuideSection = { h: string; p: string[]; list?: string[]; after?: string[] };
export type Guide = { h: string; intro: string; sections: GuideSection[] };

const BASE: Record<string, Guide> = { ...GUIDES_HOME, ...GUIDES_SERVICES, ...GUIDES_PEOPLE };
const EXTRA: Record<string, GuideSection[]> = { ...EXTRA_HOME, ...EXTRA_PEOPLE, ...EXTRA_SERVICES };

/** Дополнительные разделы встают перед последним (про NomerOk). */
export const GUIDES_RU: Record<string, Guide> = Object.fromEntries(
  Object.entries(BASE).map(([k, g]) => {
    const x = [...(EXTRA[k] ?? []), ...(EXTRA2_A[k] ?? []), ...(EXTRA2_B[k] ?? [])];
    return [k, { ...g, sections: [...g.sections.slice(0, -1), ...x, ...g.sections.slice(-1)] }];
  }),
);

export function guideFor(cat: string, lang: string): Guide | null {
  return lang === "ru" ? (GUIDES_RU[cat] ?? null) : null;
}
