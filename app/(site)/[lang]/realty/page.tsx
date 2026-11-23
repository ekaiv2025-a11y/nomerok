import type { Metadata } from "next";
import { AlertButton } from "@/components/AlertButton";
import Link from "next/link";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { href, type Locale } from "@/lib/i18n";
import { listListings } from "@/lib/realty-db";
import { KINDS, DEALS, DISTRICTS } from "@/lib/realty";
import { localizeMasters } from "@/lib/translate-db";
import { listPublishedMasters } from "@/lib/db";
import { CITIES, cityIn, cityOf } from "@/lib/cities";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

const T = {
  ru: { title: (c: string) => `Недвижимость ${c}: аренда квартир, посуточно, продажа`, h1: "Недвижимость", lead: "Аренда квартир помесячно и посуточно, продажа и сдача под залог — от собственников, агентов, агентств и застройщиков. Видно, кто разместил объявление.", all: "Все", rooms: "Спальни", studio: "Студия", price: "Цена до", district: "Район", any: "Любой", find: "Показать", empty: "По этим условиям пока нет объявлений. Оставьте заявку — риелторы подберут варианты.", req: "Оставить заявку риелторам", found: (n: number) => `Найдено: ${n}`, realtor: "Вы риелтор?", realtorText: "Публикуйте объявления бесплатно — вручную или автоматически из своего Telegram-канала.", realtorBtn: "Как подключить", more: "Ещё" },
  en: { title: (c: string) => `Real estate ${c}: rentals, daily rentals, sales`, h1: "Real estate", lead: "Long-term and daily rentals, sales and pledge rentals — from owners, agents, agencies and developers. You see who posted each listing.", all: "All", rooms: "Bedrooms", studio: "Studio", price: "Price up to", district: "District", any: "Any", find: "Show", empty: "No listings match yet. Leave a request and agents will offer options.", req: "Request to agents", found: (n: number) => `Found: ${n}`, realtor: "Are you an agent?", realtorText: "Post listings for free — manually or automatically from your Telegram channel.", realtorBtn: "How to connect", more: "More" },
  ka: { title: (c: string) => `უძრავი ქონება ${c}: ქირა და გაყიდვა რიელტორებისგან`, h1: "უძრავი ქონება", lead: "ბინები ქირით, დღიურად და გასაყიდად — მხოლოდ რიელტორებისა და სააგენტოებისგან, რომლებსაც NomerOk-ზე ანკეტა აქვთ.", all: "ყველა", rooms: "საძინებელი", studio: "სტუდიო", price: "ფასი მდე", district: "რაიონი", any: "ნებისმიერი", find: "ჩვენება", empty: "ამ პირობებით განცხადებები ჯერ არ არის. დატოვეთ განაცხადი — რიელტორები შეგირჩევენ.", req: "განაცხადი რიელტორებს", found: (n: number) => `ნაპოვნია: ${n}`, realtor: "რიელტორი ხართ?", realtorText: "განათავსეთ განცხადებები უფასოდ — ხელით ან ავტომატურად თქვენი Telegram-არხიდან.", realtorBtn: "როგორ დავაკავშიროთ", more: "მეტი" },
} as const;

type SP = { city?: string; deal?: string; rooms?: string; max?: string; min?: string; district?: string; page?: string; kind?: string; area?: string; new?: string; reno?: string; am?: string; owner?: string; floor?: string; sort?: string };
const XF = {
  ru: { kind: "Тип", area: "Площадь от, м²", new: "Новостройка", reno: "С ремонтом", sea: "🌊 Вид на море", pets: "🐾 С животными", balcony: "🪴 Балкон" },
  en: { kind: "Type", area: "Area from, m²", new: "New building", reno: "Renovated", sea: "🌊 Sea view", pets: "🐾 Pets allowed", balcony: "🪴 Balcony" },
  ka: { kind: "ტიპი", area: "ფართი დან, მ²", new: "ახალი აშენებული", reno: "გარემონტებული", sea: "🌊 ზღვის ხედი", pets: "🐾 ცხოველებით", balcony: "🪴 აივანი" },
} as const;

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
  const kind = sp.kind && sp.kind in KINDS ? sp.kind : undefined;
  const minArea = Number(sp.area) > 0 ? Number(sp.area) : undefined;
  const amenity = sp.am && ["sea_view", "pets_ok", "balcony"].includes(sp.am) ? sp.am : undefined;
  const xf = XF[lang];
  const [{ items, total }, masters] = await Promise.all([
    listListings({
      city,
      deal,
      rooms,
      maxPrice,
      minPrice: Number(sp.min) > 0 ? Number(sp.min) : undefined,
      district: sp.district || undefined,
      page,
      kind,
      minArea,
      building: sp.new === "1" ? "new" : undefined,
      renovated: sp.reno === "1",
      amenity,
      owner: sp.owner === "1",
      minFloor: Number(sp.floor) > 0 ? Number(sp.floor) : undefined,
      sort: sp.sort === "cheap" || sp.sort === "expensive" ? sp.sort : undefined,
    }),
    listPublishedMasters().then((x) => localizeMasters(x, lang)).catch(() => []),
  ]);
  const byId = new Map(masters.map((m) => [m.id, m]));
  // Раздел открыт всегда (23.11.2026): разместить объект может любой — пустой раздел зовёт стать первым
  // объявления риелторов — только с живой анкетой; собственники, агенты и застройщики без анкеты — как есть
  const list = items.filter((l) => !l.master_id || byId.has(l.master_id));
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
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{ADD_T[lang].lead}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={href(lang, "/realty/add")} className="btn h-11 rounded-full bg-accent px-5 text-[15px] font-semibold text-ink hover:bg-[#cf9620]">
          {ADD_T[lang].btn}
        </Link>
        {lang === "ru" && (
          <Link href="/ru/novostroyki" className="btn-ghost h-11 px-4 text-[14px]">
            🏗 Новостройки
          </Link>
        )}
      </div>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {[{ k: "", l: t.all }, ...Object.entries(DEALS).map(([k, v]) => ({ k, l: v[lang] }))].map((d) => (
          <Link key={d.k} href={qs({ deal: d.k || undefined, page: undefined })} className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold ${(deal ?? "") === d.k ? "bg-ink text-white" : "bg-cream"}`}>
            {d.l}
          </Link>
        ))}
      </div>

      <form method="get" className="mt-3 flex flex-wrap items-center gap-2">
        {deal && <input type="hidden" name="deal" value={deal} />}
        {sp.new === "1" && <input type="hidden" name="new" value="1" />}
        {sp.reno === "1" && <input type="hidden" name="reno" value="1" />}
        {amenity && <input type="hidden" name="am" value={amenity} />}
        <select name="city" defaultValue={city} className={`${sel} w-auto`}>
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label[lang]}
            </option>
          ))}
        </select>
        <select name="rooms" defaultValue={sp.rooms ?? ""} className={`${sel} w-auto`}>
          <option value="">{t.rooms}: {t.any}</option>
          <option value="0">{t.studio}</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3+</option>
        </select>
        {(DISTRICTS[city] ?? []).length > 0 && (
          <select name="district" defaultValue={sp.district ?? ""} className={`${sel} w-auto`}>
            <option value="">{t.district}: {t.any}</option>
            {DISTRICTS[city].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
        <select name="kind" defaultValue={kind ?? ""} className={`${sel} w-auto`}>
          <option value="">{xf.kind}: {t.any}</option>
          {Object.entries(KINDS).map(([k, v]) => (
            <option key={k} value={k}>
              {v[lang]}
            </option>
          ))}
        </select>
        <input name="max" type="number" min={0} defaultValue={sp.max ?? ""} placeholder={t.price} className={`${sel} w-32`} />
        <input name="area" type="number" min={0} defaultValue={sp.area ?? ""} placeholder={xf.area} className={`${sel} w-40`} />
        <input name="floor" type="number" min={1} defaultValue={sp.floor ?? ""} placeholder={MORE_T[lang].floor} className={`${sel} w-28`} />
        <select name="sort" defaultValue={sp.sort ?? ""} className={`${sel} w-auto`}>
          <option value="">{MORE_T[lang].fresh}</option>
          <option value="cheap">{MORE_T[lang].cheap}</option>
          <option value="expensive">{MORE_T[lang].expensive}</option>
        </select>
        {sp.owner === "1" && <input type="hidden" name="owner" value="1" />}
        <button className="btn-primary h-10 px-5 text-[14px]">{t.find}</button>
      </form>
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
        {(
          [
            ["owner", MORE_T[lang].owner, sp.owner === "1", { owner: sp.owner === "1" ? undefined : "1" }],
            ["new", xf.new, sp.new === "1", { new: sp.new === "1" ? undefined : "1" }],
            ["reno", xf.reno, sp.reno === "1", { reno: sp.reno === "1" ? undefined : "1" }],
            ["sea", xf.sea, amenity === "sea_view", { am: amenity === "sea_view" ? undefined : "sea_view" }],
            ["balcony", xf.balcony, amenity === "balcony", { am: amenity === "balcony" ? undefined : "balcony" }],
            ["pets", xf.pets, amenity === "pets_ok", { am: amenity === "pets_ok" ? undefined : "pets_ok" }],
          ] as [string, string, boolean, Partial<SP>][]
        ).map(([k, label, on, patch]) => (
          <Link key={k} href={qs({ ...patch, page: undefined })} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] ${on ? "border-brand bg-brand-soft font-semibold text-brand-dark" : "border-line bg-white"}`}>
            {on ? "✓ " : ""}
            {label}
          </Link>
        ))}
      </div>

      {lang === "ru" && (
        <div className="mt-3">
          <AlertButton city={city} defaultDeal={deal} label="🔔 Сообщать о новых объявлениях в Telegram" />
        </div>
      )}
      <p className="mt-4 text-[13px] text-muted">{t.found(total)}</p>
      {list.length ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((l) => (
            <ListingCard key={l.id} l={l} lang={lang} realtor={l.master_id ? byId.get(l.master_id) : l.contact_name ? { name: l.contact_name } : null} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-line bg-cream p-6 text-center">
          <p className="text-[15px] text-muted">{t.empty}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Link href={href(lang, `/request?category=realtor${city !== "batumi" ? `&city=${city}` : ""}`)} className="btn-primary h-11 px-5">
              {t.req}
            </Link>
            <Link href={href(lang, "/realty/add")} className="btn-ghost h-11 px-5">
              {ADD_T[lang].btn}
            </Link>
          </div>
          <p className="mt-3 text-[13px] text-muted">{MORE_T[lang].first}</p>
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
          <p className="font-semibold text-brand-dark">{ADD_T[lang].title}</p>
          <p className="mt-1 text-[14px] text-[#3d5a4c]">{ADD_T[lang].text}</p>
        </div>
        <div className="mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0">
          <Link href={href(lang, "/realty/add")} className="btn-primary h-11 px-5">
            {ADD_T[lang].btn}
          </Link>
          <Link href={href(lang, "/realty/agents")} className="btn-ghost h-11 px-4 text-[14px]">
            {t.realtorBtn}
          </Link>
        </div>
      </section>
    </div>
  );
}

const ADD_T = {
  ru: { lead: "Аренда квартир помесячно и посуточно, продажа, сдача под залог — от собственников, агентов, агентств и застройщиков. Видно, кто разместил объявление; объявления проверяет администратор.", title: "Продаёте или сдаёте недвижимость?", text: "Разместить объект может любой — собственник, агент, агентство или застройщик. Бесплатно, проверка администратором — обычно в течение дня. Риелторы могут подключить свой Telegram-канал.", btn: "+ Разместить объект" },
  en: { lead: "Long-term and daily rentals, sales and pledge rentals — from owners, agents, agencies and developers. You see who posted each listing; listings are reviewed by the administrator.", title: "Selling or renting out property?", text: "Anyone can post — owner, agent, agency or developer. Free; reviewed by the administrator, usually within a day. Agents can connect their Telegram channel.", btn: "+ Post a property" },
  ka: { lead: "ბინები ქირით, დღიურად, გასაყიდად და გირავდება — მესაკუთრეებისგან, აგენტებისგან, სააგენტოებისა და დეველოპერებისგან.", title: "ყიდით ან აქირავებთ?", text: "ობიექტის განთავსება ყველას შეუძლია — მესაკუთრეს, აგენტს, სააგენტოს, დეველოპერს. უფასოდ.", btn: "+ ობიექტის განთავსება" },
} as const;

const MORE_T = {
  ru: { floor: "Этаж от", fresh: "Сначала новые", cheap: "Сначала дешевле", expensive: "Сначала дороже", owner: "🔑 Только собственники", first: "Сдаёте или продаёте? Разместите объект бесплатно — он появится здесь после проверки." },
  en: { floor: "Floor from", fresh: "Newest first", cheap: "Cheapest first", expensive: "Most expensive first", owner: "🔑 Owners only", first: "Renting out or selling? Post your property for free — it will appear here after review." },
  ka: { floor: "სართული დან", fresh: "ჯერ ახალი", cheap: "ჯერ იაფი", expensive: "ჯერ ძვირი", owner: "🔑 მხოლოდ მესაკუთრეები", first: "აქირავებთ ან ყიდით? განათავსეთ უფასოდ." },
} as const;
