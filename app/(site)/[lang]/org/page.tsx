import type { Metadata } from "next";
import Link from "next/link";
import { langOf, type LangParams } from "@/lib/i18n/page";
import { href, type Locale } from "@/lib/i18n";
import { currentOrgUser } from "@/lib/org-auth";
import { placesOwnedBy } from "@/lib/places-db";
import { inviteCode, teamOf } from "@/lib/org-db";
import { PLACE_CATS, placeName } from "@/lib/places";
import { CITIES } from "@/lib/cities";
import { botLink } from "@/lib/telegram";
import { categoryLabel } from "@/lib/categories";
import { CopyText } from "@/components/CopyText";
import { createOrg, newInviteCode, saveOrgInfo, teamAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Кабинет организации — NomerOk", robots: { index: false } };

const T = {
  ru: {
    title: "Кабинет организации",
    intro: "Для клиник, салонов, учебных центров, агентств и мастерских: страница организации со всей командой, заявки клиентов в Telegram — без комиссии.",
    how: ["Войдите через Telegram — это ваш пароль.", "Найдите свою организацию в «Местах» и подтвердите, что она ваша, или добавьте новую.", "Отправьте сотрудникам ссылку-приглашение: каждый сам создаёт свою анкету за 3 минуты и попадает в команду."],
    login: "Войти через Telegram",
    expired: "Ссылка для входа устарела — нажмите кнопку ещё раз, бот пришлёт новую.",
    logout: "Выйти",
    none: "У вас пока нет подтверждённых организаций.",
    findTitle: "Ваша организация уже есть в «Местах»?",
    findText: "Найдите её, откройте карточку и нажмите «Подтвердить в Telegram». После подтверждения она появится здесь.",
    findBtn: "Найти в «Местах»",
    newTitle: "Добавить новую организацию",
    newText: "Если вашей организации нет в «Местах». Она появится на сайте после быстрой проверки, а команду можно собирать сразу.",
    name: "Название",
    type: "Тип",
    city: "Город",
    addr: "Адрес",
    phone: "Телефон",
    site: "Сайт",
    desc: "Описание",
    create: "Создать организацию",
    created: "✅ Организация создана. Она появится на сайте после проверки — а пока можно собирать команду.",
    hidden: "на проверке",
    published: "опубликована",
    open: "Открыть страницу →",
    info: "Информация",
    hours: "Часы работы",
    phones: "Телефоны (через запятую)",
    ig: "Instagram",
    teamReq: "Заявки клиентов организации получает и команда (в Telegram)",
    save: "Сохранить",
    photos: "Фото: пришлите их боту NomerOk в Telegram — они сразу появятся в карточке (до 12).",
    team: "Команда",
    inviteTitle: "Ссылка-приглашение для сотрудников",
    inviteText: "Отправьте её сотрудникам. Каждый сам заполняет свою анкету (мы и вы за них не заполняем) — и сразу попадает в команду.",
    inviteShare: (org: string, link: string) => `Привет! Мы добавляем нашу команду «${org}» на NomerOk.ge — клиенты будут находить нас и присылать заявки в Telegram. Создай свою анкету по ссылке (3 минуты): ${link}`,
    newLink: "Сделать новую ссылку (старая перестанет работать)",
    empty: "В команде пока никого. Отправьте ссылку-приглашение сотрудникам.",
    pending: "Просит добавить в команду",
    approve: "Добавить",
    remove: "Убрать",
    decline: "Отклонить",
    notPublished: "анкета на проверке",
  },
  en: {
    title: "Organization account",
    intro: "For clinics, salons, learning centres, agencies and workshops: an organization page with your whole team and client requests in Telegram — no commission.",
    how: ["Log in with Telegram — it's your password.", "Find your organization in “Places” and confirm it's yours, or add a new one.", "Send your staff an invite link: each person creates their own profile in 3 minutes and joins the team."],
    login: "Log in with Telegram",
    expired: "The login link has expired — press the button again and the bot will send a new one.",
    logout: "Log out",
    none: "You don't have confirmed organizations yet.",
    findTitle: "Is your organization already in “Places”?",
    findText: "Find it, open its card and press “Confirm in Telegram”. Once confirmed, it will appear here.",
    findBtn: "Find in “Places”",
    newTitle: "Add a new organization",
    newText: "If your organization isn't in “Places”. It will appear on the site after a quick check; you can build your team right away.",
    name: "Name",
    type: "Type",
    city: "City",
    addr: "Address",
    phone: "Phone",
    site: "Website",
    desc: "Description",
    create: "Create organization",
    created: "✅ Organization created. It will appear on the site after a check — meanwhile you can build your team.",
    hidden: "under review",
    published: "published",
    open: "Open page →",
    info: "Information",
    hours: "Opening hours",
    phones: "Phones (comma-separated)",
    ig: "Instagram",
    teamReq: "Your team also receives client requests to the organization (in Telegram)",
    save: "Save",
    photos: "Photos: send them to the NomerOk bot in Telegram — they appear on the card instantly (up to 12).",
    team: "Team",
    inviteTitle: "Invite link for staff",
    inviteText: "Send it to your staff. Each person fills in their own profile (neither we nor you fill it for them) and joins the team.",
    inviteShare: (org: string, link: string) => `Hi! We're adding our team “${org}” to NomerOk.ge — clients will find us and send requests via Telegram. Create your profile here (3 minutes): ${link}`,
    newLink: "Generate a new link (the old one will stop working)",
    empty: "No one in the team yet. Send the invite link to your staff.",
    pending: "Asks to join the team",
    approve: "Add",
    remove: "Remove",
    decline: "Decline",
    notPublished: "profile under review",
  },
  ka: {
    title: "ორგანიზაციის კაბინეტი",
    intro: "კლინიკებისთვის, სალონებისთვის, სასწავლო ცენტრებისთვის, სააგენტოებისა და სახელოსნოებისთვის: ორგანიზაციის გვერდი მთელი გუნდით და კლიენტების განაცხადები Telegram-ში — საკომისიოს გარეშე.",
    how: ["შედით Telegram-ით — ეს თქვენი პაროლია.", "იპოვეთ თქვენი ორგანიზაცია „ადგილებში“ და დაადასტურეთ, ან დაამატეთ ახალი.", "გაუგზავნეთ თანამშრომლებს მოსაწვევი ბმული: თითოეული თავად ქმნის ანკეტას 3 წუთში და გუნდში ხვდება."],
    login: "შესვლა Telegram-ით",
    expired: "შესვლის ბმულს ვადა გაუვიდა — დააჭირეთ ღილაკს ხელახლა, ბოტი ახალს გამოგიგზავნით.",
    logout: "გასვლა",
    none: "დადასტურებული ორგანიზაცია ჯერ არ გაქვთ.",
    findTitle: "თქვენი ორგანიზაცია უკვე არის „ადგილებში“?",
    findText: "იპოვეთ, გახსენით ბარათი და დააჭირეთ „დადასტურება Telegram-ში“. დადასტურების შემდეგ აქ გამოჩნდება.",
    findBtn: "ძებნა „ადგილებში“",
    newTitle: "ახალი ორგანიზაციის დამატება",
    newText: "თუ თქვენი ორგანიზაცია „ადგილებში“ არ არის. საიტზე გამოჩნდება სწრაფი შემოწმების შემდეგ, გუნდის შეკრება კი შეგიძლიათ ახლავე.",
    name: "სახელი",
    type: "ტიპი",
    city: "ქალაქი",
    addr: "მისამართი",
    phone: "ტელეფონი",
    site: "ვებგვერდი",
    desc: "აღწერა",
    create: "ორგანიზაციის შექმნა",
    created: "✅ ორგანიზაცია შეიქმნა. საიტზე გამოჩნდება შემოწმების შემდეგ — მანამდე შეგიძლიათ გუნდის შეკრება.",
    hidden: "მოწმდება",
    published: "გამოქვეყნებულია",
    open: "გვერდის გახსნა →",
    info: "ინფორმაცია",
    hours: "სამუშაო საათები",
    phones: "ტელეფონები (მძიმით)",
    ig: "Instagram",
    teamReq: "ორგანიზაციის განაცხადებს გუნდიც იღებს (Telegram-ში)",
    save: "შენახვა",
    photos: "ფოტოები: გაუგზავნეთ NomerOk-ის ბოტს Telegram-ში — მაშინვე გამოჩნდება ბარათზე (12-მდე).",
    team: "გუნდი",
    inviteTitle: "მოსაწვევი ბმული თანამშრომლებისთვის",
    inviteText: "გაუგზავნეთ თანამშრომლებს. თითოეული თავად ავსებს ანკეტას (ჩვენ და თქვენ მათ ნაცვლად არ ვავსებთ) და მაშინვე ხვდება გუნდში.",
    inviteShare: (org: string, link: string) => `გამარჯობა! ჩვენი გუნდი „${org}“ ემატება NomerOk.ge-ზე — კლიენტები გვიპოვიან და განაცხადებს Telegram-ში გამოგვიგზავნიან. შექმენი შენი ანკეტა ბმულით (3 წუთი): ${link}`,
    newLink: "ახალი ბმულის შექმნა (ძველი აღარ იმუშავებს)",
    empty: "გუნდში ჯერ არავინაა. გაუგზავნეთ მოსაწვევი ბმული თანამშრომლებს.",
    pending: "ითხოვს გუნდში დამატებას",
    approve: "დამატება",
    remove: "წაშლა",
    decline: "უარყოფა",
    notPublished: "ანკეტა მოწმდება",
  },
} as const;

type Props = LangParams & { searchParams: Promise<{ p?: string; expired?: string; created?: string }> };

export default async function OrgPage({ params, searchParams }: Props) {
  const lang = (await langOf(params)) as Locale;
  const sp = await searchParams;
  const t = T[lang];
  const user = await currentOrgUser();
  const loginLink = await botLink(`org_${lang}`);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-[28px] font-bold leading-tight sm:text-[34px]">🏢 {t.title}</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-[#3a3935]">{t.intro}</p>
        <ol className="mt-5 list-decimal space-y-2 pl-5 text-[15px]">
          {t.how.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
        {sp.expired && <p className="mt-5 rounded-xl bg-[#fdf6e6] p-3 text-[14px]">{t.expired}</p>}
        {loginLink && (
          <a href={loginLink} target="_blank" rel="noopener noreferrer" className="btn mt-6 h-12 bg-[#229ED9] px-6 text-[16px] text-white hover:bg-[#1c89bd]">
            {t.login}
          </a>
        )}
      </div>
    );
  }

  const mine = await placesOwnedBy(user.chatId).catch(() => []);
  const cur = mine.find((p) => p.id === sp.p) ?? mine[0] ?? null;
  const code = cur ? await inviteCode(cur) : null;
  const invite = code ? await botLink(`o_${code}`) : null;
  const team = cur ? await teamOf(cur.id, { all: true }) : [];
  const fc = "field h-11 w-full";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[26px] font-bold leading-tight sm:text-[32px]">🏢 {t.title}</h1>
        <a href={`/api/org/logout?lang=${lang}`} className="btn-ghost h-9 shrink-0 px-3 text-[13px]">
          {t.logout}
        </a>
      </div>
      {sp.created && <p className="mt-4 rounded-xl bg-brand-soft p-3 text-[14px] text-brand-dark">{t.created}</p>}

      {mine.length > 1 && (
        <nav className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
          {mine.map((p) => (
            <Link key={p.id} href={`/${lang}/org?p=${p.id}`} className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold ${p.id === cur?.id ? "bg-brand text-white" : "bg-cream"}`}>
              {placeName(p, lang)}
            </Link>
          ))}
        </nav>
      )}

      {cur ? (
        <div className="mt-6 space-y-6">
          <section className="rounded-2xl border border-line p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[20px] font-bold">{placeName(cur, lang)}</h2>
              <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${cur.status === "published" ? "bg-brand-soft text-brand-dark" : "bg-[#fdf6e6] text-[#5a4a22]"}`}>
                {cur.status === "published" ? t.published : t.hidden}
              </span>
            </div>
            {cur.status === "published" && (
              <Link href={href(lang, `/places/${cur.slug}`)} className="mt-2 inline-block text-[14px] font-semibold text-brand hover:underline">
                {t.open}
              </Link>
            )}
          </section>

          {/* Команда */}
          <section className="rounded-2xl border border-line p-5">
            <h2 className="text-[20px] font-bold">👥 {t.team}</h2>
            <p className="mt-3 text-[15px] font-semibold">{t.inviteTitle}</p>
            <p className="mt-1 text-[14px] text-muted">{t.inviteText}</p>
            {invite && (
              <div className="mt-3">
                <CopyText text={invite} share={t.inviteShare(placeName(cur, lang), invite)} />
              </div>
            )}
            <form action={newInviteCode} className="mt-2">
              <input type="hidden" name="place" value={cur.id} />
              <button className="text-[12px] text-muted underline hover:text-ink">{t.newLink}</button>
            </form>

            <div className="mt-5 space-y-2">
              {team.length === 0 && <p className="text-[14px] text-muted">{t.empty}</p>}
              {team.map(({ member, master }) => (
                <div key={master.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-cream px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <Link href={href(lang, `/master/${master.slug}`)} className="font-semibold hover:text-brand">
                      {master.name}
                    </Link>
                    <span className="text-[13px] text-muted">
                      {" "}
                      · {categoryLabel(master.category, lang)}
                      {master.status !== "published" ? ` · ${t.notPublished}` : ""}
                      {member.status === "pending" ? ` · ${t.pending}` : ""}
                    </span>
                  </div>
                  {member.status === "pending" && (
                    <form action={teamAction}>
                      <input type="hidden" name="place" value={cur.id} />
                      <input type="hidden" name="master" value={master.id} />
                      <input type="hidden" name="act" value="approve" />
                      <button className="btn-primary h-8 px-3 text-[13px]">{t.approve}</button>
                    </form>
                  )}
                  <form action={teamAction}>
                    <input type="hidden" name="place" value={cur.id} />
                    <input type="hidden" name="master" value={master.id} />
                    <input type="hidden" name="act" value="remove" />
                    <button className="h-8 rounded-full border border-line px-3 text-[13px] hover:border-danger hover:text-danger">{member.status === "pending" ? t.decline : t.remove}</button>
                  </form>
                </div>
              ))}
            </div>
          </section>

          {/* Информация */}
          <section className="rounded-2xl border border-line p-5">
            <h2 className="text-[20px] font-bold">📝 {t.info}</h2>
            <form action={saveOrgInfo} className="mt-4 space-y-3">
              <input type="hidden" name="place" value={cur.id} />
              <label className="block text-[14px] font-medium">
                {t.desc}
                <textarea name="desc" defaultValue={cur.desc_ru ?? ""} rows={5} className="field mt-1 w-full py-2" maxLength={1500} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-[14px] font-medium">
                  {t.addr}
                  <input name="addr" defaultValue={cur.addr_ru ?? cur.addr ?? ""} className={`${fc} mt-1`} />
                </label>
                <label className="block text-[14px] font-medium">
                  {t.hours}
                  <input name="hours" defaultValue={cur.hours ?? ""} className={`${fc} mt-1`} placeholder="Пн–Пт 10:00–19:00" />
                </label>
                <label className="block text-[14px] font-medium">
                  {t.phones}
                  <input name="phones" defaultValue={(cur.phones ?? []).join(", ")} className={`${fc} mt-1`} />
                </label>
                <label className="block text-[14px] font-medium">
                  {t.site}
                  <input name="site" defaultValue={cur.site ?? ""} className={`${fc} mt-1`} />
                </label>
                <label className="block text-[14px] font-medium">
                  {t.ig}
                  <input name="ig" defaultValue={cur.ig ?? ""} className={`${fc} mt-1`} />
                </label>
              </div>
              <label className="flex items-start gap-2 text-[14px]">
                <input type="checkbox" name="team_requests" defaultChecked={cur.team_requests !== false} className="mt-1" />
                {t.teamReq}
              </label>
              <button className="btn-primary h-11 px-6">{t.save}</button>
            </form>
            <p className="mt-4 text-[13px] text-muted">📷 {t.photos}</p>
          </section>
        </div>
      ) : (
        <p className="mt-6 text-[15px] text-muted">{t.none}</p>
      )}

      {/* Найти или добавить */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-cream p-5">
          <h2 className="text-[17px] font-bold">{t.findTitle}</h2>
          <p className="mt-2 text-[14px] text-muted">{t.findText}</p>
          <Link href={href(lang, "/places")} className="btn-ghost mt-3 h-10 px-4 text-[14px]">
            {t.findBtn}
          </Link>
        </div>
        <details className="rounded-2xl border border-line p-5" open={mine.length === 0}>
          <summary className="cursor-pointer text-[17px] font-bold">{t.newTitle}</summary>
          <p className="mt-2 text-[14px] text-muted">{t.newText}</p>
          <form action={createOrg} className="mt-3 space-y-3">
            <input type="hidden" name="lang" value={lang} />
            <input name="name" required minLength={2} maxLength={120} placeholder={t.name} className={fc} />
            <select name="cat" required className={fc} defaultValue="">
              <option value="" disabled>
                {t.type}
              </option>
              {PLACE_CATS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label[lang]}
                </option>
              ))}
            </select>
            <select name="city" required className={fc} defaultValue="batumi">
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label[lang]}
                </option>
              ))}
            </select>
            <input name="addr" placeholder={t.addr} className={fc} />
            <input name="phone" placeholder={t.phone} className={fc} />
            <input name="site" placeholder={t.site} className={fc} />
            <textarea name="desc" placeholder={t.desc} rows={3} className="field w-full py-2" />
            <button className="btn-primary h-11 w-full">{t.create}</button>
          </form>
        </details>
      </section>
    </div>
  );
}
