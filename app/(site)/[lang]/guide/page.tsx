import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { ARTICLES } from "@/lib/articles";

const TITLE = "Полезные советы: дом, ремонт, мастера в Батуми";
const DESC = "Что делать, если пропал свет или вода, как выбрать мастера, как сделать ремонт в новостройке и найти няню в Батуми — простые инструкции.";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  if (lang !== "ru") return { robots: { index: false } };
  return { ...pageMeta(lang, "/guide", TITLE, DESC), alternates: { canonical: "/ru/guide" } };
}

export default async function GuideList({ params }: LangParams) {
  const lang = await langOf(params);
  if (lang !== "ru") notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-[26px] font-bold sm:text-[32px]">💡 Полезные советы</h1>
      <p className="mt-2 text-[15px] text-muted">{DESC}</p>
      <div className="mt-6 grid gap-3">
        {ARTICLES.map((a) => (
          <Link key={a.slug} href={href(lang, `/guide/${a.slug}`)} className="group flex gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-brand">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-[24px]">{a.emoji}</span>
            <span>
              <span className="block text-[16px] font-semibold leading-snug group-hover:text-brand">{a.h1}</span>
              <span className="mt-1 line-clamp-2 block text-[13px] text-muted">{a.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
