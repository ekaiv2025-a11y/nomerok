import { articlesForCat } from "@/lib/articles";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localizeMasters } from "@/lib/translate-db";
import { listPublishedMasters } from "@/lib/db";
import { categoryPlural } from "@/lib/categories";
import { href, isLocale, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { seoCategoryIds } from "@/lib/seo-categories";
import { SUBCATS, subcatsOf } from "@/lib/subcats";
import { Catalog } from "@/components/Catalog";
import { cityIn, inScope, pageScopeOf } from "@/lib/cities";
import { SITE_URL } from "@/lib/site";
import type { PublicMaster } from "@/lib/types";

/*
 * Страница подраздела: «Сборка мебели в Батуми», «Педиатр в Батуми»…
 * Ловит узкий поисковый запрос. Цены — только из прайсов анкет на сайте (настоящие), текст — общий и честный.
 */
type Props = { params: Promise<{ lang: string; cat: string; district: string }>; searchParams?: Promise<{ city?: string }> };

/** Адрес /services/<cat>/<x>: x — район (district) или подраздел (sub). Подраздел ли это? */
export function isSubcat(cat: string, x: string) {
  return !!SUBCATS[cat]?.some((s) => s.id === x);
}

const T = {
  ru: {
    home: "Все специалисты",
    lead: (sub: string, c: string) => `${sub} ${c}: анкеты специалистов с ценами, фото работ и отзывами. Пишите напрямую — без посредников и процентов. Или оставьте заявку, и свободные специалисты откликнутся сами.`,
    prices: "Цены по анкетам на сайте",
    priceRange: (a: number, b: number, n: number) => (a === b ? `от ${a} ₾` : `от ${a} до ${b} ₾`) + ` · ${n} ${n % 10 === 1 && n % 100 !== 11 ? "предложение" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "предложения" : "предложений"}`,
    priceNote: "Это цены «от» из прайсов специалистов. Точную стоимость называют после описания задачи — пришлите фото, так быстрее.",
    tipsH: (sub: string) => `Как договориться: ${sub.toLowerCase()}`,
    tips: ["Опишите задачу конкретно и приложите фото — так мастер сразу назовёт цену.", "Спросите, что входит в стоимость: выезд, материалы, вывоз мусора.", "Уточните сроки и гарантию на работу.", "Посмотрите отзывы и фото работ в анкете."],
    faqH: "Частые вопросы",
    faq: (sub: string, c: string, price: string | null) => [
      { q: `Сколько стоит ${sub.toLowerCase()} ${c}?`, a: price ? `По прайсам специалистов на сайте — ${price}. Итоговая цена зависит от объёма работы: пришлите фото и описание.` : "Цену обычно называют после описания задачи и фото. Оставьте заявку — специалисты сами напишут, сколько это будет стоить." },
      { q: `Как найти специалиста ${c}?`, a: "Выберите анкету выше и напишите или позвоните напрямую. Или разместите заявку — её получат специалисты этого направления." },
      { q: "Нужно ли платить NomerOk?", a: "Нет, для клиентов бесплатно. Цену и оплату вы обсуждаете со специалистом напрямую." },
    ],
    request: "Оставить заявку",
    others: "Другие услуги",
    meta: (sub: string, c: string) => `${sub} ${c} — цены, специалисты, отзывы`,
    metaD: (sub: string, c: string, price: string | null) => `${sub} ${c}: анкеты с ценами${price ? ` (${price})` : ""}, фото работ и отзывы. Пишите напрямую или оставьте заявку.`,
  },
  en: {
    home: "All specialists",
    lead: (sub: string, c: string) => `${sub} ${c}: specialist profiles with prices, work photos and reviews. Contact directly — no middlemen — or post a request.`,
    prices: "Prices from profiles on the site",
    priceRange: (a: number, b: number, n: number) => (a === b ? `from ${a} ₾` : `${a}–${b} ₾`) + ` · ${n} offers`,
    priceNote: "These are starting prices from specialists' price lists. Send photos of the task for an exact quote.",
    tipsH: (sub: string) => `How to agree on ${sub.toLowerCase()}`,
    tips: ["Describe the task and attach photos.", "Ask what's included: call-out, materials, cleanup.", "Agree on timing and a guarantee.", "Check reviews and work photos."],
    faqH: "FAQ",
    faq: (sub: string, c: string, price: string | null) => [
      { q: `How much does ${sub.toLowerCase()} cost ${c}?`, a: price ? `According to specialists' price lists on the site: ${price}.` : "The price is usually given after you describe the task. Post a request and specialists will quote." },
      { q: "Do I pay NomerOk?", a: "No, it's free for clients." },
    ],
    request: "Post a request",
    others: "Other services",
    meta: (sub: string, c: string) => `${sub} ${c} — prices, specialists, reviews`,
    metaD: (sub: string, c: string, price: string | null) => `${sub} ${c}: profiles with prices${price ? ` (${price})` : ""}, photos and reviews.`,
  },
  ka: {
    home: "ყველა სპეციალისტი",
    lead: (sub: string, c: string) => `${sub} ${c}: სპეციალისტების პროფილები ფასებით, ნამუშევრებით და შეფასებებით.`,
    prices: "ფასები საიტის პროფილებიდან",
    priceRange: (a: number, b: number, n: number) => (a === b ? `${a} ₾-დან` : `${a}–${b} ₾`) + ` · ${n}`,
    priceNote: "ეს არის საწყისი ფასები სპეციალისტების ფასების სიიდან.",
    tipsH: (sub: string) => sub,
    tips: ["აღწერეთ დავალება და მიამაგრეთ ფოტო.", "იკითხეთ, რა შედის ფასში.", "შეათანხმეთ ვადები და გარანტია."],
    faqH: "ხშირი კითხვები",
    faq: (sub: string, c: string, price: string | null) => [{ q: `რა ღირს ${sub} ${c}?`, a: price ? `საიტის ფასების მიხედვით: ${price}.` : "ფასს ჩვეულებრივ ასახელებენ დავალების აღწერის შემდეგ." }],
    request: "განაცხადის დატოვება",
    others: "სხვა მომსახურება",
    meta: (sub: string, c: string) => `${sub} ${c} — ფასები, სპეციალისტები`,
    metaD: (sub: string, c: string) => `${sub} ${c}: პროფილები ფასებით და შეფასებებით.`,
  },
} as const;

function subOf(cat: string, sub: string) {
  return SUBCATS[cat]?.find((s) => s.id === sub) ?? null;
}

/** Цены из прайсов анкет: строки, которые подходят к подразделу (по тем же словам, что и сам подраздел). */
function priceStats(masters: PublicMaster[], cat: string, sub: string) {
  const s = subOf(cat, sub)!;
  const vals: number[] = [];
  for (const m of masters) {
    if (m.demo) continue;
    for (const x of m.price_list ?? []) if (x.from != null && x.from > 0 && s.re.test(x.name)) vals.push(x.from);
  }
  if (!vals.length) return null;
  vals.sort((a, b) => a - b);
  return { min: vals[0], max: vals[vals.length - 1], n: vals.length };
}

async function load(lang: Locale, cat: string, sub: string, city: string) {
  const all = await localizeMasters(await listPublishedMasters().catch(() => []), lang);
  const inCat = all.filter((m) => inScope(m.city, city as never) && (m.category === cat || m.extra_categories.includes(cat)));
  const matched = inCat.filter((m) => subcatsOf(m, cat).includes(sub));
  return { all: inCat, matched };
}

export async function subMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang, cat, district: sub } = await params;
  if (!isLocale(lang) || !seoCategoryIds().includes(cat) || !subOf(cat, sub)) return {};
  const city = pageScopeOf((await searchParams)?.city);
  const t = T[lang];
  const label = subOf(cat, sub)!.label[lang];
  const { matched } = await load(lang, cat, sub, city);
  const st = priceStats(matched, cat, sub);
  const price = st ? t.priceRange(st.min, st.max, st.n).split(" · ")[0] : null;
  const m = pageMeta(lang, `/services/${cat}/${sub}${city !== "batumi" ? `?city=${city}` : ""}`, t.meta(label, cityIn(city, lang)), t.metaD(label, cityIn(city, lang), price));
  // пустые страницы в поиск не отдаём, пока не появятся анкеты
  return matched.filter((x) => !x.demo).length ? m : { ...m, robots: { index: false, follow: true } };
}

export async function SubPage({ params, searchParams }: Props) {
  const { lang, cat, district: sub } = await params;
  if (!isLocale(lang) || !seoCategoryIds().includes(cat)) notFound();
  const s = subOf(cat, sub);
  if (!s) notFound();
  const city = pageScopeOf((await searchParams)?.city);
  const t = T[lang];
  const c = cityIn(city, lang);
  const label = s.label[lang];
  const { all, matched } = await load(lang, cat, sub, city);
  const st = priceStats(matched, cat, sub);
  const priceShort = st ? t.priceRange(st.min, st.max, st.n).split(" · ")[0] : null;
  const faq = t.faq(label, c, priceShort);
  const siblings = (SUBCATS[cat] ?? []).filter((x) => x.id !== sub);
  const q = city !== "batumi" ? `?city=${city}` : "";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.home, item: `${SITE_URL}/${lang}` },
          { "@type": "ListItem", position: 2, name: categoryPlural(cat, lang), item: `${SITE_URL}/${lang}/services/${cat}` },
          { "@type": "ListItem", position: 3, name: label, item: `${SITE_URL}/${lang}/services/${cat}/${sub}` },
        ],
      },
    ],
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <nav className="text-[14px] text-muted">
          <Link href={href(lang)} className="hover:text-ink">
            {t.home}
          </Link>{" "}
          /{" "}
          <Link href={href(lang, `/services/${cat}${q}`)} className="hover:text-ink">
            {categoryPlural(cat, lang)}
          </Link>{" "}
          / <span className="text-ink">{label}</span>
        </nav>
        <h1 className="mt-4 text-[28px] font-bold leading-tight sm:text-[38px]">
          {label} {c}
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[#3a3935]">{t.lead(label, c)}</p>
        {st && (
          <div className="mb-2 mt-4 inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl border border-brand/25 bg-brand-soft px-4 py-3">
            <span className="text-[13px] font-semibold text-brand-dark">💰 {t.prices}:</span>
            <span className="text-[16px] font-bold text-brand-dark">{t.priceRange(st.min, st.max, st.n)}</span>
          </div>
        )}
      </div>

      <Catalog masters={all} lang={lang} city={city} pageCat={cat} pageSub={sub} catPages={seoCategoryIds()} />

      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="grid gap-6 rounded-3xl border border-line bg-white p-5 sm:p-8 lg:grid-cols-2">
          <section>
            <h2 className="text-[20px] font-bold">{t.tipsH(label)}</h2>
            <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[#3a3935]">
              {t.tips.map((x) => (
                <li key={x} className="flex gap-2">
                  <span className="text-brand">✓</span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            {st && <p className="mt-3 text-[13px] text-muted">{t.priceNote}</p>}
            <Link href={href(lang, `/request?category=${cat}${city !== "batumi" ? `&city=${city}` : ""}`)} className="btn-primary mt-5 h-11 px-6 text-[15px]">
              {t.request}
            </Link>
          </section>
          <section>
            <h2 className="text-[20px] font-bold">{t.faqH}</h2>
            <div className="mt-3 divide-y divide-line rounded-2xl border border-line">
              {faq.map((f) => (
                <details key={f.q} className="group px-4 py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold">
                    {f.q}
                    <span className="text-muted transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
        {lang === "ru" && articlesForCat(cat, sub).filter((x) => x.subs?.includes(sub)).length > 0 && (
          <section className="mt-8">
            <h2 className="text-[18px] font-bold">💡 Полезно знать</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {articlesForCat(cat, sub)
                .filter((x) => x.subs?.includes(sub))
                .map((x) => (
                  <Link key={x.slug} href={`/ru/guide/${x.slug}`} className="flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-white hover:border-brand">
                    {x.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={x.cover} alt="" className="h-20 w-24 shrink-0 object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-20 w-24 shrink-0 items-center justify-center bg-cream text-[28px]">{x.emoji}</span>
                    )}
                    <span className="py-2 pr-3 text-[15px] font-semibold leading-snug">{x.h1}</span>
                  </Link>
                ))}
            </div>
          </section>
        )}
        {siblings.length > 0 && (
          <section className="mt-8">
            <h2 className="text-[18px] font-bold">
              {t.others}: {categoryPlural(cat, lang).toLowerCase()}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {siblings.map((x) => (
                <Link key={x.id} href={href(lang, `/services/${cat}/${x.id}${q}`)} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[14px] hover:border-brand hover:text-brand">
                  {x.label[lang]}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
