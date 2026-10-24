import Link from "next/link";
import { cookies } from "next/headers";
import type { PublicMaster } from "@/lib/types";
import { href, type Locale } from "@/lib/i18n";

const T = {
  ru: {
    clients: "🎁 Скидки за рекомендацию и репост",
    clientsText: "Посоветуйте мастера другу или поделитесь его профилем — у специалистов со значком 🎁 за это скидка или подарок.",
    show: (n: number) => `Показать мастеров с бонусом · ${n}`,
    masters: "Специалистам",
    mastersText: "Включите бонус клиентам — они приведут друзей, а ваша анкета поднимется выше в каталоге.",
    on: "Включить бонус",
    join: "Зарегистрироваться",
  },
  en: {
    clients: "🎁 Discounts for referrals and reposts",
    clientsText: "Recommend a specialist to a friend or share their profile — specialists with a 🎁 badge give a discount or a gift for it.",
    show: (n: number) => `Show specialists with a bonus · ${n}`,
    masters: "For specialists",
    mastersText: "Turn on a client bonus — clients bring friends, and your profile moves higher in the catalog.",
    on: "Turn on a bonus",
    join: "Sign up",
  },
  ka: {
    clients: "🎁 ფასდაკლება რეკომენდაციისა და რეპოსტისთვის",
    clientsText: "ურჩიეთ სპეციალისტი მეგობარს ან გააზიარეთ მისი პროფილი — 🎁 ნიშნიანი სპეციალისტები ამისთვის ფასდაკლებას ან საჩუქარს იძლევიან.",
    show: (n: number) => `ბონუსიანი სპეციალისტები · ${n}`,
    masters: "სპეციალისტებს",
    mastersText: "ჩართეთ ბონუსი კლიენტებისთვის — ისინი მეგობრებს მოიყვანენ, თქვენი ანკეტა კი კატალოგში მაღლა ავა.",
    on: "ბონუსის ჩართვა",
    join: "რეგისტრაცია",
  },
} as const;

/** Главная, над каталогом: короткий блок про бонусы — клиентам кнопка «мастера с бонусом», специалистам — «включить бонус». */
export async function BonusStrip({ lang, masters }: { lang: Locale; masters: PublicMaster[] }) {
  const t = T[lang];
  const isSpec = (await cookies()).get("nm_is_spec")?.value === "1";
  const n = masters.filter((m) => m.bonus && !m.demo).length;
  return (
    <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
      <div className="grid gap-3 rounded-2xl border border-[#f0d58a] bg-[#fffaf0] p-4 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-5">
        <div>
          <p className="text-[15px] font-bold leading-snug">{t.clients}</p>
          <p className="mt-0.5 text-[13px] leading-snug text-[#5a4410]">{t.clientsText}</p>
          {n > 0 && (
            <a href={`/${lang}?bonus=1#masters`} className="btn mt-2 h-9 rounded-full bg-accent px-4 text-[13px] font-semibold text-ink hover:bg-[#cf9620]">
              {t.show(n)}
            </a>
          )}
        </div>
        <div className="hidden h-12 w-px bg-[#f0d58a] md:block" aria-hidden />
        <div className="border-t border-[#f0d58a] pt-3 md:border-0 md:pt-0">
          <p className="text-[13px] font-bold uppercase tracking-wide text-[#8a6a1f]">{t.masters}</p>
          <p className="mt-0.5 text-[13px] leading-snug text-[#5a4410]">{t.mastersText}</p>
          <Link href={isSpec ? `/${lang}/cabinet?tab=promo#bonus` : href(lang, "/join")} className="mt-2 inline-block text-[13px] font-semibold text-[#6b4f12] underline">
            {isSpec ? t.on : t.join} →
          </Link>
        </div>
      </div>
    </section>
  );
}
