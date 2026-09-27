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
    ...(m.demo ? { robots: { index: false } } : {}),
    openGraph: { ...base.openGraph, images: m.photo_url ? [m.photo_url] : undefined },
  };
}

export default async function MasterPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getPublishedMasterBySlug(slug);
  if (!m) notFound();
  const t = getDict(lang).master;
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
            <ContactReveal masterId={m.id} slug={m.slug} lang={lang} />
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

          <p className="mt-6 rounded-xl bg-cream p-4 text-[13px] leading-relaxed text-muted">{t.noReviews(SITE_NAME)}</p>
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