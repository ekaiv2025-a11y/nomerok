import type { Metadata } from "next";
import Link from "next/link";
import { adminGetMaster } from "@/lib/db";
import { currentSpecialistId } from "@/lib/spec-auth";
import { isRealtor } from "@/lib/realty-auth";
import { botUsername } from "@/lib/telegram";
import { href } from "@/lib/i18n";
import { langOf, pageMeta, type LangParams } from "@/lib/i18n/page";

export const dynamic = "force-dynamic";

const T = {
  ru: {
    meta: "Риелторам: объявления на NomerOk бесплатно",
    h1: "Риелторам и агентствам",
    lead: "Публикуйте квартиры в аренду, посуточно и на продажу в разделе «Недвижимость» — бесплатно. Рядом с объявлением клиент видит вашу анкету, отзывы и подтверждённый номер, а связывается с вами напрямую.",
    steps: "Как начать",
    s1: ["Зарегистрируйтесь как специалист", "В анкете выберите направление «Риелтор» (или добавьте его к основному в «Анкете» → дополнительные направления)."],
    s2: ["Добавляйте объявления", "Кабинет → «🏠 Объявления» → «Новое объявление». Вставьте текст поста — кнопка «Заполнить из текста» сама найдёт цену, комнаты, площадь и район. Добавьте до 12 фото."],
    s3: ["Или подключите Telegram-канал", "Добавьте нашего бота администратором в свой канал — каждый новый пост с фото и описанием квартиры сам станет объявлением на сайте."],
    rules: "Правила",
    ruleList: [
      "Только реальные объекты, свои фото и актуальные цены.",
      "Объявление живёт 60 дней, потом уходит в архив — продлить можно одной кнопкой.",
      "На объявление можно пожаловаться: после 3 жалоб оно скрывается до проверки.",
    ],
    bot: (b: string) => `Бот для канала: @${b} — добавьте его в канал администратором. Публиковать он ничего не будет, только читать новые посты.`,
    // кнопки по ситуации
    open: "Открыть мои объявления",
    addCat: "Добавить направление «Риелтор» в анкете",
    notRealtor: (n: string) => `Вы вошли как ${n}. Чтобы публиковать объявления, добавьте в анкету направление «Риелтор».`,
    join: "Зарегистрироваться как риелтор",
    login: "У меня уже есть анкета — войти",
    see: "Посмотреть раздел «Недвижимость»",
  },
  en: {
    meta: "For real estate agents: free listings on NomerOk",
    h1: "For real estate agents",
    lead: "Post apartments for rent, daily and for sale in the Real estate section — free. Next to each listing clients see your profile, reviews and verified phone, and contact you directly.",
    steps: "How to start",
    s1: ["Sign up as a specialist", "Choose “Real estate agent” as your field (or add it as an extra field in your profile)."],
    s2: ["Add listings", "Dashboard → “🏠 Listings” → “New listing”. Paste your post — “Fill from text” finds price, rooms, area and district. Add up to 12 photos."],
    s3: ["Or connect your Telegram channel", "Add our bot as an admin of your channel — every new post with photos and a description becomes a listing on the site."],
    rules: "Rules",
    ruleList: ["Only real properties, your own photos and current prices.", "A listing lives 60 days, then goes to the archive — renew with one tap.", "Listings can be reported: after 3 reports a listing is hidden until checked."],
    bot: (b: string) => `Channel bot: @${b} — add it to your channel as an administrator.`,
    open: "Open my listings",
    addCat: "Add “Real estate agent” to my profile",
    notRealtor: (n: string) => `You're signed in as ${n}. To post listings, add the “Real estate agent” field to your profile.`,
    join: "Sign up as an agent",
    login: "I already have a profile — sign in",
    see: "See the Real estate section",
  },
  ka: {
    meta: "რიელტორებს: განცხადებები NomerOk-ზე უფასოდ",
    h1: "რიელტორებს და სააგენტოებს",
    lead: "განათავსეთ ბინები ქირით, დღიურად და გასაყიდად «უძრავი ქონების» განყოფილებაში — უფასოდ. განცხადების გვერდით კლიენტი ხედავს თქვენს ანკეტას, შეფასებებს და დადასტურებულ ნომერს.",
    steps: "როგორ დავიწყოთ",
    s1: ["დარეგისტრირდით სპეციალისტად", "ანკეტაში აირჩიეთ მიმართულება «რიელტორი» (ან დაამატეთ დამატებით მიმართულებად)."],
    s2: ["დაამატეთ განცხადებები", "კაბინეტი → «🏠 განცხადებები» → «ახალი განცხადება». ჩასვით პოსტის ტექსტი — «ტექსტიდან შევსება» იპოვის ფასს, ოთახებს, ფართს და რაიონს."],
    s3: ["ან მიაერთეთ Telegram-არხი", "დაამატეთ ჩვენი ბოტი არხის ადმინისტრატორად — ყოველი ახალი პოსტი ფოტოებით თავად გახდება განცხადება."],
    rules: "წესები",
    ruleList: ["მხოლოდ რეალური ობიექტები, საკუთარი ფოტოები და აქტუალური ფასები.", "განცხადება 60 დღე ცოცხლობს, შემდეგ არქივში გადადის — გაგრძელება ერთი ღილაკით.", "3 საჩივრის შემდეგ განცხადება იმალება შემოწმებამდე."],
    bot: (b: string) => `არხის ბოტი: @${b} — დაამატეთ არხში ადმინისტრატორად.`,
    open: "ჩემი განცხადებები",
    addCat: "«რიელტორის» დამატება ანკეტაში",
    notRealtor: (n: string) => `შესული ხართ როგორც ${n}. განცხადებებისთვის დაამატეთ ანკეტაში მიმართულება «რიელტორი».`,
    join: "რეგისტრაცია რიელტორად",
    login: "უკვე მაქვს ანკეტა — შესვლა",
    see: "«უძრავი ქონების» ნახვა",
  },
} as const;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langOf(params);
  return pageMeta(lang, "/realty/agents", T[lang].meta, T[lang].lead);
}

export default async function RealtyAgentsPage({ params }: LangParams) {
  const lang = await langOf(params);
  const t = T[lang];
  const id = await currentSpecialistId();
  const m = id ? await adminGetMaster(id).catch(() => null) : null;
  const realtor = !!m && isRealtor(m);
  const bot = await botUsername();
  const steps = [t.s1, t.s2, t.s3];
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Link href={href(lang, "/realty")} className="text-[14px] text-muted hover:text-ink">
        ← {t.see}
      </Link>
      <h1 className="mt-3 text-[28px] font-bold leading-tight sm:text-[36px]">🏠 {t.h1}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">{t.lead}</p>

      <div className="mt-6 rounded-2xl border-2 border-brand/30 bg-brand-soft p-5">
        {realtor ? (
          <Link href={`/${lang}/cabinet?tab=realty`} className="btn-primary h-12 px-6">
            {t.open} →
          </Link>
        ) : m ? (
          <>
            <p className="text-[15px]">{t.notRealtor(m.name)}</p>
            <Link href={`/${lang}/cabinet?tab=profile`} className="btn-primary mt-3 h-12 px-6">
              {t.addCat} →
            </Link>
          </>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Link href={href(lang, "/join")} className="btn-primary h-12 px-6">
              {t.join}
            </Link>
            <Link href={href(lang, "/cabinet")} className="btn-ghost h-12 px-5">
              {t.login}
            </Link>
          </div>
        )}
      </div>

      <h2 className="mt-10 text-[22px] font-bold">{t.steps}</h2>
      <ol className="mt-4 space-y-4">
        {steps.map(([title, text], i) => (
          <li key={i} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-[16px] font-bold text-white">{i + 1}</span>
            <span>
              <span className="block text-[16px] font-semibold">{title}</span>
              <span className="mt-1 block text-[14px] leading-relaxed text-muted">{text}</span>
              {i === 2 && bot && <span className="mt-2 block rounded-xl bg-cream p-3 text-[14px] font-medium">🤖 {t.bot(bot)}</span>}
            </span>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-[22px] font-bold">{t.rules}</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[15px] marker:text-brand">
        {t.ruleList.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
