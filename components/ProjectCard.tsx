import Link from "next/link";
import { PROJECT_STATUS, priceLine, projectPlace, type Project } from "@/lib/projects";
import { cityLabel } from "@/lib/cities";
import type { CommonsPhoto } from "@/lib/commons";

const label = (id: string) => cityLabel(id, "ru");

/** Карточка ЖК в списках (раздел «Новостройки», страница застройщика). */
export function ProjectCard({ p, photo }: { p: Project; photo?: CommonsPhoto }) {
  const st = PROJECT_STATUS[p.status];
  const price = priceLine(p);
  return (
    <Link href={`/ru/novostroyki/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand">
      <span className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#eef0f3] to-[#d6dde8]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt={p.photo?.alt ?? `Район ЖК ${p.name}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[50%_35%] transition duration-300 group-hover:scale-[1.03]" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[48px]" aria-hidden>
            🏗️
          </span>
        )}
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${st.cls}`}>{st.label}</span>
        {photo && photo.title !== "dev" && photo.title !== "own" && p.photo?.alt && <span className="absolute bottom-2 right-2 rounded-full bg-ink/60 px-2 py-0.5 text-[11px] text-white">{p.photo.alt}</span>}
      </span>
      <span className="flex flex-1 flex-col p-4 sm:p-5">
      <span className="flex items-center gap-2 text-[12px]">
        <span className="text-muted">📍 {[projectPlace(p, label), p.district].filter(Boolean).join(", ")}</span>
      </span>
      <span className="mt-2 block text-[18px] font-bold leading-snug group-hover:text-brand">ЖК {p.name}</span>
      <span className="mt-0.5 block text-[13px] text-muted">{p.developer}</span>
      <span className="mt-2 line-clamp-2 block text-[14px] text-[#3a3935]">{p.lead}</span>
      <span className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 text-[13px]">
        {price && <b>{price}</b>}
        {p.completion && <span className="text-muted">Сдача: {p.completion}</span>}
      </span>
      </span>
    </Link>
  );
}
