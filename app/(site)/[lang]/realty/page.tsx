import type { Metadata } from "next";
import Link from "next/link";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { href, type Locale } from "@/lib/i18n";
import { listListings } from "@/lib/realty-db";
import { DEALS, DISTRICTS } from "@/lib/realty";
import { listPublishedMasters } from "@/lib/db";
import { CITIES, cityIn, cityOf } from "@/lib/cities";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

const T = {
  ru: { title: (c: string) => `Недвижимость ${c}: аренда и продажа от риелторов`, h1: "Недвижимость", lead: "Квартиры в аренду, посуточно и на продажу — только от риелторов и агентств с анкетой на NomerOk: видно, кто публикует, его отзывы и подтверждённый номер.", all: "Все", rooms: "Спальни", studio: "Студия", price: "Цена до", district: "Район", any: "Любой", find: "Показать", empty: "По этим условиям пока нет объявлений. Оставьте заявку — риелторы подберут варианты.", req: "Оставить заявку риелторам", found: (n: number) => `Найдено: ${n}`, realtor: "Вы риелтор?", realtorText: "Публикуйте объявления бесплатно — вручную или автоматически из своего Telegram-канала.", realtorBtn: "Как подключить", more: "Ещё" },
  en: { title: (c: string) => `Real estate ${c}: rent & sale from agents`, h1: "Real estate", lead: "Apartments for rent, daily and for sale — only from agents with a NomerOk profile: you see who posts, their reviews and verified phone.", all: "All", rooms: "Bedrooms", studio: "Studio", price: "Price up to", district: "District", any: "Any", find: "Show", empty: "No listings match yet. Leave a request and agents will offer options.", req: "Request to agents", found: (n: number) => `Found: ${n}`, realtor: "Are you an agent?", realtorText: "Post listings for free — manually or automatically from your Telegram channel.", realtorBtn: "How to connect", more: "More" },
  ka: { title: (c: string) => `უძრავი ქონება ${c}: ქირა და გაყიდვა რიელტორებისგან`, h1: "უძრავი ქონება", lead: "ბინები ქირით, დღიურად და გასაყიდად — მხოლოდ რიელტორებისა და სააგენტოებისგან, რომლებსაც NomerOk-ზე ანკეტა აქვთ.", all: "ყველა", rooms: "საძინებელი", studio: "სტუდიო", price: "ფასი მდე", district: "რაიონი", any: "ნებისმიერი", find: "ჩვენება", empty: "ამ პირობებით განცხადებები ჯერ არ არის. დატოვეთ განაცხადი — რიელტორები შეგირჩევენ.", req: "განაცხადი რიელტორებს", found: (n: number) => `ნაპოვნია: ${n}`, realtor: "რიელტორი ხართ?", realtorText: "განათავსეთ განცხადებები უფასოდ — ხელით ან ავტომატურად თქვენი Telegram-არხიდან.", realtorBtn: "როგორ დავაკავშიროთ", more: "მეტი" },
} as const;

type SP = { city?: string; deal?: string; rooms?: string; max?: string; district?: string; page?: string };

export async function generateMetadata({ params, searchParams }: LangParams & { searchParams: Promise<SP> }): Promise<Metadata> {
  const lang = (await langOf(params)) as Locale;
  const sp = await searchParams;
  const city = cityOf(sp.city);
  return pageMeta(lang, "/realty", T[lang].title(cityIn(city, lang)), T[lang].lead);
}

export default async function RealtyPage({ params, searchParams }: LangParams & { searchParams: Promise<SP> }) {
  const lang = (await langOf(params)) as Locale;
  const t = T[lang];
  const sp = await searchParams;
  const city = cityOf(sp.city);
  const deal = sp.deal && sp.deal in DEALS ? sp.deal : undefined;
  const rooms = sp.rooms !== undefined && /^[0-3]$/.test(sp.rooms) ? Number(sp.rooms) : undefined;
  const maxPrice = Number(sp.max) > 0 ? Number(sp.max) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const [{ items, total }, masters] = await Promise.all([listListings({ city, deal, rooms, maxPrice, district: sp.district || undefined, page }), listPublishedMasters().catch(() => [])]);
  const byId = new Map(masters.map((m) => [m.id, m]));
  const list = items.filter((l) => byId.has(l.master_id));
  const qs = (patch: Partial<SP>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/${lang}/realty${p.toString() ? `?${p}` : ""}`;
  };
  const sel = "field h-10 rounded-full px-3 text-[14px]";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="text-[28px] font-bold leading-tight sm:text-[36px]">
        🏠 {t.h1} {cityIn(city, lang)}
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{t.lead}</p>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {[{ k: "", l: t.all }, ...Object.entries(DEALS).map(([k, v]) => ({ k, l: v[lang] }))].map((d) => (
          <Link key={d.k} href={qs({ deal: d.k || undefined, page: undefined })} className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold ${(deal ?? "") === d.k ? "bg-ink text-white" : "bg-cream"}`}>
            {d.l}
          </Link>
        ))}
      </div>

      <form method="get" className="mt-3 flex flex-wrap items-center gap-2">
        {deal && <input type="hidden" name="deal" value={deal} />}
        <select name="city" defaultValue={city} className={sel}>
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label[lang]}
            </option>
          ))}
        </select>
        <select name="rooms" defaultValue={sp.rooms ?? ""} className={sel}>
          <option value="">{t.rooms}: {t.any}</option>
          <option value="0">{t.studio}</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3+</option>
        </select>
        {(DISTRICTS[city] ?? []).length > 0 && (
          <select name="district" defaultValue={sp.district ?? ""} className={sel}>
            <option value="">{t.district}: {t.any}</option>
            {DISTRICTS[city].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
        <input name="max" type="number" min={0} defaultValue={sp.max ?? ""} placeholder={t.price} className={`${sel} w-32`} />
        <button className="btn-primary h-10 px-5 text-[14px]">{t.find}</button>
      </form>

      <p className="mt-4 text-[13px] text-muted">{t.found(total)}</p>
      {list.length ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((l) => (
            <ListingCard key={l.id} l={l} lang={lang} realtor={byId.get(l.master_id)} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-line bg-cream p-6 text-center">
          <p className="text-[15px] text-muted">{t.empty}</p>
          <Link href={href(lang, `/request?category=realtor${city !== "batumi" ? `&city=${city}` : ""}`)} className="btn-primary mt-3 h-11 px-5">
            {t.req}
          </Link>
        </div>
      )}
      {page * 24 < total && (
        <div className="mt-6 text-center">
          <Link href={qs({ page: String(page + 1) })} className="btn-ghost h-11 px-6">
            {t.more}
          </Link>
        </div>
      )}

      <section className="mt-10 rounded-2xl bg-brand-soft p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="font-semibold text-brand-dark">{t.realtor}</p>
          <p className="mt-1 text-[14px] text-[#3d5a4c]">{t.realtorText}</p>
        </div>
        <Link href={href(lang, "/cabinet?tab=realty")} className="btn-primary mt-3 h-11 shrink-0 px-5 sm:mt-0">
          {t.realtorBtn}
        </Link>
      </section>
    </div>
  );
}
