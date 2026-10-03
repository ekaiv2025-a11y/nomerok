import type { Locale } from "./i18n/config";

export const ORD: Record<
  Locale,
  {
    nav: string; title: string; lead: string; latest: string; all: string; empty: string;
    open: string; responded: (n: number) => string; closed: string; take: string; takeSpec: string; similar: string;
    ago: (min: number) => string; when: string; photo: string;
    forYou: string; forYouHint: string; forYouEmpty: string; mine: string; mineEmpty: string; direct: string; directEmpty: string;
    client: string; call: string; write: string; took: string; errors: Record<string, string>; subscribeHint: string;
  }
> = {
  ru: {
    nav: "Заказы", title: "Лента заказов", lead: "Что сейчас ищут клиенты. Контакты клиента видит только специалист, который откликнулся.",
    latest: "Свежие заказы", all: "Вся лента →", empty: "Пока заказов нет — станьте первым: разместите заявку.",
    open: "Ищут специалиста", responded: (n) => `Откликов: ${n}`, closed: "Закрыта", take: "Откликнуться", takeSpec: "Я специалист — откликнуться", similar: "Нужно то же самое? Разместить заявку",
    ago: (m) => (m < 60 ? `${Math.max(1, m)} мин назад` : m < 1440 ? `${Math.floor(m / 60)} ч назад` : `${Math.floor(m / 1440)} дн назад`),
    when: "Когда", photo: "фото",
    forYou: "Заказы для вас", forYouHint: "Открытые заявки вашего направления и города. Нажмите «Откликнуться» — получите контакты клиента, а он — ваши.",
    forYouEmpty: "Сейчас открытых заказов по вашему направлению нет. Новые придут в Telegram, если включены заявки.",
    mine: "Мои отклики", mineEmpty: "Вы ещё не откликались на заявки.", direct: "Личные сообщения", directEmpty: "Клиенты пока не писали вам через сайт.",
    client: "Клиент", call: "Позвонить", write: "Написать в Telegram", took: "Вы откликнулись",
    errors: { gone: "Заявка уже неактуальна.", notAllowed: "Откликаться могут специалисты с опубликованным профилем и подтверждённым номером.", already: "Вы уже откликнулись.", full: "На заявку уже откликнулись 3 специалиста.", login: "Войдите в кабинет специалиста." },
    subscribeHint: "Хотите получать такие заказы сразу в Telegram? Включите «Получать заявки» выше.",
  },
  en: {
    nav: "Orders", title: "Order feed", lead: "What clients are looking for right now. Client contacts are visible only to the specialist who responds.",
    latest: "Latest orders", all: "All orders →", empty: "No orders yet — be the first: post a request.",
    open: "Looking for a specialist", responded: (n) => `Responses: ${n}`, closed: "Closed", take: "Respond", takeSpec: "I'm a specialist — respond", similar: "Need the same? Post a request",
    ago: (m) => (m < 60 ? `${Math.max(1, m)} min ago` : m < 1440 ? `${Math.floor(m / 60)} h ago` : `${Math.floor(m / 1440)} d ago`),
    when: "When", photo: "photo",
    forYou: "Orders for you", forYouHint: "Open requests in your field and city. Tap “Respond” to get the client's contacts.",
    forYouEmpty: "No open orders in your field right now.", mine: "My responses", mineEmpty: "You haven't responded yet.", direct: "Direct messages", directEmpty: "No messages via the site yet.",
    client: "Client", call: "Call", write: "Message on Telegram", took: "You responded",
    errors: { gone: "This request is no longer active.", notAllowed: "Only published specialists with a verified number can respond.", already: "You already responded.", full: "3 specialists have already responded.", login: "Log in to your account." },
    subscribeHint: "Want such orders in Telegram instantly? Turn on “Receive requests” above.",
  },
  ka: {
    nav: "შეკვეთები", title: "შეკვეთების ლენტა", lead: "რას ეძებენ კლიენტები ახლა. კლიენტის კონტაქტს ხედავს მხოლოდ გამოხმაურებული სპეციალისტი.",
    latest: "ახალი შეკვეთები", all: "ყველა შეკვეთა →", empty: "შეკვეთები ჯერ არ არის.",
    open: "ეძებენ სპეციალისტს", responded: (n) => `გამოხმაურება: ${n}`, closed: "დახურულია", take: "გამოხმაურება", takeSpec: "სპეციალისტი ვარ — გამოხმაურება", similar: "იგივე გჭირდებათ? განათავსეთ განაცხადი",
    ago: (m) => (m < 60 ? `${Math.max(1, m)} წთ წინ` : m < 1440 ? `${Math.floor(m / 60)} სთ წინ` : `${Math.floor(m / 1440)} დღის წინ`),
    when: "როდის", photo: "ფოტო",
    forYou: "შეკვეთები თქვენთვის", forYouHint: "თქვენი მიმართულების ღია განაცხადები.", forYouEmpty: "ახლა ღია შეკვეთები არ არის.",
    mine: "ჩემი გამოხმაურებები", mineEmpty: "ჯერ არ გამოხმაურებიხართ.", direct: "პირადი შეტყობინებები", directEmpty: "შეტყობინებები ჯერ არ არის.",
    client: "კლიენტი", call: "დარეკვა", write: "Telegram", took: "გამოეხმაურეთ",
    errors: { gone: "განაცხადი აღარ არის აქტუალური.", notAllowed: "გამოხმაურება შეუძლიათ მხოლოდ გამოქვეყნებულ სპეციალისტებს.", already: "უკვე გამოეხმაურეთ.", full: "უკვე 3 სპეციალისტი გამოეხმაურა.", login: "შედით კაბინეტში." },
    subscribeHint: "გსურთ ასეთი შეკვეთები Telegram-ში? ჩართეთ „განაცხადების მიღება“.",
  },
};
