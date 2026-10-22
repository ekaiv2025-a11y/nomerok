import Link from "next/link";
import { orgsOfMaster, searchOrgs } from "@/lib/org-db";
import { getPlace } from "@/lib/places-db";
import { placeName } from "@/lib/places";
import { href, type Locale } from "@/lib/i18n";
import { leaveOrg, requestOrg } from "@/app/(site)/[lang]/cabinet/org-actions";

const T = {
  ru: { title: "Где вы работаете", text: "Если вы работаете в клинике, салоне или центре — попроситесь в их команду: ваша анкета появится на странице организации, а в анкете будет «Работает в». Организация подтверждает в Telegram.", search: "Название организации", find: "Найти", ask: "Я работаю здесь", leave: "Выйти", pending: "ждёт подтверждения", none: "Не нашли? Возможно, организация ещё не зарегистрирована. Предложите ей:", reg: "nomerok.ge/org", sent: "✅ Запрос отправлен организации — она подтвердит в Telegram.", max: "Можно состоять максимум в трёх организациях.", nf: "Организация не найдена или ещё не подтверждена владельцем.", confirm: (n: string) => `Попроситься в команду «${n}»?` },
  en: { title: "Where you work", text: "If you work at a clinic, salon or centre, ask to join their team: your profile will appear on the organization page and show “Works at”. The organization confirms in Telegram.", search: "Organization name", find: "Find", ask: "I work here", leave: "Leave", pending: "awaiting confirmation", none: "Not found? The organization may not be registered yet. Suggest it:", reg: "nomerok.ge/org", sent: "✅ Request sent — the organization will confirm in Telegram.", max: "You can be in up to three organizations.", nf: "Organization not found or not yet confirmed by its owner.", confirm: (n: string) => `Ask to join “${n}”?` },
  ka: { title: "სად მუშაობთ", text: "თუ კლინიკაში, სალონში ან ცენტრში მუშაობთ — სთხოვეთ მათ გუნდში დამატება: თქვენი ანკეტა გამოჩნდება ორგანიზაციის გვერდზე. ორგანიზაცია Telegram-ში ადასტურებს.", search: "ორგანიზაციის სახელი", find: "ძებნა", ask: "აქ ვმუშაობ", leave: "გასვლა", pending: "ელოდება დადასტურებას", none: "ვერ იპოვეთ? შესაძლოა ორგანიზაცია ჯერ არ არის რეგისტრირებული. შესთავაზეთ:", reg: "nomerok.ge/org", sent: "✅ მოთხოვნა გაიგზავნა — ორგანიზაცია Telegram-ში დაადასტურებს.", max: "მაქსიმუმ სამ ორგანიზაციაში შეიძლება იყოთ.", nf: "ორგანიზაცია ვერ მოიძებნა ან მფლობელს ჯერ არ დაუდასტურებია.", confirm: (n: string) => `გუნდში დამატების თხოვნა „${n}“?` },
} as const;

/** Кабинет специалиста: организации, где он работает. */
export async function CabinetOrgs({ masterId, lang, q, org, msg }: { masterId: string; lang: Locale; q?: string; org?: string; msg?: string }) {
  const t = T[lang];
  const mine = await orgsOfMaster(masterId, { pending: true }).catch(() => []);
  const found = q ? await searchOrgs(q).catch(() => []) : [];
  const target = org ? await getPlace(org).catch(() => null) : null;
  const hasTarget = target && target.owner_verified_at && !mine.some((x) => x.place.id === target.id) ? target : null;
  return (
    <section id="orgs" className="mt-6 scroll-mt-24 rounded-2xl border border-line p-5">
      <h2 className="text-[18px] font-bold">🏢 {t.title}</h2>
      <p className="mt-1 text-[14px] text-muted">{t.text}</p>
      {msg === "sent" && <p className="mt-3 rounded-xl bg-brand-soft p-3 text-[14px]">{t.sent}</p>}
      {msg === "max" && <p className="mt-3 rounded-xl bg-[#fdf6e6] p-3 text-[14px]">{t.max}</p>}
      {msg === "nf" && <p className="mt-3 rounded-xl bg-[#fdf6e6] p-3 text-[14px]">{t.nf}</p>}

      {mine.length > 0 && (
        <div className="mt-3 space-y-2">
          {mine.map(({ member, place }) => (
            <div key={place.id} className="flex items-center gap-3 rounded-xl bg-cream px-3 py-2">
              <Link href={href(lang, `/places/${place.slug}`)} className="min-w-0 flex-1 font-semibold hover:text-brand">
                {placeName(place, lang)}
                {member.status === "pending" && <span className="font-normal text-muted"> · {t.pending}</span>}
              </Link>
              <form action={leaveOrg}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="place" value={place.id} />
                <button className="h-8 rounded-full border border-line px-3 text-[13px] hover:border-danger hover:text-danger">{t.leave}</button>
              </form>
            </div>
          ))}
        </div>
      )}

      {hasTarget && (
        <form action={requestOrg} className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border-2 border-brand/40 p-3">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="place" value={hasTarget.id} />
          <span className="flex-1 text-[14px] font-semibold">{t.confirm(placeName(hasTarget, lang))}</span>
          <button className="btn-primary h-9 px-4 text-[14px]">{t.ask}</button>
        </form>
      )}

      <form method="get" action={`/${lang}/cabinet`} className="mt-3 flex gap-2">
        <input type="hidden" name="tab" value="profile" />
        <input name="orgq" defaultValue={q ?? ""} placeholder={t.search} className="field h-10 min-w-0 flex-1" />
        <button className="btn-ghost h-10 px-4 text-[14px]">{t.find}</button>
      </form>
      {q && (
        <div className="mt-2 space-y-2">
          {found.map((p) => (
            <form key={p.id} action={requestOrg} className="flex items-center gap-3 rounded-xl bg-cream px-3 py-2">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="place" value={p.id} />
              <span className="min-w-0 flex-1 text-[14px] font-semibold">{placeName(p, lang)}</span>
              <button className="btn-primary h-8 px-3 text-[13px]">{t.ask}</button>
            </form>
          ))}
          <p className="text-[13px] text-muted">
            {t.none} <b>{t.reg}</b>
          </p>
        </div>
      )}
    </section>
  );
}
