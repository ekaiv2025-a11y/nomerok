import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DevEditor } from "@/components/DevEditor";
import { currentDev, ownsDev } from "@/lib/dev-auth";
import { getDevProject, unitsOf } from "@/lib/dev-projects-db";
import { PROJECTS } from "@/lib/projects";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ЖК — кабинет застройщика — NomerOk", robots: { index: false } };

export default async function DevProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ claim?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const who = await currentDev();
  if (!who) redirect(`/ru/realty/dev${sp.claim ? `?claim=${sp.claim}` : ""}`);
  const catalog = PROJECTS.map((p) => ({ slug: p.slug, name: p.name, city: p.city ?? "batumi", developer: p.developer }));
  if (id === "new") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <DevEditor initial={null} units={[]} catalog={catalog} claim={sp.claim} />
      </div>
    );
  }
  const d = await getDevProject(id);
  if (!d || !ownsDev(who, d)) notFound();
  const units = await unitsOf(d.id).catch(() => []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <DevEditor initial={d} units={units} catalog={catalog} />
    </div>
  );
}
