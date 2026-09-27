import type { Metadata } from "next";
import { RequestForm } from "@/components/RequestForm";
import { getPublishedMasterBySlug } from "@/lib/db";

export const metadata: Metadata = {
  title: "Оставить заявку",
  description: "Опишите задачу — подберём специалиста в Батуми и перезвоним.",
};
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ category?: string; master?: string }> };

export default async function RequestPage({ searchParams }: Props) {
  const sp = await searchParams;
  const master = sp.master ? await getPublishedMasterBySlug(sp.master).catch(() => null) : null;
  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold leading-tight sm:text-[32px]">Оставить заявку</h1>
      <p className="mt-2 text-[15px] text-muted">
        {master ? "Специалист получит вашу заявку и свяжется с вами." : "Опишите, что нужно сделать. Подберём специалиста и перезвоним — это бесплатно."}
      </p>
      <div className="mt-6">
        <RequestForm defaultCategory={sp.category} master={master ? { slug: master.slug, name: master.name, category: master.category } : null} />
      </div>
    </div>
  );
}
