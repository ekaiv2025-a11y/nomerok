import "server-only";
import { adminListMasters, adminUpdateMaster } from "./db";
import { extractLinks } from "./extract-links";
import { isDemoSlug } from "./demo";
import type { Master } from "./types";
import type { MasterLinks } from "./links";

const FIELDS = ["services", "about", "credentials"] as const;

export type LinkMove = {
  id: string;
  name: string;
  slug: string;
  add: MasterLinks; // новые ссылки (которых ещё нет в «Соцсети и сайт»)
  texts: { field: (typeof FIELDS)[number]; before: string; after: string }[];
};

function plan(m: Master): LinkMove | null {
  const add: MasterLinks = {};
  const texts: LinkMove["texts"] = [];
  const have = m.links ?? {};
  for (const f of FIELDS) {
    const src = m[f] ?? "";
    if (!src) continue;
    const r = extractLinks(src, m.telegram);
    if (!r.found) continue;
    for (const [k, v] of Object.entries(r.links)) if (!have[k as keyof MasterLinks] && !add[k as keyof MasterLinks]) add[k as keyof MasterLinks] = v;
    if (r.changed) texts.push({ field: f, before: src, after: r.text });
  }
  if (!Object.keys(add).length && !texts.length) return null;
  return { id: m.id, name: m.name, slug: m.slug, add, texts };
}

/** Кому и что перенесём (ничего не меняет). */
export async function planLinkMoves(): Promise<LinkMove[]> {
  const all = await adminListMasters();
  return all.filter((m) => !isDemoSlug(m.slug)).map(plan).filter((x): x is LinkMove => !!x);
}

/** Переносит ссылки: добавляет в «Соцсети и сайт» и убирает строки со ссылками из текста. */
export async function applyLinkMoves(onlyId?: string): Promise<number> {
  const all = await adminListMasters();
  let n = 0;
  for (const m of all) {
    if (isDemoSlug(m.slug) || (onlyId && m.id !== onlyId)) continue;
    const p = plan(m);
    if (!p) continue;
    const patch: Partial<Master> = { links: { ...(m.links ?? {}), ...p.add } };
    for (const t of p.texts) (patch as Record<string, string>)[t.field] = t.after;
    await adminUpdateMaster(m.id, patch);
    n++;
  }
  return n;
}
