/** Опрос «что помешало?» — ответы храним по-русски (первая строка), показываем на языке сайта. */
import type { Locale } from "./i18n";
import type { Funnel } from "./track";

type Opt = [ru: string, en: string, ka: string];
export const SURVEY: Record<Funnel, { q: Opt; o: Opt[] }> = {
  request: {
    q: ["Что помешало оставить заявку?", "What stopped you from sending a request?", "რა შეგიშალათ ხელი განაცხადის დატოვებაში?"],
    o: [
      ["Просто смотрю", "Just browsing", "უბრალოდ ვათვალიერებ"],
      ["Не нашёл нужного специалиста", "Couldn't find the right specialist", "საჭირო სპეციალისტი ვერ ვიპოვე"],
      ["Не хочу оставлять телефон", "Don't want to share my phone", "ტელეფონის დატოვება არ მინდა"],
      ["Форма длинная или непонятная", "The form is long or unclear", "ფორმა გრძელი ან გაუგებარია"],
      ["Напишу специалисту сам", "I'll contact a specialist myself", "სპეციალისტს თავად მივწერ"],
      ["Другое", "Other", "სხვა"],
    ],
  },
  message: {
    q: ["Что помешало написать специалисту?", "What stopped you from messaging the specialist?", "რა შეგიშალათ ხელი სპეციალისტისთვის მიწერაში?"],
    o: [
      ["Просто смотрю", "Just browsing", "უბრალოდ ვათვალიერებ"],
      ["Не хочу оставлять телефон", "Don't want to share my phone", "ტელეფონის დატოვება არ მინდა"],
      ["Не понятна цена", "Price is unclear", "ფასი გაუგებარია"],
      ["Мало отзывов", "Too few reviews", "ცოტა შეფასებაა"],
      ["Позвоню или напишу сам", "I'll call or text myself", "თავად დავრეკავ ან მივწერ"],
      ["Другое", "Other", "სხვა"],
    ],
  },
  join: {
    q: ["Что останавливает от регистрации?", "What's stopping you from signing up?", "რა გაჩერებთ რეგისტრაციისგან?"],
    o: [
      ["Пока просто узнаю условия", "Just checking the terms", "ჯერ პირობებს ვეცნობი"],
      ["Нет Telegram или неудобно", "No Telegram / inconvenient", "Telegram არ მაქვს ან მოუხერხებელია"],
      ["Не понял, платно ли это", "Not sure if it's paid", "ვერ გავიგე, ფასიანია თუ არა"],
      ["Не хочу публиковать телефон", "Don't want to publish my phone", "ტელეფონის გამოქვეყნება არ მინდა"],
      ["Долго заполнять", "Takes too long to fill in", "შევსებას დიდი დრო სჭირდება"],
      ["Не уверен, что будут клиенты", "Not sure I'll get clients", "არ ვარ დარწმუნებული, რომ კლიენტები იქნება"],
      ["Другое", "Other", "სხვა"],
    ],
  },
  project: {
    q: ["Что помешало оставить заявку?", "What stopped you from sending a request?", "რა შეგიშალათ ხელი განაცხადის დატოვებაში?"],
    o: [
      ["Просто смотрю", "Just browsing", "უბრალოდ ვათვალიერებ"],
      ["Не хочу, чтобы звонили", "Don't want calls", "არ მინდა დამირეკონ"],
      ["Нет нужного города или ЖК", "No city or complex I need", "საჭირო ქალაქი ან კომპლექსი არ არის"],
      ["Мало информации о ЖК", "Too little info about the complex", "კომპლექსზე ცოტა ინფორმაციაა"],
      ["Другое", "Other", "სხვა"],
    ],
  },
};
export const SV_UI = {
  ru: { send: "Отправить", skip: "Закрыть", other: "Напишите, что не так (по желанию)", thanks: "Спасибо! Это поможет сделать сайт удобнее." },
  en: { send: "Send", skip: "Close", other: "Tell us what's wrong (optional)", thanks: "Thank you! This helps us improve the site." },
  ka: { send: "გაგზავნა", skip: "დახურვა", other: "დაწერეთ, რა არ მოგეწონათ (სურვილისამებრ)", thanks: "მადლობა! ეს საიტის გაუმჯობესებაში დაგვეხმარება." },
} as const satisfies Record<Locale, unknown>;
