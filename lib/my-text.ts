import type { Locale } from "./i18n/config";

export const MY: Record<
  Locale,
  {
    title: string; nav: string; loginLead: string; loginBtn: string; loginNote: string; noBot: string;
    requests: string; noRequests: string; newRequest: string; similar: string; close: string; closed: string; logout: string;
    status: Record<string, string>; responded: string; noResponses: string; profile: string; review: string;
    favs: string; favsNote: string; worked: string; when: string;
  }
> = {
  ru: {
    title: "Мои заявки", nav: "Мои заявки",
    loginLead: "Здесь — ваши заявки, кто на них откликнулся, и избранные специалисты. Регистрация не нужна: вход через Telegram в одно нажатие.",
    loginBtn: "Войти через Telegram", loginNote: "Откроется наш бот — нажмите «Start», и он пришлёт ссылку для входа.", noBot: "Вход временно недоступен.",
    requests: "Заявки", noRequests: "Заявок пока нет. Здесь появятся заявки, которые вы оставите на сайте и подключите к Telegram.",
    newRequest: "Разместить заявку", similar: "Похожая заявка", close: "Закрыть заявку", closed: "Закрыта", logout: "Выйти",
    status: { new: "Новая", sent: "Разослана специалистам", taken: "Есть отклики", in_work: "В работе", done: "Закрыта" },
    responded: "Откликнулись", noResponses: "Пока никто не откликнулся — как только ответят, пришлём в Telegram.",
    profile: "Профиль", review: "Оставить отзыв", favs: "Избранные специалисты", favsNote: "Сохраняются в вашем аккаунте — видны на любом устройстве после входа.",
    worked: "Вы договорились", when: "Когда",
  },
  en: {
    title: "My requests", nav: "My requests",
    loginLead: "Your requests, who responded, and saved specialists. No sign-up: log in with Telegram in one tap.",
    loginBtn: "Log in with Telegram", loginNote: "Our bot will open — tap “Start” and it will send you a login link.", noBot: "Login is temporarily unavailable.",
    requests: "Requests", noRequests: "No requests yet. Requests you leave on the site and connect to Telegram will appear here.",
    newRequest: "Post a request", similar: "Similar request", close: "Close request", closed: "Closed", logout: "Log out",
    status: { new: "New", sent: "Sent to specialists", taken: "Has responses", in_work: "In progress", done: "Closed" },
    responded: "Responded", noResponses: "No responses yet — we'll message you in Telegram as soon as someone replies.",
    profile: "Profile", review: "Leave a review", favs: "Saved specialists", favsNote: "Saved to your account — visible on any device after login.",
    worked: "You agreed", when: "When",
  },
  ka: {
    title: "ჩემი განაცხადები", nav: "ჩემი განაცხადები",
    loginLead: "აქ არის თქვენი განაცხადები, ვინ გამოეხმაურა და შენახული სპეციალისტები. რეგისტრაცია არ არის საჭირო — შესვლა Telegram-ით.",
    loginBtn: "შესვლა Telegram-ით", loginNote: "გაიხსნება ჩვენი ბოტი — დააჭირეთ „Start“-ს და ის გამოგიგზავნით ბმულს.", noBot: "შესვლა დროებით მიუწვდომელია.",
    requests: "განაცხადები", noRequests: "განაცხადები ჯერ არ არის.",
    newRequest: "განაცხადის განთავსება", similar: "მსგავსი განაცხადი", close: "დახურვა", closed: "დახურულია", logout: "გასვლა",
    status: { new: "ახალი", sent: "გაეგზავნა სპეციალისტებს", taken: "არის გამოხმაურება", in_work: "მიმდინარე", done: "დახურულია" },
    responded: "გამოეხმაურნენ", noResponses: "ჯერ არავინ გამოხმაურებია — Telegram-ში შეგატყობინებთ.",
    profile: "პროფილი", review: "შეფასების დატოვება", favs: "შენახული სპეციალისტები", favsNote: "ინახება თქვენს ანგარიშში.",
    worked: "შეთანხმდით", when: "როდის",
  },
};
