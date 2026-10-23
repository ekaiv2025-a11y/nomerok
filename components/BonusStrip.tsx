import Link from "next/link";
import { cookies } from "next/headers";
import type { PublicMaster } from "@/lib/types";
import { BONUS } from "@/lib/bonus-text";
import { categoryLabel } from "@/lib/categories";
import { href, type Locale } from "@/lib/i18n";

/** Главная: «Бонусы за рекомендации и репосты» — для клиентов и для специалистов. */
export async function BonusStrip({ lang, masters }: { lang: Locale; masters: PublicMaster[] }) {
  const b = BONUS[lang];
  const isSpec = (await cookies()).get("nm_is_spec")?.value === "1";
  const withBonus = masters.filter((m) => m.bonus && !m.demo).slice(0, 6);
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border-2 border-[#f0d58a] bg-[#fffaf0] p-5 sm:p-7">
        <h2 className="text-[22px] font-bold leading-tight sm:text-[26px]">{b.siteTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 sm:p-5">
            <p className="text-[13px] font-bold uppercase tracking-wide text-brand">{b.siteClients}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed">{b.siteClientsText}</p>
            {withBonus.length > 0 && (
              <>
                <p className="mt-3 text-[13px] font-semibold text-muted">{b.siteWith}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {withBonus.map((m) => (
                    <Link key={m.id} href={href(lang, `/master/${m.slug}`)} className="rounded-full border border-[#f0d58a] bg-[#fffaf0] px-3 py-1.5 text-[13px] font-medium hover:border-accent">
                      🎁 {m.name} · {categoryLabel(m.category, lang)}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="rounded-2xl bg-white p-4 sm:p-5">
            <p className="text-[13px] font-bold uppercase tracking-wide text-[#8a6a1f]">{b.siteMasters}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed">{b.siteMastersText}</p>
            <Link
              href={isSpec ? `/${lang}/cabinet?tab=promo#bonus` : href(lang, "/join")}
              className="btn mt-3 h-11 rounded-full bg-accent px-5 text-[14px] font-semibold text-ink hover:bg-[#cf9620]"
            >
              {isSpec ? b.siteMastersBtn : b.siteJoinBtn}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
