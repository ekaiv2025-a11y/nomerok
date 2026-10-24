import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { RUBRICS, formatArticleDate, readingMinutes, type Article, type Rubric } from "@/lib/articles";

import { journalArticles } from "@/lib/journal";
import { articleViews } from "@/lib/article-views";
import { posStyle } from "@/lib/photo-pos";
import { cityLabel, isCity } from "@/lib/cities";

/** Где: город сайта, место словами или «Вся Грузия» — для новостей, афиши и поездок. */
function whereOf(a: Article): string | null {
  if (a.rubric !== "news" && a.rubric !== "events" && a.rubric !== "travel") return null;
  return a.place || (isCity(a.city) ? cityLabel(a.city, "ru") : "Вся Грузия");
}
/** Фильтр по городам в новостях: Тбилиси, Батуми, Кутаиси, другие регионы, вся Грузия */
const CITY_TABS: [string, string][] = [
  ["tbilisi", "Тбилиси"],
  ["batumi", "Батуми"],
  ["kutaisi", "Кутаиси"],
  ["regions", "Другие города и регионы"],
  ["all-georgia", "Вся Грузия"],
];
function matchCity(a: Article, c: string): boolean {
  if (c === "all-georgia") return !a.city && !a.place;
  if (c === "regions") return (!!a.city && !["tbilisi", "batumi", "kutaisi"].includes(a.city)) || (!a.city && !!a.place);
  return a.city === c;
}

export const dynamic = "force-dynamic";

const TITLE = "Журнал NomerOk: дом, ремонт и жизнь в Грузии";
const DESC = "Практичные советы для жизни в Батуми и Грузии: что делать, если пропал свет или вода, как выбрать мастера, снять квартиру, найти няню или репетитора. И советы для специалистов.";

export async function generateMetadata({ params, searchParams }: LangParams & { searchParams: Promise<{ r?: string }> }): Promise<Metadata> {
  const lang = await langOf(params);
  if (lang !== "ru") return { robots: { index: false } };
  const r = (await searchParams).r;
  const rub = r && r in RUBRICS ? RUBRICS[r as Rubric] : null;
  const base = pageMeta(lang, "/guide", rub ? `${rub.label} — журнал NomerOk` : TITLE, DESC);
  return { ...base, alternates: { canonical: "/ru/guide" } };
}

function Cover({ a, big }: { a: Article; big?: boolean }) {
  const rub = RUBRICS[a.rubric ?? "home"];
  return (
    <span className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${rub.bg} ${big ? "aspect-[16/10] sm:aspect-auto sm:h-full sm:min-h-64" : "aspect-[16/10]"}`}>
      {a.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.cover} alt="" className="absolute inset-0 h-full w-full object-cover" style={posStyle(a.cover)} loading="lazy" />
      ) : (
        <span className={big ? "text-[84px]" : "text-[56px]"} aria-hidden>
          {a.emoji}
        </span>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[12px] font-semibold text-ink backdrop-blur">
        {rub.emoji} {rub.label}
      </span>
      {whereOf(a) && <span className="absolute bottom-3 left-3 rounded-full bg-ink/75 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur">📍 {whereOf(a)}</span>}
    </span>
  );
}

function Meta({ a, views }: { a: Article; views?: number }) {
  return (
    <span className="mt-2 block text-[12px] text-muted">
      {formatArticleDate(a.date)} · {readingMinutes(a)} мин чтения{views ? ` · 👁 ${views}` : ""}
    </span>
  );
}

export default async function GuideList({ params, searchParams }: LangParams & { searchParams: Promise<{ r?: string; c?: string }> }) {
  const lang = await langOf(params);
  if (lang !== "ru") notFound();
  const { r, c: cRaw } = await searchParams;
  const c = CITY_TABS.some(([k]) => k === cRaw) ? cRaw! : null;
  const active = r && r in RUBRICS ? (r as Rubric) : null;
  const ARTICLES = await journalArticles();
  const views = await articleViews().catch(() => ({}) as Record<string, number>);
  // На общей странице — только 12 свежих новостей и анонсов, остальные — в рубриках «Новости» и «Афиша»
  let newsSeen = 0;
  const list = c
    ? ARTICLES.filter((a) => (a.rubric === "news" || a.rubric === "events" || a.rubric === "travel") && (!active || a.rubric === active) && matchCity(a, c))
    : active
    ? ARTICLES.filter((a) => a.rubric === active)
    : ARTICLES.filter((a) => (a.rubric === "news" || a.rubric === "events" ? ++newsSeen <= 12 : true));
  const first: Article | null = active || c ? null : list[0] ?? null;
  const rest = active || c ? list : list.slice(1);
  const chip = (on: boolean) => `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${on ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"}`;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-[28px] font-bold sm:text-[36px]">Журнал NomerOk</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{DESC}</p>

      <nav className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link href={href(lang, "/guide")} className={chip(!active)}>
          Все статьи
        </Link>
        {(Object.keys(RUBRICS) as Rubric[]).map((k) => (
          <Link key={k} href={href(lang, `/guide?r=${k}`)} className={chip(active === k)}>
            {RUBRICS[k].emoji} {RUBRICS[k].label}
          </Link>
        ))}
      </nav>
      {(!active || active === "news" || active === "events" || active === "travel") && (
        <nav className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Город">
          <Link href={href(lang, `/guide${active ? `?r=${active}` : ""}`)} className={chip(!c)}>
            📍 Все города
          </Link>
          {CITY_TABS.map(([k, label]) => (
            <Link key={k} href={href(lang, `/guide?${active ? `r=${active}&` : ""}c=${k}`)} className={chip(c === k)}>
              {label}
            </Link>
          ))}
        </nav>
      )}
      {c && list.length === 0 && <p className="mt-6 rounded-2xl bg-cream p-5 text-[14px] text-muted">Здесь пока нет заметок — загляните через пару дней.</p>}

      {first && (
        <Link href={href(lang, `/guide/${first.slug}`)} className="group mt-6 grid overflow-hidden rounded-3xl border border-line bg-white transition hover:shadow-md sm:grid-cols-2">
          <Cover a={first} big />
          <span className="flex flex-col justify-center p-5 sm:p-8">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-brand">Новое</span>
            <span className="mt-1 block text-[22px] font-bold leading-snug group-hover:text-brand sm:text-[26px]">{first.h1}</span>
            <span className="mt-2 block text-[15px] leading-relaxed text-muted">{first.description}</span>
            <Meta a={first} views={views[first.slug]} />
          </span>
        </Link>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <Link key={a.slug} href={href(lang, `/guide/${a.slug}`)} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-md">
            <Cover a={a} />
            <span className="flex grow flex-col p-4">
              <span className="block text-[16px] font-semibold leading-snug group-hover:text-brand">{a.h1}</span>
              <span className="mt-1.5 line-clamp-2 block text-[13px] leading-relaxed text-muted">{a.description}</span>
              <span className="grow" />
              <Meta a={a} views={views[a.slug]} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
