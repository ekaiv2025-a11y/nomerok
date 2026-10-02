import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listPublishedMasters } from "@/lib/db";
import { LOCALES } from "@/lib/i18n/config";
import { seoCategoryIds } from "@/lib/seo-categories";
import { DISTRICTS, servesDistrict } from "@/lib/districts";

export const dynamic = "force-dynamic";

const PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/request", priority: 0.8 },
  { path: "/join", priority: 0.6 },
  { path: "/how", priority: 0.4 },
  { path: "/contacts", priority: 0.4 },
  { path: "/rules", priority: 0.2 },
];

function entry(path: string, priority: number, lastModified?: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`]));
  return LOCALES.map((l) => ({ url: `${SITE_URL}/${l}${path}`, priority, lastModified, alternates: { languages } }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const masters = await listPublishedMasters().catch(() => []);
  return [
    ...PAGES.flatMap((p) => entry(p.path, p.priority)),
    ...seoCategoryIds().flatMap((c) => entry(`/services/${c}`, 0.9)),
    // «услуга + район» — только там, где реально есть специалисты в этом районе
    ...seoCategoryIds().flatMap((c) =>
      DISTRICTS.filter((d) => masters.some((m) => !m.demo && m.city === "batumi" && (m.category === c || m.extra_categories.includes(c)) && servesDistrict(m, d) === "exact")).flatMap((d) =>
        entry(`/services/${c}/${d.id}`, 0.6),
      ),
    ),
    ...masters.filter((m) => !m.demo).flatMap((m) => entry(`/master/${m.slug}`, 0.7, m.updated_at)),
  ];
}
