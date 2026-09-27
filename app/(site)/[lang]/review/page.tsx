import type { Metadata } from "next";
import Link from "next/link";
import { adminGetMaster } from "@/lib/db";
import { getDict, href } from "@/lib/i18n";
import { langOf, type LangParams } from "@/lib/i18n/page";
import { readReviewToken } from "@/lib/signed";
import { categoryLabel } from "@/lib/categories";
import { Avatar } from "@/components/Avatar";
import { ReviewForm } from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return { title: getDict(lang).reviews.leave, robots: { index: false } };
}

type Props = LangParams & { searchParams: Promise<{ t?: string }> };

export default async function ReviewPage({ params, searchParams }: Props) {
  const lang = await langOf(params);
  const t = getDict(lang).reviews;
  const token = (await searchParams).t ?? "";
  const ticket = readReviewToken(token);
  const m = ticket ? await adminGetMaster(ticket.m).catch(() => null) : null;

  if (!ticket || !m || m.status !== "published") {
    return (
      <div className="mx-auto max-w-md px-4 py-14 text-center">
        <h1 className="text-[24px] font-bold">{t.expiredTitle}</h1>
        <p className="mt-2 text-[15px] text-muted">{t.expiredText}</p>
        <Link href={href(lang)} className="btn-ghost mt-6">
          {getDict(lang).form.toHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <h1 className="text-[26px] font-bold leading-tight">{t.leave}</h1>
      <Link href={href(lang, `/master/${m.slug}`)} className="mt-4 flex items-center gap-3 rounded-2xl border border-line p-3.5 hover:bg-cream">
        <Avatar name={m.name} photo={m.photo_url} size={52} />
        <div>
          <p className="font-semibold">{m.name}</p>
          <p className="text-[14px] text-muted">{categoryLabel(m.category, lang)}</p>
        </div>
      </Link>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">{t.formIntro}</p>
      <div className="mt-6">
        <ReviewForm lang={lang} token={token} defaultName={ticket.n} masterSlug={m.slug} />
      </div>
    </div>
  );
}
