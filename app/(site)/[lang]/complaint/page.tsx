import type { Metadata } from "next";
import { getPublishedMasterBySlug } from "@/lib/db";
import { getDict } from "@/lib/i18n";
import { langOf, type LangParams } from "@/lib/i18n/page";
import { ComplaintForm } from "@/components/ComplaintForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return { title: getDict(lang).complaint.title, robots: { index: false } };
}

type Props = LangParams & { searchParams: Promise<{ m?: string }> };

export default async function ComplaintPage({ params, searchParams }: Props) {
  const lang = await langOf(params);
  const t = getDict(lang).complaint;
  const slug = (await searchParams).m;
  const m = slug ? await getPublishedMasterBySlug(slug).catch(() => null) : null;
  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold leading-tight">{t.title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.intro}</p>
      <div className="mt-6">
        <ComplaintForm lang={lang} master={m && !m.demo ? { slug: m.slug, name: m.name } : null} />
      </div>
    </div>
  );
}
