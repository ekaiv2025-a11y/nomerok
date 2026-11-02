import type { Metadata } from "next";
import { articlesForCat } from "@/lib/articles";
import { guideFor } from "@/lib/seo/guides";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localizeMasters } from "@/lib/translate-db";
import { listPublishedMasters } from "@/lib/db";
import { CATEGORIES, categoryPlural } from "@/lib/categories";
import { href, isLocale, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { seoCategoryIds, seoText } from "@/lib/seo-categories";
import { MasterCard, priceText } from "@/components/MasterCard";
import { SITE_URL } from "@/lib/site";
import { DISTRICTS } from "@/lib/districts";
import { Catalog } from "@/components/Catalog";
import { Map as MapView } from "@/components/map/Map";
import { masterPoint } from "@/components/map/master-point";
import { cityIn, cityOf } from "@/lib/cities";

/* Где клиент обычно приходит к специалисту — для них показываем карту «Где принимают». */
const MAP_CATS = new Set(["beauty", "massage", "dentist", "doctor", "vet", "psychologist", "fitness", "tutor", "languages", "music", "speech", "photo", "food", "art", "lawyer", "accountant", "translator", "realtor", "appliances", "furniture"]);
const MAP_T = { ru: "Где принимают", en: "Where they receive clients", ka: "სად იღებენ" } as const;
const MAP_NOTE = { ru: "Показаны специалисты, которые указали адрес, где принимают клиентов. Нажмите на точку — откроется анкета.", en: "Specialists who listed an address where they see clients. Tap a pin to open the profile.", ka: "ნაჩვენებია სპეციალისტები, რომლებმაც მიუთითეს მისამართი. დააჭირეთ წერტილს — გაიხსნება ანკეტა." } as const;
const OTHER_LEAD = {
  ru: (c: string) => `Специалисты ${c}: фото работ, цены и отзывы. Пишите напрямую или оставьте заявку — свободные откликнутся сами.`,
  en: (c: string) => `Specialists ${c}: work photos, prices and reviews. Contact directly or post a request — those who are free will respond.`,
  ka: (c: string) => `სპეციალისტები ${c}: ნამუშევრების ფოტოები, ფასები და შეფასებები. დაუკავშირდით პირდაპირ ან დატოვეთ განაცხადი.`,
} as const;

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; cat: string }>; searchParams: Promise<{ city?: string }> };
const DIST_LABEL = { ru: "По районам:", en: "By area:", ka: "უბნების მიხედვით:" } as const;

const L: Record<
  Locale,
  {
    home: string;
    empty: string;
    notFound: string;
    notFoundText: string;
    request: string;
    all: string;
    faq: string;
    other: string;
  }
> = {
  ru: {
    home: "Все специалисты",
    empty:
      "Скоро здесь появятся специалисты. А пока оставьте заявку — мы найдём мастера.",
    notFound: "Не нашли подходящего?",
    notFoundText:
      "Опишите задачу — заявку получат все специалисты этого направления, свободные откликнутся сами.",
    request: "Разместить заявку",
    all: "Все направления →",
    faq: "Частые вопросы",
    other: "Другие направления",
  },
  en: {
    home: "All specialists",
    empty:
      "Specialists will appear here soon. Meanwhile, post a request and we'll find someone.",
    notFound: "Didn't find the right one?",
    notFoundText:
      "Describe the job — every specialist in this field gets it, and those who are free will respond.",
    request: "Post a request",
    all: "All categories →",
    faq: "FAQ",
    other: "Other services",
  },
  ka: {
    home: "ყველა სპეციალისტი",
    empty: "სპეციალისტები მალე გამოჩნდებიან. მანამდე დატოვეთ განაცხადი.",
    notFound: "ვერ იპოვეთ შესაფერისი?",
    notFoundText:
      "აღწერეთ ამოცანა — განაცხადს ამ მიმართულების ყველა სპეციალისტი მიიღებს.",
    request: "განაცხადის განთავსება",
    all: "ყველა მიმართულება →",
    faq: "ხშირი კითხვები",
    other: "სხვა მიმართულებები",
  },
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang, cat } = await params;
  if (!isLocale(lang)) return {};
  const t = seoText(cat, lang);
  if (!t) return {};
  const city = cityOf((await searchParams).city);
  if (city !== "batumi") {
    const h = `${categoryPlural(cat, lang)} ${cityIn(city, lang)}`;
    return pageMeta(lang, `/services/${cat}?city=${city}`, `${h} — NomerOk`, OTHER_LEAD[lang](cityIn(city, lang)));
  }
  return pageMeta(lang, `/services/${cat}`, t.title, t.description);
}

export default async function ServicePage({ params, searchParams }: Props) {
  const { lang, cat } = await params;
  const city = cityOf((await searchParams).city);
  const batumi = city === "batumi";
  if (!isLocale(lang)) notFound();
  const t = seoText(cat, lang);
  if (!t) notFound();
  const l = L[lang];

  const all = await localizeMasters(await listPublishedMasters().catch(() => []), lang);
  const masters = all.filter((m) => (m.city ?? "batumi") === city && (m.category === cat || m.extra_categories.includes(cat)));
  const mapPoints = MAP_CATS.has(cat)
    ? masters
        .filter((m) => m.place_lat != null && m.place_lng != null && (m.work_mode === "at_place" || m.work_mode === "both"))
        .map((m) => masterPoint(m, lang))
    : [];
  // Цена «от» — только по настоящим специалистам, примеры не считаем
  const priced = masters
    .filter((m) => !m.demo && m.category === cat && m.price_from != null)
    .sort((a, b) => a.price_from! - b.price_from!);
  const price = priced[0] ? priceText(priced[0], lang).toLowerCase() : null;
  const faq = [{ q: t.priceQ, a: t.priceA(price) }, ...t.faq];
  const guide = guideFor(cat, lang);

  const group = CATEGORIES.find((c) => c.id === cat)?.group;
  const related = CATEGORIES.filter((c) => c.group === group && c.id !== cat);
  const hasPage = new Set(seoCategoryIds());
  const requestHref = href(lang, `/request?category=${cat}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      ...(batumi ? [{
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }] : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: l.home,
            item: `${SITE_URL}/${lang}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: t.h1,
            item: `${SITE_URL}/${lang}/services/${cat}`,
          },
        ],
      },
    ],
  };

  return (
    <>
    <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-[14px] text-muted">
        <Link href={href(lang)} className="hover:text-ink">
          {l.home}
        </Link>{" "}
        / <span className="text-ink">{categoryPlural(cat, lang)}</span>
      </nav>

      <h1 className="mt-4 text-[28px] font-bold leading-tight sm:text-[38px]">
        {batumi ? t.h1 : `${categoryPlural(cat, lang)} ${cityIn(city, lang)}`}
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[#3a3935]">
        {batumi ? t.lead : OTHER_LEAD[lang](cityIn(city, lang))}
      </p>
    </div>

    {/* Каталог с поиском, уточнениями и фильтрами — как на главной, направление уже выбрано */}
    <div className="mt-6">
      <Catalog masters={all} lang={lang} city={city} pageCat={cat} catPages={seoCategoryIds()} />
    </div>

    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      {mapPoints.length >= 2 && (
        <section className="mt-10">
          <h2 className="text-[20px] font-bold">📍 {MAP_T[lang]}</h2>
          <p className="mt-1 text-[14px] text-muted">{MAP_NOTE[lang]}</p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white p-2">
            <MapView height={420} points={mapPoints} />
          </div>
        </section>
      )}

      {batumi && (<div className="mt-6 flex flex-wrap items-center gap-2 text-[14px]">
        <span className="text-muted">{DIST_LABEL[lang]}</span>
        {DISTRICTS.map((d) => (
          <Link key={d.id} href={href(lang, `/services/${cat}/${d.id}`)} className="rounded-full border border-line bg-white px-3 py-1 hover:border-ink">
            {d.name[lang]}
          </Link>
        ))}
      </div>)}

      {batumi && (<>
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-[20px] font-bold">{t.servicesTitle}</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-[#3a3935]">
            {t.services.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-brand">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-[20px] font-bold">{t.chooseTitle}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-[#3a3935]">
            {t.choose.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
      </div>

      {guide && (
        <article className="mt-14 max-w-3xl">
          <h2 className="text-[24px] font-bold leading-tight sm:text-[28px]">{guide.h}</h2>
          <p className="mt-4 text-[16px] leading-[1.7] text-[#3a3935]">{guide.intro}</p>
          {guide.sections.map((sec) => (
            <section key={sec.h} className="mt-8">
              <h3 className="text-[19px] font-bold leading-snug">{sec.h}</h3>
              {sec.p.map((x, i) => (
                <p key={i} className="mt-3 text-[16px] leading-[1.7] text-[#3a3935]">
                  {x}
                </p>
              ))}
              {sec.list && (
                <ul className="mt-3 space-y-2 text-[16px] leading-relaxed text-[#3a3935]">
                  {sec.list.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="text-brand">•</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              )}
              {sec.after?.map((x, i) => (
                <p key={i} className="mt-3 text-[16px] leading-[1.7] text-[#3a3935]">
                  {x}
                </p>
              ))}
            </section>
          ))}
          <div className="mt-8 rounded-2xl bg-brand-soft p-5">
            <p className="font-semibold text-brand-dark">{l.notFound}</p>
            <p className="mt-1 text-[14px] text-[#3d5a4c]">{l.notFoundText}</p>
            <Link href={requestHref} className="btn-primary mt-3 h-11">
              {l.request}
            </Link>
          </div>
        </article>
      )}

      <section className="mt-12 max-w-3xl">
        <h2 className="text-[20px] font-bold">{l.faq}</h2>
        <div className="mt-3 divide-y divide-line rounded-2xl border border-line">
          {faq.map((f) => (
            <details key={f.q} className="group px-4 py-3">
              <summary className="cursor-pointer list-none font-semibold marker:hidden">
                <span className="mr-2 inline-block text-brand transition group-open:rotate-90">
                  ›
                </span>
                {f.q}
              </summary>
              <p className="mt-2 pl-4 text-[15px] leading-relaxed text-[#3a3935]">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {lang === "ru" && articlesForCat(cat).length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-[20px] font-bold">💡 Полезно знать</h2>
          <div className="mt-3 grid gap-2">
            {articlesForCat(cat).map((x) => (
              <Link key={x.slug} href={`/ru/guide/${x.slug}`} className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] hover:border-brand">
                {x.emoji} {x.h1}
              </Link>
            ))}
          </div>
        </section>
      )}

      </>)}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[20px] font-bold">{l.other}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map((c) => (
              <Link
                key={c.id}
                href={
                  hasPage.has(c.id)
                    ? href(lang, `/services/${c.id}`)
                    : `${href(lang)}?cat=${c.id}`
                }
                className="rounded-full border border-line bg-white px-4 py-2 text-[14px] hover:bg-cream"
              >
                {categoryPlural(c.id, lang)}
              </Link>
            ))}
            <Link
              href={href(lang)}
              className="rounded-full px-4 py-2 text-[14px] font-semibold text-brand hover:underline"
            >
              {l.all}
            </Link>
          </div>
        </section>
      )}
    </div>
    </>
  );
}
