import { categoryLabel } from "@/lib/categories";
import { TeamBySpecialty, type TeamGroup } from "@/components/TeamBySpecialty";
import { subcatsOf, subcatLabel } from "@/lib/subcats";
import type { Metadata } from "next";
import { cityLabel } from "@/lib/cities";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { href, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { PT, placeTone, placeAddr, placeCat, placeDesc, placeIndexable, placeName, placeSummary, prettyHours } from "@/lib/places";
import { getPlace, getPlaceBySlug, nearbyPlaces } from "@/lib/places-db";
import { formatPhone } from "@/lib/phone";
import { botUsername } from "@/lib/telegram";
import { PlaceCard } from "@/components/PlaceCard";
import { Map } from "@/components/map/Map";
import { ArticleGallery } from "@/components/ArticleGallery";
import { SITE_URL } from "@/lib/site";
import { ShareButton } from "@/components/ShareButton";
import { publishedPlaceReviews } from "@/lib/place-reviews-db";
import { publicTeamOf } from "@/lib/org-db";
import { localizeMasters } from "@/lib/translate-db";
import { MasterCard } from "@/components/MasterCard";
import { currentSpecialistId } from "@/lib/spec-auth";
import { listPublishedMasters } from "@/lib/db";
import { servesCategory } from "@/lib/availability";
import { categoryPlural } from "@/lib/categories";
import { seoCategoryIds } from "@/lib/seo-categories";
import { cityIn } from "@/lib/cities";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; slug: string }> };

const host = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "").slice(0, 40);
function socialLabel(u: string) {
  if (/facebook\.com/i.test(u)) return "Facebook";
  if (/instagram\.com/i.test(u)) return "Instagram";
  if (/tiktok\.com/i.test(u)) return "TikTok";
  if (/t\.me\//i.test(u)) return "Telegram";
  if (/youtube\.com|youtu\.be/i.test(u)) return "YouTube";
  return host(u);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const p = await getPlaceBySlug(slug);
  if (!p || p.status !== "published") return { robots: { index: false } };
  const c = placeCat(p.cat);
  const name = placeName(p, lang);
  const a0 = placeAddr(p, lang);
  const desc = placeDesc(p, lang) ?? `${p.sub || c.label[lang]}${a0 ? `, ${a0}` : ""}. ${PT[lang].h1}.`;
  const base = pageMeta(lang, `/places/${p.slug}`, `${name} — ${p.sub || c.label[lang]}, ${cityLabel(p.city ?? "batumi", lang)}`, desc.slice(0, 160));
  return placeIndexable(p) ? base : { ...base, robots: { index: false, follow: true } };
}

const TEAM_T = {
  ru: { more: (n: number) => `Показать всех (${n})`, team: "Команда", empty: "Специалисты этой организации ещё не добавлены.", request: "Отправить заявку", iWork: "Я здесь работаю", ownerHint: "Владелец?", ownerLink: "Кабинет организации" },
  en: { more: (n: number) => `Show all (${n})`, team: "Team", empty: "No specialists added yet.", request: "Send a request", iWork: "I work here", ownerHint: "Owner?", ownerLink: "Organization account" },
  ka: { more: (n: number) => `ყველას ჩვენება (${n})`, team: "გუნდი", empty: "სპეციალისტები ჯერ არ დამატებულა.", request: "განაცხადის გაგზავნა", iWork: "აქ ვმუშაობ", ownerHint: "მფლობელი ხართ?", ownerLink: "ორგანიზაციის კაბინეტი" },
} as const;

export default async function PlacePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const p = await getPlaceBySlug(slug);
  // Дубль — ведём на основную карточку
  if (p && p.status !== "published" && p.dup_of) {
    const main = await getPlace(p.dup_of);
    if (main && main.status === "published") permanentRedirect(href(lang, `/places/${main.slug}`));
  }
  if (!p || p.status !== "published") notFound();
  const t = PT[lang];
  const c = placeCat(p.cat);
  const name = placeName(p, lang);
  const desc = placeDesc(p, lang);
  const addr = placeAddr(p, lang);
  const summary = desc ? "" : placeSummary(p, lang, c.label[lang]);
  const [near, bot, reviews, team, specId] = await Promise.all([
    nearbyPlaces(p),
    botUsername().catch(() => null),
    publishedPlaceReviews(p.id).catch(() => []),
    // команда: подтверждённые организации и клиники, чьих врачей мы добавили по их сайту
    publicTeamOf(p.id).then((x) => localizeMasters(x, lang)).catch(() => []),
    currentSpecialistId().catch(() => null),
  ]);
  // Специалисты из нашего каталога по теме места (клиника → врачи, стоматология → стоматологи…)
  const specCats = relatedSpecCats(p.cat, p.sub);
  const pcity = p.city ?? "batumi";
  const specs = specCats.length
    ? (await listPublishedMasters().catch(() => []))
        .filter((m) => !m.demo && (m.city ?? "batumi") === pcity && specCats.some((sc) => servesCategory(m, sc)))
        .slice(0, 3)
    : [];
  const specsL = specs.length ? await localizeMasters(specs, lang).catch(() => specs) : [];
  const tips = lang === "ru" ? (TIPS[p.cat] ?? null) : null;
  const TT = TEAM_T[lang];
  const inTeam = !!specId && team.some((m) => m.id === specId);
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const mapQuery = encodeURIComponent([name, addr ?? "", cityLabel(p.city ?? "batumi", "en")].filter(Boolean).join(", "));
  const gmaps = p.lat != null ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}` : `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const ymaps = p.lat != null ? `https://yandex.ru/maps/?pt=${p.lng},${p.lat}&z=17&l=map&text=${encodeURIComponent(name)}` : `https://yandex.ru/maps/?text=${mapQuery}`;
  const socials = [...(p.ig ? [p.ig] : []), ...(p.socials ?? []).filter((u) => u !== p.ig)];
  const altNames = [p.name, p.name_en, p.name_ka].filter((x, i, a) => x && x !== name && a.indexOf(x) === i);
  const ld = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    ...(desc ? { description: desc } : {}),
    url: `${SITE_URL}/${lang}/places/${p.slug}`,
    ...(p.phones?.[0] ? { telephone: p.phones[0] } : {}),
    ...(addr ? { address: { "@type": "PostalAddress", streetAddress: addr, addressLocality: cityLabel(p.city ?? "batumi", "en"), addressCountry: "GE" } } : {}),
    ...(p.lat != null ? { geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } } : {}),
    ...(socials.length || p.site ? { sameAs: [...(p.site ? [p.site] : []), ...socials] } : {}),
    ...(reviews.length ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: reviews.length, bestRating: 5, worstRating: 1 } } : {}),
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="flex flex-wrap items-center gap-2 text-[14px] text-muted">
        <Link href={href(lang, "/places")} className="hover:text-brand">
          ← {t.h1}
        </Link>
        <span>·</span>
        <Link href={href(lang, `/places/c/${c.id}`)} className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[13px] font-medium text-brand-dark hover:underline">
          {c.emoji} {c.label[lang]}
        </Link>
      </nav>
      {p.photos?.[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.photos[0]} alt={name} className="mt-4 aspect-[16/9] w-full rounded-2xl bg-cream object-cover object-[50%_35%] sm:aspect-[2/1]" />
      ) : null}
      <div className={`flex items-center gap-4 ${p.photos?.[0] ? "mt-4" : "mt-5"}`}>
        {!p.photos?.[0] && (
          <span aria-hidden style={{ background: placeTone(p.cat)[0] }} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[34px] sm:h-20 sm:w-20 sm:text-[42px]">
            {c.emoji}
          </span>
        )}
        <div className="min-w-0">
          <h1 translate="no" className="notranslate text-[26px] font-bold leading-tight sm:text-[34px]">{name}</h1>
          <p className="mt-1 text-[15px] text-muted">
            {p.sub || c.label[lang]}
            {addr ? ` · ${addr}` : ""}
            {altNames.length > 0 && <span className="block text-[13px]">{altNames.join(" · ")}</span>}
          </p>
        </div>
      </div>
      {reviews.length > 0 && (
        <a href="#reviews" className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-semibold">
          <span className="text-[#e5a50a]">★</span> {avg.toFixed(1)} <span className="font-normal text-muted">· {reviews.length} {lang === "ru" ? "отз." : ""}</span>
        </a>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {p.phones?.[0] && (
          <a href={`tel:${p.phones[0]}`} className="btn-primary h-11 px-5 text-[15px]">
            📞 {t.call}
          </a>
        )}
        <a href={p.lat != null ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}` : gmaps} target="_blank" rel="noopener noreferrer" className="btn-ghost h-11 px-4 text-[15px]">
          🧭 {t.route}
        </a>
        {p.ig && (
          <a href={p.ig} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost h-11 px-4 text-[15px]">
            Instagram
          </a>
        )}
        {p.site && (
          <a href={p.site} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost h-11 px-4 text-[15px]">
            🌐 {t.site}
          </a>
        )}
        <ShareButton title={name} label={`↗ ${t.share}`} done={t.copied} className="btn-ghost h-11 px-4 text-[15px]" />
      </div>
      {p.owner_verified_at && <p className="mt-2 inline-block rounded-full bg-brand-soft px-3 py-1 text-[13px] font-semibold text-brand-dark">{t.ownerOk}</p>}

      {(() => {
        const gal = [...(p.photos ?? []).slice(1), ...reviews.flatMap((r) => r.photos)];
        return gal.length > 0 ? <ArticleGallery photos={gal} /> : null;
      })()}

      {!desc && summary && (
        <section className="mt-6">
          <h2 className="text-[18px] font-bold">{t.about}</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-[#2a2925]">{summary}</p>
          {p.tags && p.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((x) => (
                <span key={x} className="rounded-full bg-cream px-2.5 py-1 text-[12px] text-muted">{x}</span>
              ))}
            </div>
          )}
        </section>
      )}
      {desc && (
        <section className="mt-6">
          <h2 className="text-[18px] font-bold">{t.about}</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-[#2a2925]">{desc}</p>
          {lang === "ru" && p.tags && p.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span key={t} className="rounded-full bg-cream px-2.5 py-1 text-[12px] text-muted">{t}</span>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mt-6 space-y-3 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[18px] font-bold">{t.contacts}</h2>
        {p.phones && p.phones.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {p.phones.map((ph) => (
              <a key={ph} href={`tel:${ph}`} className="btn-dark h-11 whitespace-nowrap px-5 text-[15px]">
                📞 {formatPhone(ph)}
              </a>
            ))}
          </div>
        )}
        {addr && (
          <p className="text-[15px]">
            <span className="text-muted">{t.address}:</span> {addr}
            {lang === "ru" && p.addr && p.addr !== addr && <span translate="no" className="notranslate mt-0.5 block text-[13px] text-muted">{p.addr}</span>}
          </p>
        )}
        {p.hours && (
          <p className="text-[15px]">
            <span className="text-muted">{t.hours}:</span> {prettyHours(p.hours, lang)}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <a href={gmaps} target="_blank" rel="noopener noreferrer" className="btn-ghost h-10 px-4 text-[14px]">
            📍 Google Maps
          </a>
          <a href={ymaps} target="_blank" rel="noopener noreferrer" className="btn-ghost h-10 px-4 text-[14px]">
            📍 {lang === "ru" ? "Яндекс Карты" : "Yandex Maps"}
          </a>
        </div>
        {!p.site && socials.length === 0 && (
          <p className="text-[13px] text-muted">
            {t.noLinks}{" "}
            <Link href={href(lang, "/contacts")} className="text-brand underline">
              {t.wrongLink}
            </Link>
          </p>
        )}
        {(p.site || socials.length > 0 || p.email) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {p.site && (
              <a href={p.site} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost h-10 px-4 text-[14px]">
                🌐 {host(p.site)}
              </a>
            )}
            {socials.map((u) => (
              <a key={u} href={u} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost h-10 px-4 text-[14px]">
                {socialLabel(u)}
              </a>
            ))}
            {p.email && (
              <a href={`mailto:${p.email}`} className="btn-ghost h-10 px-4 text-[14px]">
                ✉️ {p.email}
              </a>
            )}
          </div>
        )}
      </section>

      {p.lat != null && p.lng != null && (
        <section className="mt-4">
          <Map height={260} points={[{ lat: p.lat, lng: p.lng, title: name }]} />
        </section>
      )}

      {tips && (
        <section className="mt-6 rounded-2xl border border-accent/40 bg-[#fffaf0] p-5">
          <h2 className="text-[17px] font-bold text-[#5a4410]">💡 {tips.h}</h2>
          <ul className="mt-2 space-y-1.5 text-[14.5px] leading-relaxed text-[#5a4410]">
            {tips.list.map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>
        </section>
      )}

      {specsL.length > 0 && team.length === 0 && (
        <section className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-[18px] font-bold">{SPEC_T[lang](categoryPlural(specCats[0], lang).toLowerCase(), cityIn(pcity, lang))}</h2>
            <Link href={href(lang, seoCategoryIds().includes(specCats[0]) ? `/services/${specCats[0]}${pcity !== "batumi" ? `?city=${pcity}` : ""}` : `/?city=${pcity}&cat=${specCats[0]}#masters`)} className="text-[14px] font-semibold text-brand hover:underline">
              {SPEC_ALL[lang]} →
            </Link>
          </div>
          <p className="mt-1 text-[13px] text-muted">{SPEC_HINT[lang]}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specsL.map((m) => (
              <MasterCard key={m.id} m={m} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {(p.owner_verified_at || team.length > 0) && (
        <section className="mt-6 rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[18px] font-bold">
            {p.cat === "health" ? `🩺 ${{ ru: "Врачи", en: "Doctors", ka: "ექიმები" }[lang]}` : `👥 ${TT.team}`}
            {team.length > 0 && <span className="ml-2 text-[15px] font-semibold text-muted">{team.length}</span>}
          </h2>
          {team.length > 0 ? (
            <TeamBySpecialty team={team} groups={teamGroups(team, lang)} lang={lang} />
          ) : (
            <p className="mt-2 text-[14px] text-muted">{TT.empty}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={href(lang, `/request?org=${p.id}`)} className="btn-primary h-11 px-5">
              {TT.request}
            </Link>
            {!inTeam && (
              <Link href={href(lang, `/cabinet?tab=profile&org=${p.id}#orgs`)} className="btn-ghost h-11 px-5 text-[14px]">
                {TT.iWork}
              </Link>
            )}
          </div>
          <p className="mt-3 text-[12px] text-muted">
            {TT.ownerHint}{" "}
            <Link href={href(lang, "/org")} className="underline">
              {TT.ownerLink}
            </Link>
          </p>
        </section>
      )}


      <section id="reviews" className="mt-8 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[18px] font-bold">
            {t.reviews}
            {reviews.length > 0 && <span className="ml-2 text-[15px] font-semibold text-muted">★ {avg.toFixed(1)} · {reviews.length}</span>}
          </h2>
          {bot && (
            <a href={`https://t.me/${bot}?start=prv_${p.id}`} target="_blank" rel="noopener noreferrer" className="btn-primary h-10 px-4 text-[14px]">
              ⭐ {t.leaveReview}
            </a>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="mt-2 text-[14px] text-muted">{t.noReviews}</p>
        ) : (
          <div className="mt-3 space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-line bg-white p-4">
                <p className="flex items-center justify-between gap-2 text-[14px]">
                  <b>{r.author_name}</b>
                  <span className="text-[#e5a50a]">
                    {"★".repeat(r.rating)}
                    <span className="text-[#dcd8cc]">{"★".repeat(5 - r.rating)}</span>
                  </span>
                </p>
                <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed">{r.text}</p>
                {r.photos.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {r.photos.map((u) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <a key={u} href={u} target="_blank" rel="noopener noreferrer"><img src={u} alt="" className="h-20 w-20 rounded-lg object-cover" loading="lazy" /></a>
                    ))}
                  </div>
                )}
                <p className="mt-1.5 text-[12px] text-muted">{new Date(r.created_at).toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "ka" ? "ka-GE" : "en-GB")}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-[12px] text-muted">{t.reviewHow}</p>
      </section>

      {!p.owner_verified_at && bot && (
        <section className="mt-6 rounded-2xl border border-[#229ED9]/30 bg-[#eaf6fc] p-5">
          <p className="font-semibold text-[#0f5c82]">{t.owner}</p>
          <p className="mt-1 text-[14px] text-[#2f5d74]">{t.ownerText}</p>
          <a href={`https://t.me/${bot}?start=pl_${p.id}`} target="_blank" rel="noopener noreferrer" className="btn mt-3 h-11 gap-2 bg-[#229ED9] px-5 text-white hover:bg-[#1c89bd]">
            {t.ownerBtn}
          </a>
        </section>
      )}

      <p className="mt-6 text-[12px] leading-relaxed text-muted">
        {t.data}
        {p.src && /OSM|Overture/.test(p.src) ? ": © OpenStreetMap contributors (ODbL), Overture Maps Foundation" : ""}. {t.stale}{" "}
        {t.wrong}{" "}
        <Link href={href(lang, "/contacts")} className="text-brand underline">
          {t.wrongLink}
        </Link>
      </p>

      {near.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[18px] font-bold">
            {t.near}: {c.label[lang].toLowerCase()}
          </h2>
          <div className="mt-3 grid gap-3">
            {near.map((x) => (
              <PlaceCard key={x.id} p={x} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** Какие направления каталога специалистов связаны с местом. */
function relatedSpecCats(cat: string, sub?: string | null): string[] {
  const s = (sub ?? "").toLowerCase();
  if (cat === "health") return s.includes("стоматолог") ? ["dentist"] : s.includes("аптек") || s.includes("оптик") ? [] : ["doctor", "dentist", "psychologist", "massage"];
  const map: Record<string, string[]> = {
    beauty: ["beauty", "massage"],
    education: ["tutor", "languages", "music"],
    kids: ["nanny", "tutor"],
    sport: ["fitness"],
    pets: ["vet"],
    public: ["lawyer", "translator"],
    business: ["accountant", "lawyer"],
    finance: ["accountant"],
    realty: ["realtor", "inspection"],
    repair: ["handyman", "appliances"],
    electronics: ["appliances", "it"],
    home: ["repair", "handyman", "plumber", "electrician"],
    services: ["cleaning", "handyman"],
    events: ["photo", "food"],
    media: ["photo", "it"],
  };
  return map[cat] ?? [];
}

const SPEC_T = {
  ru: (what: string, where: string) => `Частные специалисты: ${what} ${where}`,
  en: (what: string, where: string) => `Independent specialists: ${what} ${where}`,
  ka: (what: string, where: string) => `კერძო სპეციალისტები: ${what} ${where}`,
};
const SPEC_ALL = { ru: "Все", en: "All", ka: "ყველა" } as const;
const SPEC_HINT = { ru: "Из каталога NomerOk — пишите и звоните им напрямую.", en: "From the NomerOk catalog — contact them directly.", ka: "NomerOk-ის კატალოგიდან — დაუკავშირდით პირდაპირ." } as const;

/** Короткие полезные советы по типу места (только общие факты, без обещаний о конкретном месте). */
const TIPS: Record<string, { h: string; list: string[] }> = {
  health: {
    h: "Перед визитом",
    list: [
      "Позвоните заранее: уточните часы приёма, нужна ли запись и есть ли врач, который говорит по-русски или по-английски.",
      "Если у вас страховка — спросите, работает ли с ней клиника, и возьмите полис и паспорт.",
      "Скорая помощь и все экстренные службы в Грузии — 112.",
    ],
  },
  public: {
    h: "Перед визитом",
    list: [
      "Многие услуги Дома юстиции и госорганов можно заказать онлайн на my.gov.ge — проверьте, прежде чем идти.",
      "Возьмите паспорт. Документы на других языках обычно нужны с переводом и заверением у нотариуса.",
      "Часы работы и очередь лучше уточнить по телефону: в начале месяца бывает больше людей.",
    ],
  },
  finance: {
    h: "Полезно знать",
    list: ["Курс в разных обменниках может заметно отличаться — сравните перед обменом.", "Для открытия счёта в банке нужен паспорт; условия для иностранцев уточняйте в отделении."],
  },
  education: {
    h: "Перед визитом",
    list: ["Узнайте по телефону, на каком языке идут занятия и есть ли пробный урок.", "Спросите про документы для зачисления: обычно нужны паспорт или свидетельство о рождении ребёнка."],
  },
};

/** Группы команды для фильтра: у врачей — специальности, у остальных — направления. */
function teamGroups(team: import("@/lib/types").PublicMaster[], lang: import("@/lib/i18n").Locale): TeamGroup[] {
  const map = new globalThis.Map<string, TeamGroup>();
  for (const m of team) {
    const subs = subcatsOf(m);
    const keys = subs.length ? subs.map((id) => [`${m.category}:${id}`, subcatLabel(m.category, id, lang)] as const) : [[m.category, categoryLabel(m.category, lang)] as const];
    for (const [id, label] of keys) {
      const g = map.get(id) ?? { id, label, ids: [] };
      g.ids.push(m.id);
      map.set(id, g);
    }
  }
  return [...map.values()].sort((a, b) => b.ids.length - a.ids.length);
}
