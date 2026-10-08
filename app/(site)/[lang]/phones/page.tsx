import type { Metadata } from "next";
import Link from "next/link";
import { href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";
import { PH, QUICK, SECTIONS } from "@/lib/phones";
import { categoryPlural } from "@/lib/categories";
import { Fragment } from "react";
import { NOTARIES, NOTARY_TEXT, notaryHours } from "@/lib/notaries";
import type { Locale } from "@/lib/i18n/config";

const fmtDial = (p: string) => p.replace(/[^\d+]/g, "");

function NotaryCard({ n, lang }: { n: (typeof NOTARIES)[number]; lang: Locale }) {
  const t = NOTARY_TEXT[lang];
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <h3 className="text-[15px] font-semibold">{lang === "ru" ? n.ru : n.en}</h3>
      <p className="mt-1 text-[13px] text-muted">📍 {lang === "ru" ? n.addrRu : n.addrEn}</p>
      <p className="mt-0.5 text-[13px] text-muted">🕘 {notaryHours(n, lang)}</p>
      {n.access && <p className="mt-0.5 text-[12px] text-muted">{t.access}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {n.phones.map((p) => (
          <a key={p} href={`tel:${fmtDial(p)}`} className="btn-dark h-10 whitespace-nowrap px-4 text-[14px]">
            📞 {p}
          </a>
        ))}
      </div>
    </div>
  );
}

/** Нотариусы: первые 6 сразу, остальные — по кнопке. */
function Notaries({ lang }: { lang: Locale }) {
  const t = NOTARY_TEXT[lang];
  const first = NOTARIES.slice(0, 6);
  const rest = NOTARIES.slice(6);
  return (
    <section id="notary" className="scroll-mt-24">
      <h2 className="text-[20px] font-bold">⚖️ {t.title}</h2>
      <p className="mt-1 text-[13px] text-muted">{t.hint}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {first.map((n) => <NotaryCard key={n.en} n={n} lang={lang} />)}
      </div>
      {rest.length > 0 && (
        <details className="group mt-3">
          <summary className="cursor-pointer list-none rounded-full border border-line bg-white px-4 py-2 text-center text-[14px] font-semibold text-brand hover:border-brand group-open:hidden">
            {lang === "ru" ? `Показать всех нотариусов (${NOTARIES.length})` : lang === "ka" ? `ყველა ნოტარიუსი (${NOTARIES.length})` : `Show all notaries (${NOTARIES.length})`}
          </summary>
          <div className="grid gap-3 md:grid-cols-2">
            {rest.map((n) => <NotaryCard key={n.en} n={n} lang={lang} />)}
          </div>
        </details>
      )}
    </section>
  );
}

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return pageMeta(lang, "/phones", PH[lang].title, PH[lang].lead);
}

export default async function PhonesPage({ params }: LangParams) {
  const lang = await langOf(params);
  const t = PH[lang];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-[26px] font-bold sm:text-[32px]">📞 {t.h1}</h1>
      <p className="mt-2 max-w-2xl text-[14px] text-muted">{t.lead}</p>

      {/* Самое нужное — крупные кнопки */}
      <h2 className="mt-6 text-[13px] font-semibold uppercase tracking-wide text-muted">{t.quick}</h2>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {QUICK.map((q) => (
          <a
            key={q.dial}
            href={`tel:${q.dial}`}
            className={`flex flex-col rounded-2xl border px-4 py-3 transition hover:shadow-sm ${q.dial === "112" ? "border-red-200 bg-red-50" : "border-line bg-white"}`}
          >
            <span className="text-[13px] text-muted">
              {q.icon} {q.label[lang]}
            </span>
            <span className={`mt-0.5 whitespace-nowrap text-[18px] font-bold ${q.dial === "112" ? "text-red-700" : "text-ink"}`}>{q.show}</span>
          </a>
        ))}
      </div>

      {/* Навигация по разделам */}
      <nav className="mt-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Fragment key={s.id}>
            <a href={`#${s.id}`} className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] hover:border-brand">
              {s.icon} {s.title[lang]}
            </a>
            {s.id === "city" && (
              <a href="#notary" className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] hover:border-brand">
                ⚖️ {NOTARY_TEXT[lang].title}
              </a>
            )}
          </Fragment>
        ))}
      </nav>

      <div className="mt-6 space-y-8">
        {SECTIONS.map((s) => (
          <Fragment key={s.id}>
          <section id={s.id} className="scroll-mt-24">
            <h2 className="text-[20px] font-bold">
              {s.icon} {s.title[lang]}
            </h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {s.items.map((it, i) => (
                <div key={i} className="rounded-2xl border border-line bg-white p-4">
                  <h3 className="text-[15px] font-semibold">{it.name[lang]}</h3>
                  {it.note && <p className="mt-1 text-[13px] leading-relaxed text-muted">{it.note[lang]}</p>}
                  <div className="mt-3 space-y-2">
                    {it.numbers.map((nm) => (
                      <div key={nm.dial} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <a href={`tel:${nm.dial}`} className="btn-dark h-10 whitespace-nowrap px-4 text-[14px]" aria-label={`${t.call} ${nm.show}`}>
                          📞 {nm.show}
                        </a>
                        {nm.label && <span className="text-[12px] text-muted">{nm.label[lang]}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {s.help && (
              <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-muted">
                {t.helpTitle}
                {s.help.map((h) => (
                  <Link key={h.cat} href={href(lang, `/services/${h.cat}`)} title={h.text[lang]} className="rounded-full bg-cream px-3 py-1 font-medium text-brand hover:underline">
                    {categoryPlural(h.cat, lang)}
                  </Link>
                ))}
              </p>
            )}
          </section>
          {s.id === "city" && <Notaries lang={lang} />}
          </Fragment>
        ))}
      </div>

      <p className="mt-10 text-[13px] text-muted">
        {t.wrong}{" "}
        <Link href={href(lang, "/contacts")} className="text-brand underline">
          {t.wrongLink}
        </Link>
      </p>
    </div>
  );
}
