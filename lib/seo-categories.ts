import type { Locale } from "./i18n/config";

/*
 * Страницы-лендинги по направлениям (для поиска Google и Яндекса): /ru/services/plumber
 * Тексты — по языкам. Цены в ответах подставляются из профилей настоящих специалистов.
 */

export type SeoText = {
  title: string; // <title> страницы
  description: string;
  h1: string;
  lead: string;
  servicesTitle: string;
  services: string[];
  chooseTitle: string;
  choose: string[];
  faq: { q: string; a: string }[];
  /** Ответ про цену: {price} — «от 40 ₾ за выезд», если есть настоящие мастера с ценой */
  priceQ: string;
  priceA: (price: string | null) => string;
};

export const SEO_CATEGORIES: Record<string, Partial<Record<Locale, SeoText>>> = {
  plumber: {
    ru: {
      title: "Сантехники в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Сантехники Батуми с подтверждёнными номерами: фото работ, цены и настоящие отзывы. Звоните мастеру напрямую или оставьте заявку — свободные сантехники откликнутся сами.",
      h1: "Сантехники в Батуми",
      lead: "Номера сантехников, подтверждённые через Telegram: фото работ, цены и настоящие отзывы. Звоните напрямую — или оставьте заявку, и свободные мастера откликнутся сами.",
      servicesTitle: "С чем помогут сантехники",
      services: [
        "Замена смесителей и кранов",
        "Устранение засоров",
        "Установка унитаза, раковины, душевой кабины",
        "Установка и ремонт бойлера",
        "Подключение стиральной и посудомоечной машины",
        "Замена труб и разводка",
        "Поиск и устранение протечек",
      ],
      chooseTitle: "Как выбрать сантехника",
      choose: [
        "Смотрите фото работ в профиле — видно, насколько аккуратно мастер работает.",
        "Обратите внимание на отметку «Номер подтверждён»: мастер подтвердил номер через Telegram.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Спросите цену и гарантию до начала работы. Хороший мастер сначала смотрит, потом называет цену.",
        "Нужно срочно — оставьте заявку: её сразу получат все сантехники каталога.",
      ],
      priceQ: "Сколько стоит вызов сантехника в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый мастер указывает цены в своём профиле. Сейчас в каталоге — ${p}. Точную стоимость сантехник называет после осмотра.`
          : "Каждый мастер указывает цены в своём профиле. Точную стоимость сантехник называет после осмотра — спросите цену до начала работы.",
      faq: [
        {
          q: "Можно вызвать сантехника срочно?",
          a: "Да. Оставьте заявку и напишите, что срочно, — её сразу получат все сантехники каталога в Telegram, свободные сами вам позвонят.",
        },
        {
          q: "Сантехники говорят по-русски?",
          a: "В профиле каждого мастера указаны языки общения. Многие говорят на русском, грузинском и английском — выберите, с кем вам удобно.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Вы договариваетесь с мастером напрямую, сервис не берёт денег с клиентов и не делает наценку.",
        },
      ],
    },
    en: {
      title: "Plumbers in Batumi — prices, reviews, direct contacts",
      description:
        "Plumbers in Batumi with verified phone numbers: work photos, prices and real reviews. Call a plumber directly or post a request and available plumbers will contact you.",
      h1: "Plumbers in Batumi",
      lead: "Plumbers' numbers verified via Telegram, with work photos, prices and real reviews. Call directly — or post a request and available plumbers will get back to you.",
      servicesTitle: "What plumbers can help with",
      services: [
        "Replacing taps and mixers",
        "Clearing blockages",
        "Installing toilets, sinks and shower cabins",
        "Installing and repairing water heaters",
        "Connecting washing machines and dishwashers",
        "Pipe replacement and new plumbing",
        "Finding and fixing leaks",
      ],
      chooseTitle: "How to choose a plumber",
      choose: [
        "Look at work photos in the profile — you can see how neatly the plumber works.",
        "Check the “Phone verified” badge — the number was confirmed via Telegram.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Agree on the price and warranty before work starts.",
        "Urgent? Post a request — every plumber in the catalogue gets it at once.",
      ],
      priceQ: "How much does a plumber cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each plumber lists prices in their profile. Right now the catalogue shows ${p}. The final price is given after inspection.`
          : "Each plumber lists prices in their profile. The final price is given after inspection — ask before work starts.",
      faq: [
        { q: "Can I get a plumber urgently?", a: "Yes. Post a request and mark it urgent — every plumber in the catalogue gets it in Telegram, and those who are free will call you." },
        { q: "Do plumbers speak English or Russian?", a: "Each profile lists the languages the plumber speaks. Many speak Georgian, Russian and English." },
        { q: "Does NomerOk charge a fee?", a: "No. You agree everything with the plumber directly; clients never pay the service." },
      ],
    },
    ka: {
      title: "სანტექნიკოსები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის სანტექნიკოსები დადასტურებული ნომრებით: სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "სანტექნიკოსები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი ხელოსნები თავად დაგიკავშირდებიან.",
      servicesTitle: "რაში დაგეხმარებათ სანტექნიკოსი",
      services: [
        "ონკანების და შემრევების გამოცვლა",
        "დაცობის აღმოფხვრა",
        "უნიტაზის, ნიჟარის, საშხაპე კაბინის მონტაჟი",
        "წყლის გამაცხელებლის მონტაჟი და შეკეთება",
        "სარეცხი და ჭურჭლის სარეცხი მანქანის მიერთება",
        "მილების გამოცვლა",
        "გაჟონვის პოვნა და აღმოფხვრა",
      ],
      chooseTitle: "როგორ ავირჩიოთ სანტექნიკოსი",
      choose: [
        "ნახეთ სამუშაოების ფოტოები პროფილში — ჩანს, რამდენად ფრთხილად მუშაობს ხელოსანი.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "ფასი და გარანტია შეათანხმეთ სამუშაოს დაწყებამდე.",
        "სასწრაფოდ გჭირდებათ? დატოვეთ განაცხადი — მას ყველა სანტექნიკოსი მიიღებს.",
      ],
      priceQ: "რა ღირს სანტექნიკოსის გამოძახება ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული ხელოსანი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. ზუსტ ფასს სანტექნიკოსი დათვალიერების შემდეგ გეტყვით.`
          : "თითოეული ხელოსანი ფასებს პროფილში უთითებს. ზუსტ ფასს სანტექნიკოსი დათვალიერების შემდეგ გეტყვით.",
      faq: [
        { q: "შეიძლება სანტექნიკოსის სასწრაფოდ გამოძახება?", a: "დიახ. დატოვეთ განაცხადი და მიუთითეთ, რომ სასწრაფოა — მას ყველა სანტექნიკოსი მიიღებს Telegram-ში." },
        { q: "NomerOk იღებს საკომისიოს?", a: "არა. ხელოსანთან პირდაპირ თანხმდებით, კლიენტები სერვისს არაფერს უხდიან." },
      ],
    },
  },
};

export function seoText(cat: string, lang: Locale): SeoText | null {
  return SEO_CATEGORIES[cat]?.[lang] ?? null;
}

export function seoCategoryIds(): string[] {
  return Object.keys(SEO_CATEGORIES);
}
