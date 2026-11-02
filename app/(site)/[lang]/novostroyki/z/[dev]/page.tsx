import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { pageMeta } from "@/lib/i18n/page";
import { developerBySlug, projectsOf } from "@/lib/developers";
import { PROJECT_STATUS, pimg } from "@/lib/projects";
import { projectPhotos } from "@/lib/project-photos";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectLeadForm } from "@/components/ProjectLeadForm";
import { GeoBlocks } from "@/components/geo/GeoBlocks";
import { Map } from "@/components/map/Map";
import { journalArticles } from "@/lib/journal";
import { formatArticleDate } from "@/lib/articles";
import { SITE_URL } from "@/lib/site";

// страница собирается при открытии: застройщиков бот добавляет постоянно
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ lang: string; dev: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, dev } = await params;
  const d = developerBySlug(dev);
  if (lang !== "ru" || !d) return {};
  const n = projectsOf(d).length;
  return pageMeta("ru", `/novostroyki/z/${d.slug}`, `Застройщик ${d.name}: все жилые комплексы, цены и сроки сдачи`, `${d.lead} ${n ? `${n} ЖК на NomerOk.` : ""}`.slice(0, 200));
}

export default async function DeveloperPage({ params }: Props) {
  const { lang, dev } = await params;
  const d = developerBySlug(dev);
  // застройщика ещё нет (или другой язык) — ведём в раздел «Новостройки»
  if (lang !== "ru" || !d) redirect("/ru/novostroyki");
  const list = projectsOf(d);
  const [photos, news] = await Promise.all([projectPhotos().catch(() => new globalThis.Map()), journalArticles().catch(() => [])]);
  const mentions = news.filter((a) => a.rubric === "build" && `${a.title} ${a.lead}`.includes(d.name)).slice(0, 6);
  const points = list.filter((p) => p.coords).map((p) => ({ lat: p.coords![0], lng: p.coords![1], title: `ЖК ${p.name}`, subtitle: PROJECT_STATUS[p.status].label, href: `/ru/novostroyki/${p.slug}` }));
  const counts = (["building", "presale", "done"] as const).map((s) => [PROJECT_STATUS[s].label, list.filter((p) => p.status === s).length] as const).filter(([, n]) => n);
  const facts = [...(d.founded ? [["Основан", d.founded] as const] : []), ...counts.map(([k, n]) => [`ЖК: ${k.toLowerCase()}`, String(n)] as const), ...(d.facts ?? []).map((f) => [f.k, f.v] as const)];
  const ld = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: d.name,
    description: d.lead,
    ...(d.founded ? { foundingDate: d.founded } : {}),
    url: `${SITE_URL}/ru/novostroyki/z/${d.slug}`,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="flex flex-wrap gap-1.5 text-[14px] text-muted">
        <Link href="/ru/novostroyki" className="hover:text-brand">Новостройки</Link> › <span>Застройщики</span>
      </nav>
      <h1 className="mt-2 text-[28px] font-bold leading-tight sm:text-[38px]">Застройщик {d.name}</h1>
      <p className="mt-2 max-w-3xl text-[16px] leading-relaxed text-[#3a3935] sm:text-[18px]">{d.lead}</p>

      {d.cover && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-ink sm:aspect-[21/9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pimg(d.cover.url)} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pimg(d.cover.url)} alt={d.name} className="relative h-full w-full object-contain" />
        </div>
      )}

      {facts.length > 0 && (
        <dl className={`mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line ${facts.length % 2 ? "grid-cols-1" : "grid-cols-2"} ${facts.length % 4 === 0 ? "sm:grid-cols-4" : facts.length % 3 === 0 ? "sm:grid-cols-3" : facts.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          {facts.map(([k, v]) => (
            <div key={k} className="bg-white p-3.5">
              <dt className="text-[12px] text-muted">{k}</dt>
              <dd className="mt-0.5 text-[15px] font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {list.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[22px] font-bold">Жилые комплексы {d.name}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProjectCard key={p.slug} p={p} photo={photos.get(p.slug)} />
            ))}
          </div>
        </section>
      )}

      {points.length > 1 && (
        <section className="mt-10">
          <h2 className="text-[22px] font-bold">На карте</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white p-2">
            <Map height={380} points={points} />
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <GeoBlocks blocks={d.body} self={`/ru/novostroyki/z/${d.slug}`} />
          {mentions.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[22px] font-bold">Новости</h2>
              <div className="mt-3 grid gap-2">
                {mentions.map((a) => (
                  <Link key={a.slug} href={`/ru/guide/${a.slug}`} className="rounded-xl border border-line bg-white px-4 py-3 hover:border-brand">
                    <span className="block font-semibold">{a.title}</span>
                    <span className="text-[12px] text-muted">{formatArticleDate(a.date)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <section className="mt-8 text-[13px] leading-relaxed text-muted">
            <p>Описание составлено редакцией NomerOk по материалам застройщика и открытым источникам, проверено {d.updated}. Это не официальный сайт застройщика.</p>
            <p className="mt-1">
              Источники:{" "}
              {d.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && ", "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="underline">
                    {s.name}
                  </a>
                </span>
              ))}
            </p>
          </section>
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-3xl border border-line bg-white p-5">
            <p className="text-[19px] font-bold leading-tight">Квартира у {d.name}</p>
            <p className="mb-4 mt-1 text-[14px] text-muted">Специалист агентства недвижимости подберёт комплекс и планировку под ваш бюджет и расскажет об условиях.</p>
            <ProjectLeadForm city={list[0]?.city} note={`Застройщик: ${d.name}`} compact />
          </div>
        </aside>
      </div>
    </div>
  );
}
