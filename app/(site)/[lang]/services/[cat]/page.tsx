import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublishedMasters } from "@/lib/db";
import { CATEGORIES, categoryPlural } from "@/lib/categories";
import { href, isLocale, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { seoCategoryIds, seoText } from "@/lib/seo-categories";
import { MasterCard, priceText } from "@/components/MasterCard";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; cat: string }> };

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, cat } = await params;
  if (!isLocale(lang)) return {};
  const t = seoText(cat, lang);
  if (!t) return {};
  return pageMeta(lang, `/services/${cat}`, t.title, t.description);
}

export default async function ServicePage({ params }: Props) {
  const { lang, cat } = await params;
  if (!isLocale(lang)) notFound();
  const t = seoText(cat, lang);
  if (!t) notFound();
  const l = L[lang];

  const all = await listPublishedMasters().catch(() => []);
  const masters = all.filter(
    (m) => m.category === cat || m.extra_categories.includes(cat),
  );
  // Цена «от» — только по настоящим специалистам, примеры не считаем
  const priced = masters
    .filter((m) => !m.demo && m.category === cat && m.price_from != null)
    .sort((a, b) => a.price_from! - b.price_from!);
  const price = priced[0] ? priceText(priced[0], lang).toLowerCase() : null;
  const faq = [{ q: t.priceQ, a: t.priceA(price) }, ...t.faq];

  const group = CATEGORIES.find((c) => c.id === cat)?.group;
  const related = CATEGORIES.filter((c) => c.group === group && c.id !== cat);
  const hasPage = new Set(seoCategoryIds());
  const requestHref = href(lang, `/request?category=${cat}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
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
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8">
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
        {t.h1}
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[#3a3935]">
        {t.lead}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={requestHref} className="btn-primary h-11">
          {l.request}
        </Link>
      </div>

      {masters.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {masters.map((m) => (
            <MasterCard key={m.id} m={m} lang={lang} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-line bg-cream p-6 text-center text-[15px] text-muted">
          {l.empty}
        </p>
      )}

      {masters.length > 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-brand/40 bg-brand-soft p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="font-semibold text-brand-dark">{l.notFound}</p>
            <p className="mt-1 text-[14px] text-[#3d5a4c]">{l.notFoundText}</p>
          </div>
          <Link
            href={requestHref}
            className="btn-primary mt-3 h-11 shrink-0 sm:mt-0"
          >
            {l.request}
          </Link>
        </div>
      )}

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
  );
}
