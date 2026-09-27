import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedMasterBySlug } from "@/lib/db";
import { categoryLabel } from "@/lib/categories";
import { getDict, href, isLocale } from "@/lib/i18n";
import { Avatar } from "@/components/Avatar";
import { MessageForm } from "@/components/MessageForm";
import { VerifiedBadge } from "@/components/MasterCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const m = await getPublishedMasterBySlug(slug).catch(() => null);
  return { title: m ? getDict(lang).message.titleTo(m.name) : getDict(lang).message.title, robots: { index: false } };
}

/** «Написать специалисту» — сообщение получает только он (не путать с общей заявкой). */
export default async function MessagePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const m = await getPublishedMasterBySlug(slug);
  if (!m) notFound();
  const d = getDict(lang);
  const t = d.message;
  const blocked = m.demo || m.away;

  return (
    <div className="mx-auto max-w-xl px-4 py-5 sm:py-10">
      <Link href={href(lang, `/master/${m.slug}`)} className="flex items-center gap-3 rounded-2xl border border-line p-3 hover:bg-cream">
        <Avatar name={m.name} photo={m.photo_url} size={52} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{m.name}</p>
          <p className="text-[13px] text-muted">{categoryLabel(m.category, lang)}</p>
          {m.verified && <VerifiedBadge label={d.card.verified} />}
        </div>
      </Link>

      <h1 className="mt-5 text-[24px] font-bold leading-tight sm:text-[28px]">{t.titleTo(m.name.split(" ")[0])}</h1>

      {blocked ? (
        <div className="mt-4 rounded-2xl border border-accent/50 bg-[#fdf6e6] p-5">
          <p className="font-semibold">{m.demo ? d.master.demoTitle : t.awayTitle}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-[#5a4a22]">{m.demo ? d.master.demoText : t.awayText}</p>
          <Link href={href(lang, `/request?category=${m.category}`)} className="btn-primary mt-4 h-11 w-full">
            {d.nav.leaveRequest}
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.sub(m.name)}</p>
          <div className="mt-5">
            <MessageForm lang={lang} master={{ slug: m.slug, name: m.name, category: m.category }} />
          </div>
          <p className="mt-6 rounded-xl bg-cream p-3.5 text-center text-[14px]">
            {t.orGeneral}{" "}
            <Link href={href(lang, `/request?category=${m.category}`)} className="font-semibold text-brand hover:underline">
              {t.orGeneralLink}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
