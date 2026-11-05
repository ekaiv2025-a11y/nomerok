import type { Locale } from "./i18n/config";

/*
 * Тексты страницы /orders («Кого ищут сейчас») для поиска и для людей.
 * Только то, что правда про устройство сайта: до 3 откликов (MAX_RESPONSES в lib/bot.ts),
 * заявка в ленте до 7 дней (LIVE_DAYS в lib/orders-db.ts), контакты видит только откликнувшийся.
 */
type Block = { h: string; p?: string[]; list?: string[] };
export type OrdersSeo = {
  title: string;
  description: string;
  h1: string;
  feed: string;
  clientCard: { h: string; list: string[]; cta: string };
  specCard: { h: string; list: string[]; cta: string };
  popular: string;
  blocks: Block[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  bottom: { h: string; p: string };
};

export const ORDERS_SEO: Record<Locale, OrdersSeo> = {
  ru: {
    title: "Заявки клиентов в Батуми и Грузии — кого ищут сейчас",
    description:
      "Свежие заявки клиентов: ремонт, репетиторы, красота, врачи и другие услуги в Батуми и по Грузии. Разместите свою — специалисты откликнутся сами. Специалистам — заказы без посредников.",
    h1: "Заявки клиентов: кого ищут сейчас",
    feed: "Свежие заявки",
    clientCard: {
      h: "Нужен специалист?",
      list: ["Опишите задачу за пару минут", "Заявка придёт специалистам нужного направления", "Откликнутся до трёх — выберете сами"],
      cta: "Разместить заявку",
    },
    specCard: {
      h: "Вы специалист?",
      list: ["Заявки вашего направления приходят в Telegram", "Откликаетесь только на то, что подходит", "Контакты клиента — сразу после отклика"],
      cta: "Получать заявки",
    },
    popular: "Найти специалиста в каталоге",
    blocks: [
      {
        h: "Как работают заявки на NomerOk",
        p: [
          "Клиент пишет, что нужно сделать, где и когда. Заявка уходит в Telegram специалистам этого направления в его городе. Откликнуться могут до трёх человек: у клиента есть выбор, а специалисту не нужно соревноваться с десятками других.",
          "Имени и телефона клиента в общей ленте нет. Их видит только тот, кто откликнулся. Клиент получает контакты специалиста и сам решает, с кем договориться. Цену, сроки и оплату обсуждаете напрямую.",
        ],
      },
      {
        h: "Что это даёт клиенту",
        list: [
          "Не нужно обзванивать десяток номеров: пишут те, кому удобно взяться за работу.",
          "Разместить заявку бесплатно.",
          "К заявке можно приложить фото — так специалисту проще понять задачу и назвать цену.",
          "Хотите выбрать сами — в каталоге есть анкеты с ценами, фото работ и отзывами, писать можно напрямую.",
        ],
      },
      {
        h: "Что это даёт специалисту",
        list: [
          "Заказы своего направления и города приходят в Telegram сразу, как клиент их отправил.",
          "Вы откликаетесь только на то, что подходит по времени, району и бюджету.",
          "После отклика сразу видите контакты клиента и работаете с ним напрямую.",
          "Лента выше — чтобы видеть, какие заказы бывают в вашем направлении.",
        ],
      },
      {
        h: "Как написать заявку, чтобы быстрее откликнулись",
        list: [
          "Пишите конкретно: «поменять смеситель на кухне», а не «нужен сантехник».",
          "Укажите район и удобное время.",
          "Приложите фото, особенно если это ремонт или техника.",
          "Если есть бюджет — напишите его, так откликнутся те, кому он подходит.",
          "Подключите Telegram: туда придут контакты специалистов.",
        ],
      },
    ],
    faqTitle: "Частые вопросы",
    faq: [
      { q: "Сколько стоит разместить заявку?", a: "Для клиента это бесплатно." },
      { q: "Кто увидит мой номер телефона?", a: "Только специалист, который откликнулся на заявку. В общей ленте контактов нет: телефоны, ссылки и ники из текста заявки убираются автоматически." },
      { q: "Сколько специалистов откликнется?", a: "До трёх. Когда откликов три, заявка уходит из общей ленты." },
      { q: "Как долго заявка висит на сайте?", a: "До 7 дней или пока вы не ответите, что уже договорились или заявка больше не нужна." },
      { q: "Что делать, если никто не откликнулся?", a: "Уточните заявку: добавьте фото, район и удобное время. Или посмотрите каталог — там можно написать специалисту напрямую." },
      { q: "Я специалист. Как получать такие заявки?", a: "Зарегистрируйтесь и подключите Telegram — заявки вашего направления и города будут приходить туда. Откликнуться можно и из кабинета на сайте." },
    ],
    bottom: { h: "Не нашли похожую заявку?", p: "Опишите свою задачу — её получат специалисты нужного направления, и свободные откликнутся сами." },
  },
  en: {
    title: "Client requests in Batumi and Georgia — who is needed now",
    description:
      "Fresh client requests: renovation, tutors, beauty, doctors and other services in Batumi and across Georgia. Post yours and specialists will respond. For specialists — direct orders without middlemen.",
    h1: "Client requests: who is needed now",
    feed: "Fresh requests",
    clientCard: {
      h: "Need a specialist?",
      list: ["Describe the task in a couple of minutes", "It goes to specialists in that field", "Up to three respond — you choose"],
      cta: "Post a request",
    },
    specCard: {
      h: "Are you a specialist?",
      list: ["Requests in your field arrive in Telegram", "Respond only to what suits you", "Client contacts right after you respond"],
      cta: "Get requests",
    },
    popular: "Find a specialist in the catalog",
    blocks: [
      {
        h: "How requests work on NomerOk",
        p: [
          "A client describes what needs doing, where and when. The request goes via Telegram to specialists in that field and city. Up to three can respond: the client gets a choice, and specialists don't compete with dozens of others.",
          "The client's name and phone are not shown in the public feed. Only the specialist who responds sees them. You agree on price, timing and payment directly.",
        ],
      },
      {
        h: "For clients",
        list: ["No need to call a dozen numbers — those who can take the job write to you.", "Posting a request is free.", "You can attach photos so specialists understand the task.", "Prefer to choose yourself? The catalog has profiles with prices, work photos and reviews."],
      },
      {
        h: "For specialists",
        list: ["Requests in your field and city arrive in Telegram right away.", "Respond only to what fits your time, area and budget.", "After responding you see the client's contacts and work directly."],
      },
      {
        h: "How to write a request that gets answers",
        list: ["Be specific: “replace a kitchen tap”, not “need a plumber”.", "Mention the area and a convenient time.", "Attach photos, especially for repairs.", "Add a budget if you have one.", "Connect Telegram to receive specialists' contacts."],
      },
    ],
    faqTitle: "FAQ",
    faq: [
      { q: "How much does posting a request cost?", a: "It is free for clients." },
      { q: "Who will see my phone number?", a: "Only the specialist who responds. The public feed has no contacts: phones, links and usernames are removed from the text automatically." },
      { q: "How many specialists will respond?", a: "Up to three. After three responses the request leaves the public feed." },
      { q: "How long does a request stay on the site?", a: "Up to 7 days, or until you tell us you've agreed with someone or no longer need it." },
      { q: "I'm a specialist. How do I get these requests?", a: "Sign up and connect Telegram — requests in your field and city will arrive there. You can also respond from your dashboard." },
    ],
    bottom: { h: "Didn't find a similar request?", p: "Describe your task — specialists in that field will get it, and those who are free will respond." },
  },
  ka: {
    title: "კლიენტების მოთხოვნები ბათუმსა და საქართველოში — ვის ეძებენ ახლა",
    description: "კლიენტების ახალი მოთხოვნები: რემონტი, რეპეტიტორები, სილამაზე, ექიმები და სხვა მომსახურება ბათუმსა და საქართველოში. განათავსეთ თქვენი — სპეციალისტები თავად გამოგეხმაურებიან.",
    h1: "კლიენტების მოთხოვნები: ვის ეძებენ ახლა",
    feed: "ახალი მოთხოვნები",
    clientCard: {
      h: "გჭირდებათ სპეციალისტი?",
      list: ["აღწერეთ დავალება ორ წუთში", "მოთხოვნა მიუვა ამ სფეროს სპეციალისტებს", "გამოგეხმაურებათ სამამდე — თავად აირჩევთ"],
      cta: "მოთხოვნის განთავსება",
    },
    specCard: {
      h: "სპეციალისტი ხართ?",
      list: ["თქვენი სფეროს მოთხოვნები მოდის Telegram-ში", "გამოეხმაურეთ მხოლოდ იმას, რაც გაწყობთ", "კლიენტის კონტაქტი — გამოხმაურებისთანავე"],
      cta: "მოთხოვნების მიღება",
    },
    popular: "სპეციალისტის პოვნა კატალოგში",
    blocks: [
      {
        h: "როგორ მუშაობს მოთხოვნები NomerOk-ზე",
        p: [
          "კლიენტი წერს, რა უნდა გაკეთდეს, სად და როდის. მოთხოვნა Telegram-ით მიდის ამ სფეროს სპეციალისტებთან მის ქალაქში. გამოხმაურება სამამდე სპეციალისტს შეუძლია.",
          "კლიენტის სახელი და ტელეფონი საერთო სიაში არ ჩანს — მათ ხედავს მხოლოდ გამოხმაურებული სპეციალისტი. ფასსა და ვადებზე პირდაპირ თანხმდებით.",
        ],
      },
    ],
    faqTitle: "ხშირი კითხვები",
    faq: [
      { q: "რა ღირს მოთხოვნის განთავსება?", a: "კლიენტისთვის უფასოა." },
      { q: "ვინ დაინახავს ჩემს ტელეფონს?", a: "მხოლოდ სპეციალისტი, რომელიც გამოგეხმაურებათ. საერთო სიაში კონტაქტები არ ჩანს." },
      { q: "რამდენი სპეციალისტი გამომეხმაურება?", a: "სამამდე. სამი გამოხმაურების შემდეგ მოთხოვნა საერთო სიიდან ქრება." },
      { q: "რამდენ ხანს რჩება მოთხოვნა საიტზე?", a: "7 დღემდე, ან სანამ არ გვეტყვით, რომ უკვე შეთანხმდით." },
    ],
    bottom: { h: "მსგავსი მოთხოვნა ვერ იპოვეთ?", p: "აღწერეთ თქვენი დავალება — თავისუფალი სპეციალისტები გამოგეხმაურებიან." },
  },
};
