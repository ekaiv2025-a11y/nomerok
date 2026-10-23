import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginBox, type LoginIntent } from "@/components/LoginBox";
import { botLink } from "@/lib/telegram";
import { providerEnabled } from "@/lib/oauth";
import { currentAccount, safeNext } from "@/lib/account-auth";
import { href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";

export const dynamic = "force-dynamic";

const T = {
  ru: {
    meta: "Вход на NomerOk",
    client: ["Вход для клиентов", "Ваши заявки, отклики специалистов и избранное — на любом устройстве."],
    spec: ["Вход для специалистов", "Кабинет: анкета, заявки, отзывы и статистика."],
    join: ["Регистрация специалиста", "Войдите удобным способом — дальше заполните анкету. Заявки будут приходить в Telegram или на почту."],
    link: ["Запасной вход в кабинет", "Добавьте Google или почту — тогда войдёте в кабинет, даже если нет доступа к Telegram."],
    err: { cancel: "Вход отменён.", state: "Сессия входа устарела — попробуйте ещё раз.", failed: "Не получилось войти. Попробуйте ещё раз или выберите другой способ.", off: "Этот способ входа пока не подключён." } as Record<string, string>,
    other: { client: ["Я специалист", "spec"], spec: ["Я ищу специалиста", "client"], join: ["У меня уже есть анкета", "spec"], link: ["", ""] } as Record<string, [string, string]>,
    already: "Вы уже вошли как",
    logout: "Выйти",
  },
  en: {
    meta: "Sign in to NomerOk",
    client: ["Sign in", "Your requests, specialists' replies and favourites — on any device."],
    spec: ["Specialist sign-in", "Your dashboard: profile, requests, reviews and stats."],
    join: ["Specialist sign-up", "Sign in the way you like, then fill in your profile. Requests will come via Telegram or email."],
    link: ["Backup sign-in", "Add Google or email so you can open your dashboard even without Telegram."],
    err: { cancel: "Sign-in cancelled.", state: "The sign-in session expired — please try again.", failed: "Sign-in failed. Try again or choose another way.", off: "This sign-in method isn't connected yet." } as Record<string, string>,
    other: { client: ["I'm a specialist", "spec"], spec: ["I'm looking for a specialist", "client"], join: ["I already have a profile", "spec"], link: ["", ""] } as Record<string, [string, string]>,
    already: "You're signed in as",
    logout: "Sign out",
  },
  ka: {
    meta: "NomerOk-ზე შესვლა",
    client: ["შესვლა კლიენტებისთვის", "თქვენი განაცხადები, სპეციალისტების პასუხები და რჩეულები — ნებისმიერ მოწყობილობაზე."],
    spec: ["შესვლა სპეციალისტებისთვის", "კაბინეტი: ანკეტა, განაცხადები, შეფასებები და სტატისტიკა."],
    join: ["სპეციალისტის რეგისტრაცია", "შედით მოსახერხებელი გზით, შემდეგ შეავსეთ ანკეტა. განაცხადები მოვა Telegram-ში ან ელფოსტაზე."],
    link: ["სათადარიგო შესვლა", "დაამატეთ Google ან ელფოსტა — კაბინეტში შეხვალთ Telegram-ის გარეშეც."],
    err: { cancel: "შესვლა გაუქმდა.", state: "შესვლის სესიას ვადა გაუვიდა — სცადეთ თავიდან.", failed: "შესვლა ვერ მოხერხდა. სცადეთ თავიდან ან აირჩიეთ სხვა გზა.", off: "შესვლის ეს გზა ჯერ არ არის ჩართული." } as Record<string, string>,
    other: { client: ["მე სპეციალისტი ვარ", "spec"], spec: ["სპეციალისტს ვეძებ", "client"], join: ["უკვე მაქვს ანკეტა", "spec"], link: ["", ""] } as Record<string, [string, string]>,
    already: "თქვენ შესული ხართ როგორც",
    logout: "გასვლა",
  },
} as const;

type SP = Promise<{ as?: string; next?: string; claim?: string; err?: string }>;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return { ...pageMeta(lang, "/login", T[lang].meta), robots: { index: false } };
}

export default async function LoginPage({ params, searchParams }: LangParams & { searchParams: SP }) {
  const lang = await langOf(params);
  const t = T[lang];
  const sp = await searchParams;
  const intent: LoginIntent = (["client", "spec", "join", "link"] as const).find((x) => x === sp.as) ?? "client";
  const next = safeNext(sp.next, lang);
  const claim = sp.claim && /^[\w-]{6,64}$/.test(sp.claim) ? sp.claim : null;
  const acc = await currentAccount();
  // Уже вошёл и пришёл регистрироваться — сразу к анкете
  if (acc && intent === "join") redirect(`/${lang}/join`);

  const tgLink = intent === "link" ? null : await botLink(intent === "client" ? `my_${lang}` : intent === "join" ? `j_${lang}` : "login");
  const [title, lead] = t[intent];
  const other = t.other[intent];

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <div className="rounded-3xl border border-line bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-8">
        <h1 className="text-center text-[24px] font-bold leading-tight">{title}</h1>
        <p className="mt-2 text-center text-[15px] leading-relaxed text-muted">{lead}</p>
        {sp.err && <p className="mt-4 rounded-xl bg-[#fdf6e6] p-3 text-[14px] text-[#5a4a22]">{t.err[sp.err] ?? t.err.failed}</p>}
        {acc && intent !== "link" && (
          <p className="mt-4 rounded-xl bg-cream p-3 text-[14px]">
            {t.already} <b>{acc.email || acc.name}</b> ·{" "}
            <a href={`/api/auth/logout?lang=${lang}`} className="underline">
              {t.logout}
            </a>
          </p>
        )}
        <div className="mt-6">
          <LoginBox lang={lang} intent={intent} next={next} claim={claim} google={providerEnabled("google")} facebook={providerEnabled("facebook")} tgLink={tgLink} />
        </div>
      </div>
      {other[0] && (
        <p className="mt-6 text-center text-[14px]">
          <Link href={href(lang, `/login?as=${other[1]}`)} className="font-semibold text-brand underline">
            {other[0]}
          </Link>
        </p>
      )}
    </div>
  );
}
