import type { Metadata } from "next";
import { RequestForm } from "@/components/RequestForm";
import { getPublishedMasterBySlug } from "@/lib/db";
import { getDict } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  const t = getDict(lang).meta;
  return pageMeta(lang, "/request", t.request, t.requestDesc);
}

type Props = LangParams & { searchParams: Promise<{ category?: string; master?: string }> };

export default async function RequestPage({ params, searchParams }: Props) {
  const lang = await langOf(params);
  const t = getDict(lang).request;
  const sp = await searchParams;
  const master = sp.master ? await getPublishedMasterBySlug(sp.master).catch(() => null) : null;
  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold leading-tight sm:text-[32px]">{t.title}</h1>
      <p className="mt-2 text-[15px] text-muted">{master ? t.subMaster : t.subGeneral}</p>
      <div className="mt-6">
        <RequestForm
          lang={lang}
          defaultCategory={sp.category}
          master={master ? { slug: master.slug, name: master.name, category: master.category } : null}
        />
      </div>
    </div>
  );
}
