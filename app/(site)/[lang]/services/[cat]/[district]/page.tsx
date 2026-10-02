import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublishedMasters } from "@/lib/db";
import { categoryPlural } from "@/lib/categories";
import { href, isLocale, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { seoText } from "@/lib/seo-categories";
import { DISTRICTS, districtOf, servesDistrict } from "@/lib/districts";
import { MasterCard } from "@/components/MasterCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; cat: string; district: string }> };

const L: Record<Locale, { title: (c: string, d: string) => string; desc: (c: string, d: string) => string; lead: (c: string, d: string) => string; home: string; city: string; others: string; request: string; empty: string; exact: string; comes: string }> = {
  ru: {
    title: (c, d) => `${c} ${d} — Батуми, цены и контакты напрямую`,
    desc: (c, d) => `${c} ${d} (Батуми): фото работ, цены, отзывы. Звоните или пишите напрямую — без посредников.`,
    lead: (c, d) => `${c} ${d}: кто принимает рядом и кто выезжает в ваш район. Смотрите фото работ и цены, связывайтесь напрямую — или оставьте заявку.`,
    home: "Все специалисты", city: "весь Батуми", others: "Другие районы", request: "Разместить заявку",
    empty: "В этом районе пока никого нет — посмотрите специалистов по всему Батуми или оставьте заявку.", exact: "Принимают или выезжают в район", comes: "Выезжают по всему Батуми",
  },
  en: {
    title: (c, d) => `${c} ${d}, Batumi — prices and direct contacts`,
    desc: (c, d) => `${c} ${d} (Batumi): photos of work, prices, reviews. Contact directly — no middlemen.`,
    lead: (c, d) => `${c} ${d}: who works nearby and who comes to your area. See photos and prices, contact directly — or post a request.`,
    home: "All specialists", city: "all of Batumi", others: "Other areas", request: "Post a request",
    empty: "No one in this area yet — see specialists across Batumi or post a request.", exact: "Work in or come to this area", comes: "Come anywhere in Batumi",
  },
  ka: {
    title: (c, d) => `${c} ${d} — ბათუმი, ფასები და პირდაპირი კონტაქტი`,
    desc: (c, d) => `${c} ${d} (ბათუმი): ნამუშევრების ფოტოები, ფასები, შეფასებები.`,
    lead: (c, d) => `${c} ${d}: ვინ მუშაობს ახლოს და ვინ მოდის თქვენს უბანში.`,
    home: "ყველა სპეციალისტი", city: "მთელი ბათუმი", others: "სხვა უბნები", request: "განაცხადის განთავსება",
    empty: "ამ უბანში ჯერ არავინაა.", exact: "მუშაობენ ამ უბანში", comes: "მოდიან მთელ ბათუმში",
  },
};

async function load(cat: string, districtId: string) {
  const d = districtOf(districtId);
  if (!d) return null;
  const all = await listPublishedMasters().catch(() => []);
  const inCat = all.filter((m) => !m.demo && m.city === "batumi" && (m.category === cat || m.extra_categories.includes(cat)));
  const exact = inCat.filter((m) => servesDistrict(m, d) === "exact");
  const city = inCat.filter((m) => servesDistrict(m, d) === "city");
  return { d, exact, city };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, cat, district } = await params;
  if (!isLocale(lang) || !seoText(cat, lang)) return {};
  const r = await load(cat, district);
  if (!r) return {};
  const c = categoryPlural(cat, lang);
  return {
    ...pageMeta(lang, `/services/${cat}/${district}`, L[lang].title(c, r.d.inName[lang]), L[lang].desc(c, r.d.inName[lang])),
    // Страница без специалистов именно в этом районе — не отдаём поисковикам (иначе «пустые» страницы)
    ...(r.exact.length ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function DistrictPage({ params }: Props) {
  const { lang, cat, district } = await params;
  if (!isLocale(lang)) notFound();
  if (!seoText(cat, lang)) notFound();
  const r = await load(cat, district);
  if (!r) notFound();
  const l = L[lang];
  const c = categoryPlural(cat, lang);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8">
      <nav className="text-[14px] text-muted">
        <Link href={href(lang)} className="hover:text-ink">{l.home}</Link> /{" "}
        <Link href={href(lang, `/services/${cat}`)} className="hover:text-ink">{c}</Link> / <span className="text-ink">{r.d.name[lang]}</span>
      </nav>
      <h1 className="mt-4 text-[28px] font-bold leading-tight sm:text-[38px]">
        {c} {r.d.inName[lang]}
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[#3a3935]">{l.lead(c, r.d.inName[lang])}</p>
      <div className="mt-5">
        <Link href={href(lang, `/request?category=${cat}`)} className="btn-primary h-11">{l.request}</Link>
      </div>

      {r.exact.length > 0 && (
        <>
          <h2 className="mt-8 text-[19px] font-bold">{l.exact}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {r.exact.map((m) => <MasterCard key={m.id} m={m} lang={lang} />)}
          </div>
        </>
      )}
      {r.city.length > 0 && (
        <>
          <h2 className="mt-8 text-[19px] font-bold">{l.comes}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {r.city.map((m) => <MasterCard key={m.id} m={m} lang={lang} />)}
          </div>
        </>
      )}
      {r.exact.length + r.city.length === 0 && <p className="mt-8 rounded-2xl border border-dashed border-line bg-cream p-6 text-center text-[15px] text-muted">{l.empty}</p>}

      <h2 className="mt-10 text-[17px] font-bold">{l.others}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {DISTRICTS.filter((x) => x.id !== r.d.id).map((x) => (
          <Link key={x.id} href={href(lang, `/services/${cat}/${x.id}`)} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[14px] hover:border-ink">
            {x.name[lang]}
          </Link>
        ))}
      </div>
    </div>
  );
}
