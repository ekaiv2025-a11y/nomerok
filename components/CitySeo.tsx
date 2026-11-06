import Link from "next/link";
import { href, type Locale } from "@/lib/i18n";
import { cityIn, cityLabel } from "@/lib/cities";
import { categoryPlural } from "@/lib/categories";
import { servesCategory } from "@/lib/availability";
import type { PublicMaster } from "@/lib/types";

/*
 * Текст для поиска и для людей под каталогом главной: свой для каждого города (?city=tbilisi и т. д.).
 * Только правда про то, как работает сайт; цифры — настоящие, из каталога.
 */
const T = {
  ru: {
    h: (c: string) => `Как найти специалиста ${c}`,
    p1: (c: string) =>
      `NomerOk — каталог частных специалистов ${c}: мастера по ремонту, сантехники и электрики, уборка, репетиторы и няни, красота, врачи и психологи, юристы и переводчики. В анкете видно, чем занимается человек, где принимает или куда выезжает, цены, фото работ и отзывы клиентов.`,
    p2: "Можно выбрать самому и написать специалисту напрямую — без посредников и процентов. Или разместить заявку: её получат специалисты нужного направления, и свободные откликнутся сами.",
    count: (n: number, c: string) => `Сейчас в каталоге ${n} ${n % 10 === 1 && n % 100 !== 11 ? "анкета" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "анкеты" : "анкет"} ${c}, и каждый день добавляются новые.`,
    popular: (c: string) => `Направления ${c}`,
    faqH: "Частые вопросы",
    faq: (c: string, l: string) => [
      { q: `Как найти мастера ${c}?`, a: `Выберите направление в каталоге выше и город ${l} — откроются анкеты с ценами, фото и отзывами. Или разместите заявку: специалисты сами напишут вам.` },
      { q: "Сколько стоит пользоваться NomerOk?", a: "Для клиентов бесплатно. Цену работы вы обсуждаете со специалистом напрямую." },
      { q: "Как связаться со специалистом?", a: "В анкете есть телефон или Telegram: пишите и звоните напрямую. Если анкету составила редакция по сайту клиники, запись — через клинику." },
      { q: `Я специалист ${c}. Как попасть в каталог?`, a: "Зарегистрируйтесь — это бесплатно и занимает около 5 минут. Заявки клиентов вашего направления будут приходить в Telegram." },
    ],
    join: (c: string) => `Вы специалист ${c}? Разместите анкету бесплатно →`,
  },
  en: {
    h: (c: string) => `How to find a specialist ${c}`,
    p1: (c: string) => `NomerOk is a catalog of independent specialists ${c}: repairs, plumbers and electricians, cleaning, tutors and nannies, beauty, doctors and psychologists, lawyers and translators. Each profile shows what they do, where they work, prices, work photos and client reviews.`,
    p2: "Choose yourself and contact them directly — no middlemen or fees. Or post a request: specialists in that field get it and those who are free respond.",
    count: (n: number, c: string) => `There are ${n} profiles ${c} in the catalog now, with new ones added every day.`,
    popular: (c: string) => `Categories ${c}`,
    faqH: "FAQ",
    faq: (c: string, l: string) => [
      { q: `How do I find a specialist ${c}?`, a: `Pick a category above and the city ${l} to see profiles with prices, photos and reviews. Or post a request and specialists will contact you.` },
      { q: "How much does NomerOk cost?", a: "It is free for clients. You agree on the price with the specialist directly." },
      { q: `I'm a specialist ${c}. How do I join?`, a: "Sign up — it's free and takes about 5 minutes. Client requests in your field will arrive in Telegram." },
    ],
    join: (c: string) => `Are you a specialist ${c}? Create a free profile →`,
  },
  ka: {
    h: (c: string) => `როგორ ვიპოვოთ სპეციალისტი ${c}`,
    p1: (c: string) => `NomerOk — კერძო სპეციალისტების კატალოგი ${c}: ხელოსნები, სანტექნიკოსები, ელექტრიკოსები, დალაგება, რეპეტიტორები, ძიძები, სილამაზე, ექიმები, იურისტები. პროფილში ჩანს ფასები, ნამუშევრები და შეფასებები.`,
    p2: "აირჩიეთ თავად და დაუკავშირდით პირდაპირ — შუამავლების გარეშე. ან განათავსეთ მოთხოვნა: თავისუფალი სპეციალისტები თავად გამოგეხმაურებიან.",
    count: (n: number, c: string) => `კატალოგში ახლა ${n} პროფილია ${c}.`,
    popular: (c: string) => `მიმართულებები ${c}`,
    faqH: "ხშირი კითხვები",
    faq: (c: string) => [
      { q: "რა ღირს NomerOk?", a: "კლიენტებისთვის უფასოა. ფასზე სპეციალისტთან პირდაპირ თანხმდებით." },
      { q: `სპეციალისტი ვარ ${c}. როგორ დავრეგისტრირდე?`, a: "რეგისტრაცია უფასოა და დაახლოებით 5 წუთს გრძელდება." },
    ],
    join: (c: string) => `სპეციალისტი ხართ ${c}? შექმენით პროფილი უფასოდ →`,
  },
} as const;

export function CitySeo({ lang, city, masters, cats }: { lang: Locale; city: string; masters: PublicMaster[]; cats: string[] }) {
  const t = T[lang];
  const c = cityIn(city, lang);
  const local = masters.filter((m) => !m.demo && (m.city ?? "batumi") === city);
  const q = city !== "batumi" ? `?city=${city}` : "";
  const withCount = cats.map((cat) => ({ cat, n: local.filter((m) => servesCategory(m, cat)).length })).sort((a, b) => b.n - a.n);
  const faq = t.faq(c, cityLabel(city, lang));
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <section className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="grid gap-8 rounded-3xl border border-line bg-white p-5 sm:p-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-[22px] font-bold leading-tight sm:text-[26px]">{t.h(c)}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#3a3935]">{t.p1(c)}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-[#3a3935]">{t.p2}</p>
          {local.length >= 3 && <p className="mt-3 text-[14px] text-muted">{t.count(local.length, c)}</p>}
          <h3 className="mt-6 text-[17px] font-bold">{t.popular(c)}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {withCount.map(({ cat, n }) => (
              <Link key={cat} href={href(lang, `/services/${cat}${q}`)} className="rounded-full border border-line px-3 py-1 text-[13.5px] hover:border-brand hover:text-brand">
                {categoryPlural(cat, lang)}
                {n > 0 && <span className="text-muted"> · {n}</span>}
              </Link>
            ))}
          </div>
          <Link href={href(lang, "/join")} className="mt-5 inline-block text-[14px] font-semibold text-brand hover:underline">
            {t.join(c)}
          </Link>
        </div>
        <div>
          <h3 className="text-[17px] font-bold">{t.faqH}</h3>
          <div className="mt-2 divide-y divide-line rounded-2xl border border-line">
            {faq.map((f) => (
              <details key={f.q} className="group px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14.5px] font-semibold">
                  {f.q}
                  <span className="text-muted transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
