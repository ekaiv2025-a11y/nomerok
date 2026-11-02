import "server-only";
import { dbMode, readLocal, supabase, writeLocal } from "./db";

/* Фото самих ЖК: загружает владелец сайта в админке (свои снимки или с разрешения застройщика/агентства). */
export type ProjectMedia = { slug: string; photos: string[]; credit: string | null; updated_at: string };
type L = { project_photos?: ProjectMedia[] };

export async function allProjectMedia(): Promise<Map<string, ProjectMedia>> {
  const map = new Map<string, ProjectMedia>();
  const sb = supabase();
  if (sb) {
    const r = await sb.from("project_photos").select("*");
    if (!r.error) for (const x of r.data as ProjectMedia[]) map.set(x.slug, x);
  } else if (dbMode() === "local") {
    for (const x of ((await readLocal()) as unknown as L).project_photos ?? []) map.set(x.slug, x);
  }
  return map;
}

export async function saveProjectMedia(slug: string, photos: string[], credit: string | null) {
  const row: ProjectMedia = { slug, photos, credit, updated_at: new Date().toISOString() };
  const sb = supabase();
  if (sb) {
    const r = await sb.from("project_photos").upsert(row, { onConflict: "slug" });
    if (r.error) throw new Error(r.error.message);
    return;
  }
  const d = (await readLocal()) as unknown as L;
  d.project_photos = [...(d.project_photos ?? []).filter((x) => x.slug !== slug), row];
  await writeLocal(d as never);
}
