import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { PT, placeCat, placeDesc, placeIndexable, placeName, prettyHours } from "@/lib/places";
import { getPlaceBySlug, nearbyPlaces } from "@/lib/places-db";
import { formatPhone } from "@/lib/phone";
import { botUsername } from "@/lib/telegram";
import { PlaceCard } from "@/components/PlaceCard";
import { Map } from "@/components/map/Map";
import { ArticleGallery } from "@/components/ArticleGallery";
import { SITE_URL } from "@/lib/site";

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
  const desc = placeDesc(p, lang) ?? `${p.sub || c.label[lang]}${p.addr ? `, ${p.addr}` : ""}. ${PT[lang].h1}.`;
  const base = pageMeta(lang, `/places/${p.slug}`, `${name} — ${p.sub || c.label[lang]}, Батуми`, desc.slice(0, 160));
  return placeIndexable(p) ? base : { ...base, robots: { index: false, follow: true } };
}

export default async function PlacePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const p = await getPlaceBySlug(slug);
  if (!p || p.status !== "published") notFound();
  const t = PT[lang];
  const c = placeCat(p.cat);
  const name = placeName(p, lang);
  const desc = placeDesc(p, lang);
  const [near, bot] = await Promise.all([nearbyPlaces(p), botUsername().catch(() => null)]);
  const socials = [...(p.ig ? [p.ig] : []), ...(p.socials ?? []).filter((u) => u !== p.ig)];
  const altNames = [p.name, p.name_en, p.name_ka].filter((x, i, a) => x && x !== name && a.indexOf(x) === i);
  const ld = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    ...(desc ? { description: desc } : {}),
    url: `${SITE_URL}/${lang}/places/${p.slug}`,
    ...(p.phones?.[0] ? { telephone: p.phones[0] } : {}),
    ...(p.addr ? { address: { "@type": "PostalAddress", streetAddress: p.addr, addressLocality: "Batumi", addressCountry: "GE" } } : {}),
    ...(p.lat != null ? { geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } } : {}),
    ...(socials.length || p.site ? { sameAs: [...(p.site ? [p.site] : []), ...socials] } : {}),
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
      <h1 translate="no" className="notranslate mt-3 text-[26px] font-bold leading-tight sm:text-[34px]">{name}</h1>
      <p className="mt-1 text-[15px] text-muted">
        {p.sub || c.label[lang]}
        {altNames.length > 0 && ` · ${altNames.join(" · ")}`}
      </p>
      {p.owner_verified_at && <p className="mt-2 inline-block rounded-full bg-brand-soft px-3 py-1 text-[13px] font-semibold text-brand-dark">{t.ownerOk}</p>}

      {p.photos && p.photos.length > 0 && <ArticleGallery photos={p.photos} />}

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
        {p.addr && (
          <p className="text-[15px]">
            <span className="text-muted">{t.address}:</span> {p.addr}
          </p>
        )}
        {p.hours && (
          <p className="text-[15px]">
            <span className="text-muted">{t.hours}:</span> {prettyHours(p.hours, lang)}
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
        <section className="mt-6">
          <Map height={260} points={[{ lat: p.lat, lng: p.lng, title: name }]} />
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost mt-2 h-10 px-4 text-[14px]"
          >
            🧭 {t.route}
          </a>
        </section>
      )}

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
