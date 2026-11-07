import { BonusSpecLink } from "@/components/BonusSpecLink";
import type { PublicMaster } from "@/lib/types";
import { href, type Locale } from "@/lib/i18n";

const T = {
  ru: {
    clients: "🎁 Скидки за рекомендацию и репост",
    clientsText: "Посоветуйте мастера другу или поделитесь его профилем — у специалистов со значком 🎁 за это скидка или подарок.",
    show: (n: number) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? "специалист даёт" : "специалистов дают"} скидку или подарок`,
    short: "за рекомендацию другу или репост",
    masters: "Специалистам",
    mastersText: "Включите бонус клиентам — они приведут друзей, а ваша анкета поднимется выше в каталоге.",
    on: "Включить бонус",
    join: "Зарегистрироваться",
  },
  en: {
    clients: "🎁 Discounts for referrals and reposts",
    clientsText: "Recommend a specialist to a friend or share their profile — specialists with a 🎁 badge give a discount or a gift for it.",
    show: (n: number) => `${n} specialists give a discount or gift`,
    short: "for a referral or repost",
    masters: "For specialists",
    mastersText: "Turn on a client bonus — clients bring friends, and your profile moves higher in the catalog.",
    on: "Turn on a bonus",
    join: "Sign up",
  },
  ka: {
    clients: "🎁 ფასდაკლება რეკომენდაციისა და რეპოსტისთვის",
    clientsText: "ურჩიეთ სპეციალისტი მეგობარს ან გააზიარეთ მისი პროფილი — 🎁 ნიშნიანი სპეციალისტები ამისთვის ფასდაკლებას ან საჩუქარს იძლევიან.",
    show: (n: number) => `ბონუსიანი სპეციალისტები · ${n}`,
    short: "რეკომენდაციისთვის ან რეპოსტისთვის",
    masters: "სპეციალისტებს",
    mastersText: "ჩართეთ ბონუსი კლიენტებისთვის — ისინი მეგობრებს მოიყვანენ, თქვენი ანკეტა კი კატალოგში მაღლა ავა.",
    on: "ბონუსის ჩართვა",
    join: "რეგისტრაცია",
  },
} as const;

/** Главная, над каталогом: короткий блок про бонусы — клиентам кнопка «мастера с бонусом», специалистам — «включить бонус». */
export async function BonusStrip({ lang, masters, city = "batumi" }: { lang: Locale; masters: PublicMaster[]; city?: string }) {
  const t = T[lang];
  // только специалисты выбранного города — в Тбилиси батумские бонусы не нужны
  const n = masters.filter((m) => m.bonus && !m.demo && (m.city ?? "batumi") === city).length;
  // Тонкая строка над каталогом — только если в городе есть специалисты с бонусом (специалистам — короткая ссылка справа)
  if (n === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-[#f0d58a] bg-[#fffaf0] px-4 py-2.5">
        <a href={`/${lang}?${city !== "batumi" ? `city=${city}&` : ""}bonus=1#masters`} className="group flex min-w-0 grow items-center gap-2 text-[14px]">
          <span aria-hidden>🎁</span>
          <span className="min-w-0">
            <b>{t.show(n)}</b> <span className="text-[#6b4f12]">{t.short}</span>
          </span>
          <span className="text-[#8a6a1f] transition group-hover:translate-x-0.5">→</span>
        </a>
        <span className="hidden text-[13px] text-[#6b4f12] sm:inline">
          {t.masters}: <BonusSpecLink lang={lang} joinHref={href(lang, "/join")} on={t.on} join={t.join} inline />
        </span>
      </div>
    </section>
  );
}
