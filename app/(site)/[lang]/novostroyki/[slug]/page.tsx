import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/i18n/page";
import { PROJECTS, PROJECT_STATUS, fmtMoney, priceLine, projectBySlug, projectPlace } from "@/lib/projects";
import { cityIn, cityLabel } from "@/lib/cities";
import { GeoBlocks } from "@/components/geo/GeoBlocks";
import { ProjectLeadForm } from "@/components/ProjectLeadForm";
import { Map } from "@/components/map/Map";
import { geoPhoto } from "@/lib/geo-photo";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ lang: "ru", slug: p.slug }));
}

const label = (id: string) => cityLabel(id, "ru");
const where = (p: { city?: string; place?: string }) => (p.place ? `в ${p.place}` : p.city ? cityIn(p.city, "ru") : "в Грузии");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = projectBySlug(slug);
  if (lang !== "ru" || !p) return {};
  const price = priceLine(p);
  return pageMeta("ru", `/novostroyki/${p.slug}`, `ЖК ${p.name} ${where(p)}: цены, срок сдачи, застройщик ${p.developer}`, `${PROJECT_STATUS[p.status].label}${p.completion ? `, сдача ${p.completion}` : ""}${price ? `, ${price}` : ""}. ${p.lead}`.slice(0, 200));
}

export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params;
  const p = projectBySlug(slug);
  if (lang !== "ru" || !p) notFound();
  const st = PROJECT_STATUS[p.status];
  const photo = await geoPhoto(p.photo?.q, Date.now() + 1200);
  const c = p.price?.currency ?? "USD";
  const facts: [string, string][] = [
    ["Застройщик", p.developer],
    ["Статус", st.label],
    ...(p.completion ? ([["Срок сдачи", p.completion]] as [string, string][]) : []),
    ...(p.price?.perM2 ? ([["Цена за м²", `от ${fmtMoney(p.price.perM2, c)}`]] as [string, string][]) : []),
    ...(p.price?.from ? ([["Квартиры", `от ${fmtMoney(p.price.from, c)}`]] as [string, string][]) : []),
    ...(p.floors ? ([["Этажей", p.floors]] as [string, string][]) : []),
    ...(p.units ? ([["Квартир", String(p.units)]] as [string, string][]) : []),
    ["Где", [projectPlace(p, label), p.district, p.address].filter(Boolean).join(", ")],
  ];
  const others = PROJECTS.filter((x) => x.slug !== p.slug && (x.city ?? x.place) === (p.city ?? p.place)).slice(0, 3);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Residence",
      name: `ЖК ${p.name}`,
      description: p.lead,
      url: `${SITE_URL}/ru/novostroyki/${p.slug}`,
      ...(p.address ? { address: { "@type": "PostalAddress", streetAddress: p.address, addressLocality: projectPlace(p, label), addressCountry: "GE" } } : {}),
      ...(p.coords ? { geo: { "@type": "GeoCoordinates", latitude: p.coords[0], longitude: p.coords[1] } } : {}),
    },
    ...(p.faq?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Новостройки", item: `${SITE_URL}/ru/novostroyki` }, { "@type": "ListItem", position: 2, name: `ЖК ${p.name}`, item: `${SITE_URL}/ru/novostroyki/${p.slug}` }] },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="flex flex-wrap gap-1.5 text-[14px] text-muted">
        <Link href="/ru/novostroyki" className="hover:text-brand">Новостройки</Link>
        {p.city && (
          <>
            ›{" "}
            <Link href={`/ru/novostroyki?city=${p.city}`} className="hover:text-brand">
              {label(p.city)}
            </Link>
          </>
        )}
      </nav>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
        <span className={`rounded-full px-2.5 py-0.5 font-semibold ${st.cls}`}>{st.label}</span>
        {p.completion && <span className="text-muted">Сдача: {p.completion}</span>}
      </div>
      <h1 className="mt-2 text-[28px] font-bold leading-tight sm:text-[38px]">
        ЖК {p.name} {where(p)}
      </h1>
      <p className="mt-2 max-w-3xl text-[16px] leading-relaxed text-[#3a3935] sm:text-[18px]">{p.lead}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {photo && (
            <figure className="mb-6 overflow-hidden rounded-2xl border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={p.photo?.alt ?? `Район ЖК ${p.name}`} className="aspect-[16/9] w-full object-cover" />
              <figcaption className="px-3 py-2 text-[12px] text-muted">
                {p.photo?.alt ?? "Вид района"} · фото:{" "}
                <a href={photo.source} target="_blank" rel="noopener noreferrer nofollow" className="underline">
                  {photo.credit}
                </a>
                , {photo.license}
              </figcaption>
            </figure>
          )}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k} className={`bg-white p-3.5 ${k === "Где" ? "col-span-full" : ""}`}>
                <dt className="text-[12px] text-muted">{k}</dt>
                <dd className="mt-0.5 text-[15px] font-semibold leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
          {p.price && (
            <p className="mt-2 text-[12px] text-muted">
              Цены — по данным{" "}
              <a href={p.price.src} target="_blank" rel="noopener noreferrer nofollow" className="underline">
                источника
              </a>{" "}
              на {p.price.date}. Актуальные условия уточняйте по заявке.
            </p>
          )}
          {p.features && p.features.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.features.map((f) => (
                <span key={f} className="rounded-full bg-cream px-3 py-1 text-[13px]">
                  {f}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8">
            <GeoBlocks blocks={p.body} self={`/ru/novostroyki/${p.slug}`} cityQuery={p.city} />
          </div>

          {p.coords && (
            <section className="mt-8">
              <h2 className="text-[22px] font-bold">Расположение</h2>
              <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white p-2">
                <Map height={340} points={[{ lat: p.coords[0], lng: p.coords[1], title: `ЖК ${p.name}`, subtitle: p.address }]} />
              </div>
            </section>
          )}

          {p.faq && p.faq.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[22px] font-bold">Вопросы</h2>
              <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
                {p.faq.map((f) => (
                  <div key={f.q} className="p-4">
                    <p className="font-semibold">{f.q}</p>
                    <p className="mt-1 text-[15px] text-[#3a3935]">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8 text-[13px] leading-relaxed text-muted">
            <p>Описание составлено редакцией NomerOk по открытым источникам{p.updated ? `, проверено ${p.updated}` : ""}. Это не реклама и не оферта застройщика.</p>
            <p className="mt-1">
              Источники:{" "}
              {p.sources.map((s, i) => (
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
            <p className="text-[19px] font-bold leading-tight">Узнать цены и свободные квартиры</p>
            <p className="mt-1 mb-4 text-[14px] text-muted">Специалист агентства недвижимости пришлёт планировки и условия или предложит похожие варианты.</p>
            <ProjectLeadForm project={p.slug} projectName={`ЖК ${p.name}`} city={p.city} />
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[22px] font-bold">Другие новостройки {where(p)}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {others.map((x) => (
              <Link key={x.slug} href={`/ru/novostroyki/${x.slug}`} className="rounded-2xl border border-line bg-white p-4 transition hover:border-brand">
                <span className="text-[12px] font-semibold text-muted">{PROJECT_STATUS[x.status].label}</span>
                <span className="mt-1 block text-[16px] font-bold">ЖК {x.name}</span>
                <span className="mt-1 block text-[13px] text-muted">{priceLine(x) ?? x.developer}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
