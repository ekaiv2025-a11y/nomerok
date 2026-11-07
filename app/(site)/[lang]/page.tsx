import { localizeMasters } from "@/lib/translate-db";
import { LatestOrders } from "@/components/LatestOrders";
import { HomeJournal } from "@/components/HomeJournal";
import { BonusStrip } from "@/components/BonusStrip";
import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";
import { Catalog } from "@/components/Catalog";
import { seoCategoryIds } from "@/lib/seo-categories";
import { SetupNotice } from "@/components/SetupNotice";
import { listPublishedMasters } from "@/lib/db";
import { getDict, href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { SITE_NAME } from "@/lib/site";
import type { PublicMaster } from "@/lib/types";
import { cityIn, cityLabel, inScope, scopeOf } from "@/lib/cities";
import { CitySeo } from "@/components/CitySeo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: LangParams & { searchParams: Promise<{ city?: string }> }): Promise<Metadata> {
  const lang = await langOf(params);
  const t = getDict(lang).meta;
  const city = scopeOf((await searchParams).city);
  if (city === "batumi") return pageMeta(lang, "/?city=batumi", t.title(SITE_NAME), t.description);
  // Отдельный заголовок и описание для каждого города — чтобы поиск показывал страницу по запросу «мастер в Тбилиси»
  const l = cityLabel(city, lang);
  const META = {
    ru: [`Специалисты ${cityIn(city, "ru")}: мастера, репетиторы, врачи — ${SITE_NAME}`, `Каталог частных специалистов ${cityIn(city, "ru")}: ремонт, уборка, красота, репетиторы, врачи. Цены, фото работ и отзывы. Пишите напрямую или оставьте заявку.`],
    en: [`Specialists ${cityIn(city, "en")}: repairs, tutors, doctors — ${SITE_NAME}`, `Catalog of independent specialists ${cityIn(city, "en")}: repairs, cleaning, beauty, tutors, doctors. Prices, photos and reviews.`],
    ka: [`სპეციალისტები — ${l} | ${SITE_NAME}`, `კერძო სპეციალისტების კატალოგი ${cityIn(city, "ka")}: ფასები, ნამუშევრები, შეფასებები.`],
  } as const;
  return pageMeta(lang, city === "all" ? "/" : `/?city=${city}`, META[lang][0], META[lang][1]);
}

export default async function Home({ params, searchParams }: LangParams & { searchParams: Promise<{ city?: string }> }) {
  const lang = await langOf(params);
  const city = scopeOf((await searchParams).city);
  const t = getDict(lang).home;
  let masters: PublicMaster[] = [];
  let broken = false;
  try {
    masters = await localizeMasters(await listPublishedMasters(), lang);
  } catch (e) {
    // Любая ошибка базы — показываем аккуратное сообщение, а не белый экран.
    console.error("Ошибка базы. Проверьте /api/health", e);
    broken = true;
  }

  const count = masters.filter((m) => !m.demo && inScope(m.city, city)).length;
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-4 pt-5 sm:px-6 sm:pt-8">
        <div className="grid gap-6 rounded-3xl border border-line bg-cream px-5 py-6 sm:px-8 sm:py-9 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-10">
          <div>
            {count > 0 && (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12.5px] font-semibold text-brand-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden /> {HERO[lang].count(count, cityLabel(city, lang))}
              </p>
            )}
            <h1 className="mt-3 text-[30px] font-bold leading-[1.1] tracking-tight sm:text-[44px]">
              {t.h1a(cityIn(city, lang))} <span className="text-brand">{t.h1b}</span>
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted sm:text-[17px]">{t.sub}</p>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
              <a href="#masters" className="btn-primary h-12 gap-2 px-3 text-[14.5px] sm:px-6 sm:text-[15.5px]">
                <Search className="h-4.5 w-4.5" /> {HERO[lang].find}
              </a>
              <Link href={href(lang, city !== "all" ? `/request?city=${city}` : "/request")} className="btn-ghost h-12 gap-2 bg-white px-3 text-[14.5px] sm:px-6 sm:text-[15.5px]">
                <ClipboardList className="h-4.5 w-4.5" /> {t.pathRequest}
              </Link>
            </div>
            <Link href={href(lang, "/join")} className="mt-4 inline-block text-[13.5px] font-semibold text-[#8a6a1f] hover:underline">
              {t.specialistCta}
            </Link>
          </div>
          <ol className="hidden space-y-3 rounded-2xl bg-white p-5 lg:block">
            {HERO[lang].steps.map((x, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[13px] font-bold text-brand-dark">{i + 1}</span>
                <span>
                  <span className="block text-[15px] font-semibold leading-snug">{x[0]}</span>
                  <span className="block text-[13px] leading-snug text-muted">{x[1]}</span>
                </span>
              </li>
            ))}
            <li className="border-t border-line pt-3 text-[12.5px] text-muted">{HERO[lang].free}</li>
          </ol>
        </div>
      </section>
      {!broken && <BonusStrip lang={lang} masters={masters} city={city} />}
      {broken ? <SetupNotice lang={lang} /> : <Catalog key={city} masters={masters} lang={lang} city={city} catPages={seoCategoryIds()} />}
      {!broken && <LatestOrders lang={lang} />}
      {!broken && <CitySeo lang={lang} city={city} masters={masters} cats={seoCategoryIds()} />}
      <HomeJournal lang={lang} />
    </>
  );
}

const HERO = {
  ru: {
    count: (n: number, c: string) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? "специалист" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "специалиста" : "специалистов"} · ${c}`,
    find: "Найти специалиста",
    steps: [
      ["Выберите в каталоге", "Цены, фото работ и отзывы в каждой анкете"],
      ["Напишите напрямую", "Телефон или Telegram — без посредников"],
      ["Или оставьте заявку", "Свободные специалисты откликнутся сами"],
    ],
    free: "Для клиентов бесплатно · без комиссии",
  },
  en: {
    count: (n: number, c: string) => `${n} specialists · ${c}`,
    find: "Find a specialist",
    steps: [
      ["Pick from the catalog", "Prices, work photos and reviews"],
      ["Contact directly", "Phone or Telegram — no middlemen"],
      ["Or post a request", "Free specialists will respond"],
    ],
    free: "Free for clients · no commission",
  },
  ka: {
    count: (n: number, c: string) => `${n} სპეციალისტი · ${c}`,
    find: "სპეციალისტის პოვნა",
    steps: [
      ["აირჩიეთ კატალოგში", "ფასები, ნამუშევრები და შეფასებები"],
      ["დაუკავშირდით პირდაპირ", "ტელეფონი ან Telegram — შუამავლის გარეშე"],
      ["ან დატოვეთ განაცხადი", "თავისუფალი სპეციალისტები გამოგეხმაურებიან"],
    ],
    free: "კლიენტებისთვის უფასოა",
  },
} as const;
