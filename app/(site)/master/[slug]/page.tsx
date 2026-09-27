import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedMasterBySlug } from "@/lib/db";
import { categoryLabel, MEDICAL_CATEGORIES } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";
import { Avatar } from "@/components/Avatar";
import { ContactReveal } from "@/components/ContactReveal";
import { ShareButtons } from "@/components/ShareButtons";
import { priceText, yearsWord } from "@/components/MasterCard";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = await getPublishedMasterBySlug(slug).catch(() => null);
  if (!m) return { title: "Специалист не найден" };
  const title = `${m.name} — ${categoryLabel(m.category).toLowerCase()} в Батуми`;
  const description = `${m.services.split(/\n|;/).map((s) => s.trim()).filter(Boolean).join(", ").slice(0, 150)}. ${priceText(m)}.`;
  return {
    title,
    description,
    alternates: { canonical: `/master/${m.slug}` },
    openGraph: { title, description, url: `/master/${m.slug}`, images: m.photo_url ? [m.photo_url] : undefined },
  };
}

export default async function MasterPage({ params }: Props) {
  const { slug } = await params;
  const m = await getPublishedMasterBySlug(slug);
  if (!m) notFound();

  const services = m.services.split(/\n|;/).map((s) => s.trim()).filter(Boolean);
  const url = `${SITE_URL}/master/${m.slug}`;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-5 sm:px-6 sm:pt-8">
      <Link href="/" className="text-[14px] text-muted hover:text-ink">← Все специалисты</Link>

      <div className="mt-4 flex items-start gap-4">
        <Avatar name={m.name} photo={m.photo_url} size={88} />
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold leading-tight sm:text-[30px]">{m.name}</h1>
          <p className="mt-1 text-[15px] text-muted">
            {categoryLabel(m.category)} · Батуми
            {m.experience_years ? ` · опыт ${m.experience_years} ${yearsWord(m.experience_years)}` : ""}
          </p>
          <p className="mt-2 text-[17px] font-semibold">{priceText(m)}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:order-2 lg:h-fit">
          <ContactReveal masterId={m.id} slug={m.slug} />
        </aside>

        <div className="lg:order-1">
          {services.length > 0 && (
            <section>
              <h2 className="text-[18px] font-bold">Услуги</h2>
              <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
                {services.map((s, i) => (
                  <li key={i} className="px-4 py-3 text-[15px]">{s}</li>
                ))}
              </ul>
            </section>
          )}

          {m.about && (
            <section className="mt-8">
              <h2 className="text-[18px] font-bold">О специалисте</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[#3a3935]">{m.about}</p>
            </section>
          )}

          {m.credentials && (
            <section className="mt-8">
              <h2 className="text-[18px] font-bold">Образование и документы</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[#3a3935]">{m.credentials}</p>
            </section>
          )}

          {m.languages.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[18px] font-bold">Языки</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {m.languages.map((l) => (
                  <span key={l} className="rounded-full bg-cream px-3 py-1 text-[13px]">{l}</span>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-[18px] font-bold">Поделиться</h2>
            <p className="mt-1 text-[14px] text-muted">Отправьте друзьям, если специалист понравился.</p>
            <div className="mt-3">
              <ShareButtons url={url} text={`${m.name} — ${categoryLabel(m.category).toLowerCase()} в Батуми`} />
            </div>
          </section>

          {MEDICAL_CATEGORIES.includes(m.category) && (
            <p className="mt-10 rounded-xl border border-accent/40 bg-[#fdf6e6] p-4 text-[13px] leading-relaxed text-[#5a4a22]">
              Сведения об образовании и документах указал сам специалист. {SITE_NAME} не оказывает медицинских услуг и не даёт медицинских рекомендаций. При острых состояниях звоните 112.
            </p>
          )}

          <p className="mt-6 rounded-xl bg-cream p-4 text-[13px] leading-relaxed text-muted">
            Отзывов пока нет: мы добавим их только от реальных клиентов. {SITE_NAME} знакомит вас со специалистом, а о цене, сроках и оплате вы договариваетесь с ним напрямую.
          </p>
        </div>
      </div>
    </div>
  );
}
