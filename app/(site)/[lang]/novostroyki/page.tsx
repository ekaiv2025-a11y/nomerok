import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { PROJECTS, PROJECT_STATUS, priceLine, projectPlace, type Project, type ProjectStatus } from "@/lib/projects";
import { CITIES, cityIn, cityLabel, isCity } from "@/lib/cities";
import { journalArticles } from "@/lib/journal";
import { formatArticleDate } from "@/lib/articles";
import { ProjectLeadForm } from "@/components/ProjectLeadForm";
import { Map } from "@/components/map/Map";

export const revalidate = 3600;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ city?: string; status?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "ru") return {};
  const { city } = await searchParams;
  const c = isCity(city) ? city : null;
  const where = c ? cityIn(c, "ru") : "в Грузии";
  return pageMeta("ru", c ? `/novostroyki?city=${c}` : "/novostroyki", `Новостройки ${where}: строящиеся дома и жилые комплексы, цены и сроки сдачи`, `Жилые комплексы ${where}: застройщик, срок сдачи, цены от, расположение на карте. Оставьте заявку — подберём квартиру в новостройке.`);
}

const label = (id: string) => cityLabel(id, "ru");

export default async function ProjectsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (lang !== "ru") notFound();
  const sp = await searchParams;
  const city = isCity(sp.city) ? sp.city : null;
  const status = sp.status && sp.status in PROJECT_STATUS ? (sp.status as ProjectStatus) : null;
  const list = PROJECTS.filter((p) => (!city || p.city === city) && (!status || p.status === status));
  const cityCounts: Record<string, number> = {};
  for (const p of PROJECTS) if (p.city) cityCounts[p.city] = (cityCounts[p.city] ?? 0) + 1;
  const news = (await journalArticles().catch(() => [])).filter((a) => a.rubric === "build").slice(0, 6);
  const points = list.filter((p) => p.coords).map((p) => ({ lat: p.coords![0], lng: p.coords![1], title: p.name, subtitle: [p.district, PROJECT_STATUS[p.status].label].filter(Boolean).join(" · "), href: `/ru/novostroyki/${p.slug}` }));
  const qs = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(Object.entries({ city, status, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/ru/novostroyki${p.toString() ? `?${p}` : ""}`;
  };
  const chip = (on: boolean) => `inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-[13px] font-medium ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="text-[28px] font-bold leading-tight sm:text-[38px]">Новостройки {city ? cityIn(city, "ru") : "Грузии"}</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[17px]">Строящиеся дома и жилые комплексы: застройщик, срок сдачи, цены и расположение. По любому ЖК можно оставить заявку — специалист агентства недвижимости расскажет о планировках и условиях или подберёт другой вариант.</p>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link href={qs({ city: null })} className={chip(!city)}>
          Вся Грузия · {PROJECTS.length}
        </Link>
        {CITIES.filter((c) => cityCounts[c.id]).map((c) => (
          <Link key={c.id} href={qs({ city: c.id })} className={chip(city === c.id)}>
            {c.label.ru} · {cityCounts[c.id]}
          </Link>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link href={qs({ status: null })} className={chip(!status)}>
          Любой статус
        </Link>
        {(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((s) => (
          <Link key={s} href={qs({ status: s })} className={chip(status === s)}>
            {PROJECT_STATUS[s].label}
          </Link>
        ))}
      </div>

      {list.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProjectCard key={p.slug} p={p} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-line bg-cream px-5 py-8 text-center text-[15px] text-muted">Здесь пока нет описанных комплексов — раздел пополняется каждый день. Оставьте заявку ниже, и вам подберут варианты.</p>
      )}

      {points.length > 1 && (
        <section className="mt-10">
          <h2 className="text-[22px] font-bold">На карте</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white p-2">
            <Map height={420} points={points} />
          </div>
        </section>
      )}

      <section id="podbor" className="mt-10 grid gap-6 rounded-3xl border border-line bg-white p-5 sm:p-8 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="text-[24px] font-bold leading-tight">Подберём квартиру в новостройке</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">Напишите бюджет и пожелания. Специалист агентства недвижимости пришлёт подходящие комплексы, планировки и условия рассрочки и ответит на вопросы.</p>
          <ul className="mt-4 space-y-1.5 text-[14px] text-[#3a3935]">
            <li>✓ Бесплатно для покупателя</li>
            <li>✓ Батуми, Тбилиси и другие города</li>
            <li>✓ Связываются по телефону или в Telegram</li>
          </ul>
        </div>
        <ProjectLeadForm city={city ?? undefined} />
      </section>

      {news.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-[22px] font-bold">Новости строительства</h2>
            <Link href={href("ru", "/guide?r=build")} className="text-[14px] font-semibold text-brand hover:underline">
              Все →
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((a) => (
              <Link key={a.slug} href={`/ru/guide/${a.slug}`} className="rounded-2xl border border-line bg-white p-4 transition hover:border-brand">
                <span className="block text-[15px] font-semibold leading-snug">{a.title}</span>
                <span className="mt-1 block text-[12px] text-muted">{formatArticleDate(a.date)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <p className="mt-8 text-[12px] leading-relaxed text-muted">Описания составлены редакцией NomerOk по открытым источникам: сайты застройщиков, korter.ge, новости. Цены и сроки указаны на дату проверки и могут измениться — точные условия уточняйте у застройщика или агентства.</p>
    </div>
  );
}

function ProjectCard({ p }: { p: Project }) {
  const st = PROJECT_STATUS[p.status];
  const price = priceLine(p);
  return (
    <Link href={`/ru/novostroyki/${p.slug}`} className="group flex flex-col rounded-2xl border border-line bg-white p-4 transition hover:border-brand sm:p-5">
      <span className="flex items-center gap-2 text-[12px]">
        <span className={`rounded-full px-2 py-0.5 font-semibold ${st.cls}`}>{st.label}</span>
        <span className="text-muted">📍 {[projectPlace(p, label), p.district].filter(Boolean).join(", ")}</span>
      </span>
      <span className="mt-2 block text-[18px] font-bold leading-snug group-hover:text-brand">ЖК {p.name}</span>
      <span className="mt-0.5 block text-[13px] text-muted">{p.developer}</span>
      <span className="mt-2 line-clamp-2 block text-[14px] text-[#3a3935]">{p.lead}</span>
      <span className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 text-[13px]">
        {price && <b>{price}</b>}
        {p.completion && <span className="text-muted">Сдача: {p.completion}</span>}
      </span>
    </Link>
  );
}
