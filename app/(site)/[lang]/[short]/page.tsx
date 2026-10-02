import { notFound, permanentRedirect } from "next/navigation";
import { findByShort } from "@/lib/short-link";
import { href } from "@/lib/i18n";
import { langOf } from "@/lib/i18n/page";

export const dynamic = "force-dynamic";

/** Короткая ссылка nomerok.ge/anna (или /@anna) → профиль специалиста. */
export default async function ShortLink({ params }: { params: Promise<{ lang: string; short: string }> }) {
  const p = await params;
  const lang = await langOf(Promise.resolve({ lang: p.lang }));
  const m = await findByShort(decodeURIComponent(p.short)).catch(() => null);
  if (!m || m.status !== "published") notFound();
  permanentRedirect(href(lang, `/master/${m.slug}`));
}
