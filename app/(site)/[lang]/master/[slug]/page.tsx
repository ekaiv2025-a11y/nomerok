import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedMasterBySlug, listPublishedMasters } from "@/lib/db";
import { categoryLabel, categoryPlural, languageLabel, MEDICAL_CATEGORIES } from "@/lib/categories";
import { getDict, href, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Avatar } from "@/components/Avatar";
import { ContactReveal } from "@/components/ContactReveal";
import { ShareButtons } from "@/components/ShareButtons";
import { DemoBadge, MasterCard, VerifiedBadge, priceText } from "@/components/MasterCard";
import { RatingLine, Stars } from "@/components/Stars";
import { formatDay } from "@/lib/availability";
import { listPublishedReviews } from "@/lib/reviews-db";
import { botUsername } from "@/lib/telegram";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  const m = await getPublishedMasterBySlug(slug).catch(() => null);
  if (!m) return { title: t.meta.masterNotFound };
  const title = t.meta.masterTitle(m.name, categoryLabel(m.category, lang));
  const services = m.services.split(/\n|;/).map((s) => s.trim()).filter(Boolean).join(", ").slice(0, 150);
  const base = pageMeta(lang, `/master/${m.slug}`, title, `${services}. ${priceText(m, lang)}.`);
  return {
    ...base,
    ...(m.demo || m.away ? { robots: { index: false } } : {}),
    openGraph: { ...base.openGraph, images: m.photo_url ? [m.photo_url] : undefined },
  };
}

export default async function MasterPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getPublishedMasterBySlug(slug);
  if (!m) notFound();
  const d = getDict(lang);
  const t = d.master;
  const rv = d.reviews;
  const reviews = m.demo ? [] : await listPublishedReviews(m.id).catch(() => []);
  const bot = m.demo ? null : await botUsername();
  const dateFmt = new Intl.DateTimeFormat(lang === "ka" ? "ka-GE" : lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const cat = categoryLabel(m.category, lang);

  const services = m.services.split(/\n|;/).map((s) => s.trim()).filter(Boolean);
  const url = `${SITE_URL}/${lang}/master/${m.slug}`;

  // Другие специалисты: сначала из той же категории, потом остальные (до 6 штук)
  const all = await listPublishedMasters().catch(() => []);
  const others = all.filter((x) => x.id !== m.id);
  const similar = [...others.filter((x) => x.category === m.category), ...others.filter((x) => x.category !== m.category)].slice(0, 6);
  const sameCount = others.filter((x) => x.category === m.category).length;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-5 sm:px-6 sm:pt-8">
      <Link href={href(lang)} className="text-[14px] text-muted hover:text-ink">
        {t.back}
      </Link>

      <div className="mt-4 flex items-start gap-4">
        <Avatar name={m.name} photo={m.photo_url} size={88} />
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold leading-tight sm:text-[30px]">{m.name}</h1>
          {m.verified && <VerifiedBadge label={getDict(lang).card.verified} large />}
          {m.demo && <DemoBadge label={getDict(lang).card.demo} />}
          <p className="mt-1 text-[15px] text-muted">
            {cat} · {t.city}
            {m.experience_years ? ` · ${t.experience(m.experience_years)}` : ""}
          </p>
          {m.extra_categories.length > 0 && (
            <p className="mt-0.5 text-[14px] text-muted">
              {t.also} {m.extra_categories.map((c) => categoryLabel(c, lang)).join(", ")}
            </p>
          )}
          {m.rating != null && m.reviews > 0 && (
            <a href="#reviews" className="mt-1.5 block">
              <RatingLine rating={m.rating} count={m.reviews} label={d.reviews.count(m.reviews)} />
            </a>
          )}
          <p className="mt-2 text-[17px] font-semibold">{priceText(m, lang)}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:order-2 lg:h-fit">
          {m.demo ? (
            <div className="rounded-2xl border border-accent/50 bg-[#fdf6e6] p-5">
              <p className="font-semibold">{t.demoTitle}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-[#5a4a22]">{t.demoText}</p>
              <Link href={href(lang, `/request?category=${m.category}`)} className="btn-primary mt-4 h-11 w-full">
                {getDict(lang).nav.leaveRequest}
              </Link>
            </div>
          ) : (
            <>
              {m.away ? (
                <div className="rounded-2xl border border-accent/50 bg-[#fdf6e6] p-5">
                  <p className="font-semibold">⏸ {t.awayTitle}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#5a4a22]">
                    {m.away_until ? `${t.awayUntil(formatDay(m.away_until, lang))} ` : ""}
                    {t.awayText}
                  </p>
                  <Link href={href(lang, `/request?category=${m.category}`)} className="btn-primary mt-4 h-11 w-full">
                    {d.nav.leaveRequest}
                  </Link>
                </div>
              ) : (
                <ContactReveal masterId={m.id} slug={m.slug} lang={lang} />
              )}
            </>
          )}
        </aside>

        <div className="lg:order-1">
          {services.length > 0 && (
            <section>
              <h2 className="text-[18px] font-bold">{t.services}</h2>
              <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
                {services.map((s, i) => (
                  <li key={i} className="px-4 py-3 text-[15px]">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {m.about && (
            <section className="mt-8">
              <h2 className="text-[18px] font-bold">{t.about}</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[#3a3935]">{m.about}</p>
            </section>
          )}

          {m.credentials && (
            <section className="mt-8">
              <h2 className="text-[18px] font-bold">{t.credentials}</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[#3a3935]">{m.credentials}</p>
            </section>
          )}

          {m.languages.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[18px] font-bold">{t.languages}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {m.languages.map((l) => (
                  <span key={l} className="rounded-full bg-cream px-3 py-1 text-[13px]">
                    {languageLabel(l, lang)}
                  </span>
                ))}
              </div>
            </section>
          )}

          <p className="mt-6 text-[12px] text-muted">{t.ownLanguageNote}</p>

          <section className="mt-8">
            <h2 className="text-[18px] font-bold">{t.share}</h2>
            <p className="mt-1 text-[14px] text-muted">{t.shareHint}</p>
            <div className="mt-3">
              <ShareButtons url={url} text={t.shareText(m.name, cat)} lang={lang} />
            </div>
          </section>

          {MEDICAL_CATEGORIES.includes(m.category) && (
            <p className="mt-10 rounded-xl border border-accent/40 bg-[#fdf6e6] p-4 text-[13px] leading-relaxed text-[#5a4a22]">{t.medical(SITE_NAME)}</p>
          )}

          {!m.demo && (
            <section id="reviews" className="mt-10 scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[18px] font-bold">
                  {rv.title}
                  {reviews.length > 0 && <span className="ml-2 font-normal text-muted">{reviews.length}</span>}
                </h2>
                {m.rating != null && m.reviews > 0 && <RatingLine rating={m.rating} count={m.reviews} label={rv.count(m.reviews)} />}
              </div>
              {reviews.length === 0 ? (
                <p className="mt-3 rounded-xl bg-cream p-4 text-[14px] leading-relaxed text-muted">{rv.none}</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {reviews.map((r) => (
                    <li key={r.id} className="rounded-2xl border border-line p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">{r.author_name}</span>
                        <span className="text-[13px] text-muted">{dateFmt.format(new Date(r.created_at))}</span>
                      </div>
                      <Stars value={r.rating} size={15} className="mt-1" />
                      <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-[#3a3935]">{r.text}</p>
                      {r.photos.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {r.photos.map((p) => (
                            <a key={p} href={p} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p} alt="" loading="lazy" className="h-24 w-24 rounded-xl bg-cream object-cover hover:opacity-90" />
                            </a>
                          ))}
                        </div>
                      )}
                      {r.reply && (
                        <div className="mt-3 rounded-xl bg-cream p-3">
                          <p className="text-[13px] font-semibold">{rv.reply}</p>
                          <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-[#3a3935]">{r.reply}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {bot && (
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-line p-4 sm:flex-row sm:items-center">
                  <p className="flex-1 text-[14px] leading-relaxed text-muted">{rv.leaveHint}</p>
                  <a
                    href={`https://t.me/${bot}?start=rv_${m.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn h-11 shrink-0 gap-2 bg-[#229ED9] px-5 text-white hover:bg-[#1c89bd]"
                  >
                    ⭐ {rv.leave}
                  </a>
                </div>
              )}
            </section>
          )}

          <p className="mt-6 rounded-xl bg-cream p-4 text-[13px] leading-relaxed text-muted">{t.directNote(SITE_NAME)}</p>
          {!m.demo && (
            <p className="mt-4 text-[13px]">
              <Link href={href(lang, `/complaint?m=${m.slug}`)} className="text-muted underline hover:text-danger">
                ⚠️ {d.complaint.link}
              </Link>
            </p>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-14 border-t border-line pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[20px] font-bold">{sameCount > 0 ? t.similarTitle(categoryPlural(m.category, lang)) : t.othersTitle}</h2>
            <Link href={href(lang)} className="text-[14px] font-semibold text-brand hover:underline">
              {t.allLink}
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((x) => (
              <MasterCard key={x.id} m={x} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}