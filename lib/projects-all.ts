import "server-only";
import { PROJECTS, projectBySlug, type Project } from "./projects";
import { publishedDevProjects, unitsOf } from "./dev-projects-db";
import { devAsProject, type DevProject, type DevUnit } from "./dev-projects";

/*
 * Каталог новостроек = ЖК из data/projects.json (описывает редакция) + ЖК, которые добавили застройщики в кабинете.
 * Если застройщик дополняет ЖК из каталога (linked_slug) — его фото, ход стройки, квартиры и цены ложатся поверх описания.
 */
export async function allProjects(): Promise<Project[]> {
  const devs = await publishedDevProjects().catch(() => [] as DevProject[]);
  const linked = new Map(devs.filter((d) => d.linked_slug).map((d) => [d.linked_slug!, d]));
  const base = await Promise.all(
    PROJECTS.map(async (p) => {
      const d = linked.get(p.slug);
      return d ? devAsProject(d, p, await unitsOf(d.id).catch(() => [])) : p;
    }),
  );
  const own = await Promise.all(devs.filter((d) => !d.linked_slug || !projectBySlug(d.linked_slug)).map(async (d) => devAsProject(d, null, await unitsOf(d.id).catch(() => []))));
  return [...own, ...base].sort((a, b) => b.added.localeCompare(a.added) || a.name.localeCompare(b.name));
}

/** ЖК по адресу страницы — с данными застройщика и его квартирами, если они есть. */
export async function getProjectFull(slug: string): Promise<{ p: Project; dev: DevProject | null; units: DevUnit[] } | null> {
  const devs = await publishedDevProjects().catch(() => [] as DevProject[]);
  const base = projectBySlug(slug);
  const d = devs.find((x) => (base ? x.linked_slug === slug : x.slug === slug && (!x.linked_slug || !projectBySlug(x.linked_slug))));
  if (!base && !d) return null;
  const units = d ? await unitsOf(d.id).catch(() => []) : [];
  return { p: d ? devAsProject(d, base, units) : base!, dev: d ?? null, units };
}
