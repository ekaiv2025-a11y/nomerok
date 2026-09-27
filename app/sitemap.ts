import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listPublishedMasters } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const masters = await listPublishedMasters().catch(() => []);
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/request`, priority: 0.8 },
    { url: `${SITE_URL}/join`, priority: 0.6 },
    { url: `${SITE_URL}/how`, priority: 0.4 },
    ...masters.map((m) => ({ url: `${SITE_URL}/master/${m.slug}`, lastModified: m.updated_at, priority: 0.7 })),
  ];
}
