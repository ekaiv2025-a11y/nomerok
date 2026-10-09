import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/i18n/page";
import { ARTICLES, articleBySlug } from "@/lib/articles";
import { QUICK } from "@/lib/phones";
import { categoryPlural } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ lang: "ru", slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const a = articleBySlug(slug);
  if (!a || lang !== "ru") return { robots: { index: false } };
  const base = pageMeta("ru", `/guide/${a.slug}`, a.title, a.description);
  return { ...base, alternates: { canonical: `/ru/guide/${a.slug}` }, openGraph: { ...base.openGraph, type: "article" } };
}

export default async function ArticlePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || lang !== "ru") notFound();
  const a = articleBySlug(slug);
  if (!a) notFound();
  const others = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3);
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: a.h1, description: a.description, datePublished: a.date, inLanguage: "ru", mainEntityOfPage: `${SITE_URL}/ru/guide/${a.slug}`, publisher: { "@type": "Organization", name: "NomerOk.ge" } },
    ...(a.faq?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Link href={href(lang, "/guide")} className="text-[14px] text-muted hover:text-brand">
        ← Полезные советы
      </Link>
      <h1 className="mt-3 text-[26px] font-bold leading-tight sm:text-[34px]">
        {a.emoji} {a.h1}
      </h1>
      <p className="mt-3 text-[17px] leading-relaxed text-[#3a3935]">{a.lead}</p>

      <article className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#2a2925]">
        {a.body.map((b, i) => {
          if ("h2" in b) return <h2 key={i} className="pt-3 text-[21px] font-bold text-ink">{b.h2}</h2>;
          if ("p" in b) return <p key={i}>{b.p}</p>;
          if ("list" in b) {
            const L = b.ordered ? "ol" : "ul";
            return (
              <L key={i} className={`space-y-1.5 pl-6 ${b.ordered ? "list-decimal" : "list-disc"} marker:text-brand`}>
                {b.list.map((x, j) => <li key={j}>{x}</li>)}
              </L>
            );
          }
          if ("tip" in b) return <p key={i} className="rounded-2xl border border-[#f0d58a] bg-[#fff8e6] p-4 text-[15px]">💡 {b.tip}</p>;
          if ("phones" in b)
            return (
              <div key={i} className="rounded-2xl bg-cream p-4">
                <p className="text-[14px] font-semibold">Номера, которые стоит сохранить:</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {QUICK.map((q) => (
                    <a key={q.dial} href={`tel:${q.dial}`} className="rounded-xl bg-white px-3 py-2 text-[13px] hover:shadow-sm">
                      <span className="text-muted">{q.icon} {q.label.ru}</span>
                      <span className="block whitespace-nowrap font-bold">{q.show}</span>
                    </a>
                  ))}
                </div>
                <Link href={href(lang, "/phones")} className="mt-2 inline-block text-[14px] font-semibold text-brand hover:underline">
                  Все полезные телефоны Батуми →
                </Link>
              </div>
            );
          return (
            <Link key={i} href={href(lang, `/services/${b.cat}`)} className="flex items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-4 text-[16px] font-semibold text-white hover:bg-brand-dark">
              {b.cta} <span aria-hidden>→</span>
            </Link>
          );
        })}
      </article>

      {a.faq && a.faq.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[21px] font-bold">Частые вопросы</h2>
          <div className="mt-3 space-y-3">
            {a.faq.map((f) => (
              <details key={f.q} className="rounded-2xl border border-line bg-white p-4">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-[15px] text-[#3a3935]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 rounded-2xl border border-line bg-white p-5">
        <p className="text-[17px] font-bold">Нужен специалист прямо сейчас?</p>
        <p className="mt-1 text-[14px] text-muted">Опишите задачу — заявку получат {a.cats.map((c) => categoryPlural(c, "ru").toLowerCase()).join(", ")}, и свободные напишут вам сами.</p>
        <Link href={href(lang, `/request?category=${a.cats[0]}`)} className="btn-primary mt-3 h-11 px-5">
          Разместить заявку
        </Link>
      </section>

      {others.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[18px] font-bold">Ещё полезное</h2>
          <div className="mt-3 grid gap-2">
            {others.map((o) => (
              <Link key={o.slug} href={href(lang, `/guide/${o.slug}`)} className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] hover:border-brand">
                {o.emoji} {o.h1}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
