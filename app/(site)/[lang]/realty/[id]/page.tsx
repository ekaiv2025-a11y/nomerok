import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, href, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { getListing } from "@/lib/realty-db";
import { DEALS, KINDS, autoTitle, priceLabel, roomsLabel } from "@/lib/realty";
import { getPublishedMasterBySlug, adminGetMaster } from "@/lib/db";
import { cityLabel } from "@/lib/cities";
import { categoryLabel } from "@/lib/categories";
import { ArticleGallery } from "@/components/ArticleGallery";
import { ShareButton } from "@/components/ShareButton";
import { Map } from "@/components/map/Map";

export const dynamic = "force-dynamic";

const T = {
  ru: { back: "← Недвижимость", deal: "Сделка", type: "Тип", rooms: "Спальни", area: "Площадь", floor: "Этаж", district: "Район", city: "Город", desc: "Описание", realtor: "Риелтор", contact: "Связаться с риелтором", tg: "Пост в Telegram", archived: "Объявление в архиве — возможно, уже неактуально.", share: "Поделиться", copied: "Ссылка скопирована", report: "Пожаловаться на объявление", reportWhy: "Что не так?", reasons: { gone: "Уже сдано / продано", wrong: "Неверная цена или данные", fake: "Похоже на обман", other: "Другое" }, send: "Отправить", thanks: "Спасибо! Мы проверим объявление.", added: "Опубликовано", note: "Совет: смотрите квартиру лично и не переводите предоплату, пока не увидели объект и договор." },
  en: { back: "← Real estate", deal: "Deal", type: "Type", rooms: "Bedrooms", area: "Area", floor: "Floor", district: "District", city: "City", desc: "Description", realtor: "Agent", contact: "Contact the agent", tg: "Telegram post", archived: "This listing is archived and may be outdated.", share: "Share", copied: "Link copied", report: "Report listing", reportWhy: "What's wrong?", reasons: { gone: "Already rented / sold", wrong: "Wrong price or details", fake: "Looks like a scam", other: "Other" }, send: "Send", thanks: "Thanks! We'll check it.", added: "Posted", note: "Tip: view the property in person and don't send a prepayment before you've seen it and the contract." },
  ka: { back: "← უძრავი ქონება", deal: "გარიგება", type: "ტიპი", rooms: "საძინებელი", area: "ფართი", floor: "სართული", district: "რაიონი", city: "ქალაქი", desc: "აღწერა", realtor: "რიელტორი", contact: "რიელტორთან დაკავშირება", tg: "პოსტი Telegram-ში", archived: "განცხადება არქივშია — შესაძლოა აღარ იყოს აქტუალური.", share: "გაზიარება", copied: "ბმული დაკოპირდა", report: "განცხადების გასაჩივრება", reportWhy: "რა არის არასწორი?", reasons: { gone: "უკვე გაქირავდა / გაიყიდა", wrong: "არასწორი ფასი ან მონაცემები", fake: "თაღლითობას ჰგავს", other: "სხვა" }, send: "გაგზავნა", thanks: "მადლობა! შევამოწმებთ.", added: "გამოქვეყნდა", note: "რჩევა: ნახეთ ბინა პირადად და წინასწარ თანხას ნუ გადაიხდით, სანამ ობიექტს და ხელშეკრულებას არ ნახავთ." },
} as const;

type Props = { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ reported?: string }> };

async function load(id: string) {
  const l = await getListing(id);
  if (!l || (l.status !== "published" && l.status !== "archived")) return null;
  const m = await adminGetMaster(l.master_id);
  if (!m || m.status !== "published" || m.archived_at) return null;
  return { l, m };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const d = await load(id);
  if (!d) return { robots: { index: false } };
  const title = `${d.l.title || autoTitle(d.l, lang)} — ${priceLabel(d.l, lang)}`;
  const base = pageMeta(lang, `/realty/${id}`, title, (d.l.description ?? "").slice(0, 160));
  return { ...base, ...(d.l.status !== "published" ? { robots: { index: false } } : {}), openGraph: { ...base.openGraph, images: d.l.photos[0] && d.l.photos[0].startsWith("http") ? [d.l.photos[0]] : undefined } };
}

export default async function ListingPage({ params, searchParams }: Props) {
  const { lang: lg, id } = await params;
  if (!isLocale(lg)) notFound();
  const lang = lg as Locale;
  const d = await load(id);
  if (!d) notFound();
  const { l, m } = d;
  const t = T[lang];
  const pub = await getPublishedMasterBySlug(m.slug);
  const rows: [string, string][] = [
    [t.deal, DEALS[l.deal][lang]],
    [t.type, KINDS[l.kind][lang]],
    ...(l.rooms != null ? ([[t.rooms, roomsLabel(l.rooms, lang)]] as [string, string][]) : []),
    ...(l.area ? ([[t.area, `${l.area} м²`]] as [string, string][]) : []),
    ...(l.floor ? ([[t.floor, l.floor]] as [string, string][]) : []),
    ...(l.district ? ([[t.district, l.district]] as [string, string][]) : []),
    [t.city, cityLabel(l.city, lang)],
  ];
  const reported = (await searchParams).reported;
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href={href(lang, "/realty")} className="text-[14px] text-muted hover:text-brand">
        {t.back}
      </Link>
      {l.status === "archived" && <p className="mt-3 rounded-xl bg-[#fdf6e6] p-3 text-[14px]">{t.archived}</p>}
      <h1 className="mt-3 text-[24px] font-bold leading-tight sm:text-[30px]">{l.title || autoTitle(l, lang)}</h1>
      <p className="mt-2 text-[26px] font-bold text-brand-dark">{priceLabel(l, lang)}</p>

      {l.photos.length > 0 && (
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.photos[0]} alt={l.title} className="max-h-[520px] w-full rounded-2xl object-cover" />
          {l.photos.length > 1 && <ArticleGallery photos={l.photos.slice(1)} />}
        </div>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-xl bg-cream p-3">
            <dt className="text-[12px] text-muted">{k}</dt>
            <dd className="text-[15px] font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      {l.description && (
        <section className="mt-6">
          <h2 className="text-[18px] font-bold">{t.desc}</h2>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-[#3a3935]">{l.description}</p>
        </section>
      )}

      {l.lat != null && l.lng != null && (
        <div className="mt-6">
          <Map height={260} points={[{ lat: l.lat, lng: l.lng, title: l.title }]} />
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-[18px] font-bold">{t.realtor}</h2>
        <div className="mt-3 space-y-3">
          {pub && (
            <Link href={href(lang, `/master/${pub.slug}`)} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 hover:border-brand">
              {pub.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pub.photo_url.split("#")[0]} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-[20px] font-bold text-brand">{pub.name.slice(0, 1)}</span>
              )}
              <span className="min-w-0">
                <span className="block font-semibold">{pub.name}</span>
                <span className="block text-[13px] text-muted">{categoryLabel(pub.category, lang)}</span>
              </span>
            </Link>
          )}
          <div className="space-y-2">
            <Link href={href(lang, `/master/${m.slug}`)} className="btn-primary h-12 w-full px-5 sm:w-auto">
              {t.contact}
            </Link>
            <div className="flex flex-wrap gap-2">
              {l.tg_link && (
                <a href={l.tg_link} target="_blank" rel="noopener noreferrer" className="btn-ghost h-10 px-4 text-[14px]">
                  {t.tg}
                </a>
              )}
              <ShareButton title={l.title} label={t.share} done={t.copied} className="btn-ghost h-10 px-4 text-[14px]" />
            </div>
            <p className="text-[12px] text-muted">
              {t.added}: {new Date(l.created_at).toLocaleDateString(lang === "ka" ? "ka-GE" : lang === "en" ? "en-GB" : "ru-RU")}
            </p>
            <p className="text-[12px] text-muted">{t.note}</p>
          </div>
        </div>
      </section>

      <details className="mt-8 rounded-2xl border border-line p-4">
        <summary className="cursor-pointer text-[14px] font-semibold text-muted">{reported ? t.thanks : t.report}</summary>
        {!reported && (
          <form action="/api/realty/report" method="post" className="mt-3 space-y-2">
            <input type="hidden" name="id" value={l.id} />
            <input type="hidden" name="lang" value={lang} />
            <p className="text-[14px]">{t.reportWhy}</p>
            {Object.entries(t.reasons).map(([k, v]) => (
              <label key={k} className="flex items-center gap-2 text-[14px]">
                <input type="radio" name="reason" value={k} required /> {v}
              </label>
            ))}
            <button className="btn-ghost h-10 px-4 text-[14px]">{t.send}</button>
          </form>
        )}
      </details>
    </div>
  );
}
