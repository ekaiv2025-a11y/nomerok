import type { Locale } from "./i18n/config";

/* Тексты для «Избранного», «Порекомендовать мастера», «на связи», сторис — на трёх языках. */
export const SOCIAL: Record<
  Locale,
  {
    fav: string; favAdd: string; favRemove: string; favTitle: string; favEmpty: string; favHint: string;
    activeToday: string; activeWeek: string;
    recTitle: string; recLead: string; recMaster: string; recContact: string; recContactHint: string; recWhat: string; recWhatPh: string; recYou: string; recSend: string;
    recDoneTitle: string; recDoneText: string; recShareTg: string; recCopy: string; recCopied: string; recInvite: (who: string) => string; recLink: string; recError: string;
    story: string; storyTitle: string; storyHint: string;
  }
> = {
  ru: {
    fav: "Избранное", favAdd: "В избранное", favRemove: "Убрать из избранного", favTitle: "Избранные специалисты",
    favEmpty: "Пока пусто. Нажмите ♡ на карточке специалиста — он сохранится здесь.", favHint: "Список хранится только на этом устройстве.",
    activeToday: "На связи сегодня", activeWeek: "На связи на этой неделе",
    recTitle: "Порекомендуйте мастера", recLead: "Знаете хорошего специалиста? Пригласите его на NomerOk — так его найдут и другие. Мы подготовим приглашение, которое вы отправите ему сами.",
    recMaster: "Имя специалиста", recContact: "Его Telegram или телефон", recContactHint: "Необязательно — пригодится, если он не ответит вам", recWhat: "Чем занимается",
    recWhatPh: "Например: маникюр, сантехник, репетитор по математике", recYou: "Ваше имя", recSend: "Получить приглашение",
    recDoneTitle: "Спасибо! Осталось отправить приглашение", recDoneText: "Отправьте специалисту это сообщение — от вас оно прозвучит лучше любой рекламы:",
    recShareTg: "Отправить в Telegram", recCopy: "Скопировать текст", recCopied: "Скопировано ✓",
    recInvite: (who) => `Привет! ${who ? `Это ${who}. ` : ""}Хочу порекомендовать тебя на NomerOk.ge — это каталог специалистов Батуми и Грузии. Профиль делается за 3 минуты через Telegram, клиенты пишут напрямую, заявки приходят в Telegram, без комиссии: https://nomerok.ge/join`,
    recLink: "Порекомендовать мастера", recError: "Не получилось. Попробуйте ещё раз.",
    story: "Картинка для сторис", storyTitle: "Меня можно найти на", storyHint: "Выложите в Instagram или Telegram — по QR-коду клиенты откроют ваш профиль.",
  },
  en: {
    fav: "Favourites", favAdd: "Save", favRemove: "Remove from favourites", favTitle: "Saved specialists",
    favEmpty: "Nothing here yet. Tap ♡ on a specialist's card to save them.", favHint: "The list is stored only on this device.",
    activeToday: "Active today", activeWeek: "Active this week",
    recTitle: "Recommend a specialist", recLead: "Know a good specialist? Invite them to NomerOk so others can find them too. We'll prepare an invitation for you to send.",
    recMaster: "Specialist's name", recContact: "Their Telegram or phone", recContactHint: "Optional", recWhat: "What they do",
    recWhatPh: "e.g. nails, plumber, maths tutor", recYou: "Your name", recSend: "Get the invitation",
    recDoneTitle: "Thank you! Now send the invitation", recDoneText: "Send this message to the specialist — coming from you, it works better than any ad:",
    recShareTg: "Send via Telegram", recCopy: "Copy text", recCopied: "Copied ✓",
    recInvite: (who) => `Hi! ${who ? `It's ${who}. ` : ""}I'd like to recommend you on NomerOk.ge — a catalog of specialists in Batumi and Georgia. A profile takes 3 minutes via Telegram, clients contact you directly, requests arrive in Telegram, no commission: https://nomerok.ge/join`,
    recLink: "Recommend a specialist", recError: "Something went wrong. Please try again.",
    story: "Story image", storyTitle: "Find me on", storyHint: "Post it on Instagram or Telegram — the QR code opens your profile.",
  },
  ka: {
    fav: "რჩეულები", favAdd: "შენახვა", favRemove: "რჩეულებიდან ამოღება", favTitle: "შენახული სპეციალისტები",
    favEmpty: "ჯერ ცარიელია. დააჭირეთ ♡-ს სპეციალისტის ბარათზე.", favHint: "სია ინახება მხოლოდ ამ მოწყობილობაზე.",
    activeToday: "დღეს ონლაინ იყო", activeWeek: "ამ კვირაში ონლაინ იყო",
    recTitle: "ურჩიეთ ოსტატი", recLead: "იცნობთ კარგ სპეციალისტს? მოიწვიეთ NomerOk-ზე. მოსაწვევს ჩვენ მოვამზადებთ, თქვენ კი გაუგზავნით.",
    recMaster: "სპეციალისტის სახელი", recContact: "მისი Telegram ან ტელეფონი", recContactHint: "არასავალდებულო", recWhat: "რას აკეთებს",
    recWhatPh: "მაგ.: მანიკიური, სანტექნიკოსი", recYou: "თქვენი სახელი", recSend: "მოსაწვევის მიღება",
    recDoneTitle: "მადლობა! დარჩა მოსაწვევის გაგზავნა", recDoneText: "გაუგზავნეთ სპეციალისტს ეს შეტყობინება:",
    recShareTg: "Telegram-ით გაგზავნა", recCopy: "ტექსტის კოპირება", recCopied: "დაკოპირდა ✓",
    recInvite: (who) => `გამარჯობა! ${who ? `${who} ვარ. ` : ""}მინდა გირჩიო NomerOk.ge — ბათუმისა და საქართველოს სპეციალისტების კატალოგი. პროფილი 3 წუთში კეთდება Telegram-ით, კლიენტები პირდაპირ გიკავშირდებიან, საკომისიოს გარეშე: https://nomerok.ge/join`,
    recLink: "ურჩიეთ ოსტატი", recError: "ვერ მოხერხდა. სცადეთ ხელახლა.",
    story: "სურათი სთორისთვის", storyTitle: "მიპოვეთ", storyHint: "გამოაქვეყნეთ Instagram-ში ან Telegram-ში — QR-კოდი თქვენს პროფილს გახსნის.",
  },
};
