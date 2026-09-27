import type { Locale } from "./config";

/* Тексты Telegram-бота на трёх языках. Разметка — HTML (<b>, <i>, <a>). */

type BotDict = {
  welcome: (site: string) => string;
  btnFind: string;
  btnJoin: string;
  btnCabinet: string;
  askContact: (name: string, phone: string) => string;
  btnShareContact: string;
  verified: string;
  verifiedPending: string;
  verifiedPublished: string;
  alreadyVerified: string;
  mismatch: (tg: string, form: string) => string;
  notOwnContact: string;
  noPendingProfile: string;
  joinAsk: string;
  joinReady: string;
  btnJoinContinue: string;
  joinSubmitted: string;
  linkInvalid: string;
  approved: (url: string) => string;
  approvedAllDone: string;
  stepsIntro: string;
  rejected: string;
  hidden: string;
  cabinetLink: string;
  notSpecialist: string;
  help: string;
  forwarded: string;
  newRequest: (cat: string, desc: string, when: string) => string;
  directRequest: (desc: string, when: string) => string;
  btnTake: string;
  takenMaster: (name: string, phone: string, desc: string) => string;
  takenButtonDone: string;
  alreadyYours: string;
  requestFull: string;
  notAllowed: string;
  requestGone: string;
  clientLinked: string;
  clientResponse: (name: string, cat: string, phone: string, tg: string) => string;
  btnProfile: string;
  btnWhatsApp: string;
  btnClose: string;
  closedOk: string;
  noResponse: (desc: string) => string;
  btnCatalog: string;
  followupAsk: (desc: string) => string;
  btnDealWith: (name: string) => string;
  btnLater: string;
  btnNoHelp: string;
  dealOk: (name: string) => string;
  laterOk: string;
  noHelpOk: string;
  btnResend: string;
  resentOk: (n: number) => string;
  resentNone: string;
  reviewInvite: (name: string) => string;
  btnReview: string;
  reviewStart: (name: string) => string;
  ownReview: string;
  alreadyReviewed: string;
  reviewNotFound: string;
  reviewReceived: string;
  reviewPublishedClient: (name: string) => string;
  reviewPublishedMaster: (stars: string) => string;
  pauseAsk: string;
  btnWeek: string;
  btn2Weeks: string;
  btnMonth: string;
  btnNoEnd: string;
  paused: (until: string | null) => string;
  resumed: string;
  autoResumed: string;
  notSpecialistShort: string;
  inactiveWarn: string;
  btnStillHere: string;
  stillHereOk: string;
  archivedInactive: string;
  archivedMissed: string;
  btnUnarchive: string;
  unarchived: string;
  directMissedMaster: string;
  directMissedClient: (name: string) => string;
  commands: { cabinet: string; help: string; pause: string; resume: string };
  steps: Record<"verified" | "photo" | "about" | "services" | "price" | "languages" | "credentials" | "portfolio" | "where" | "documents", string>;
  docVerified: (title: string) => string;
  docRejected: (title: string) => string;
};

const ru: BotDict = {
  welcome: (site) => `👋 Здравствуйте! Это бот сервиса <b>${site}</b> — специалисты в Батуми.\n\nЗдесь специалисты подтверждают номер и получают заявки, а клиенты — отклики на свои заявки.`,
  btnFind: "🔎 Найти специалиста",
  btnJoin: "🧑‍🔧 Разместить профиль",
  btnCabinet: "👤 Мой кабинет",
  askContact: (name, phone) =>
    `Здравствуйте, ${name}! 👋\n\nЧтобы подтвердить номер <b>${phone}</b>, нажмите кнопку <b>«📱 Поделиться номером»</b> внизу экрана.\n\nТак клиенты увидят отметку «Номер подтверждён», а вы будете получать заявки.`,
  btnShareContact: "📱 Поделиться номером",
  verified: "✅ Номер подтверждён!",
  verifiedPending: "Мы проверим анкету и напишем сюда — обычно в течение дня.",
  verifiedPublished: "Теперь вам будут приходить заявки клиентов вашей категории.",
  alreadyVerified: "✅ Ваш номер уже подтверждён.",
  mismatch: (tg, form) =>
    `⚠️ Номер этого Telegram (<b>${tg}</b>) не совпадает с номером в анкете (<b>${form}</b>).\n\nОткройте ссылку из того Telegram, который зарегистрирован на ${form}, или напишите сюда, какой номер указать в анкете.`,
  notOwnContact: "Пожалуйста, отправьте свой номер кнопкой «📱 Поделиться номером», а не чужой контакт.",
  noPendingProfile: "Спасибо! Но к этому Telegram не привязана анкета, ожидающая подтверждения.",
  joinAsk: "📝 Заполним анкету быстрее: нажмите кнопку ниже и поделитесь номером. Мы подставим в анкету ваш номер, ник и фото из Telegram — номер сразу будет подтверждён.",
  joinReady: "Нажмите кнопку, чтобы продолжить анкету на сайте — телефон, ник и фото уже подставлены. Ссылка действует 24 часа.",
  btnJoinContinue: "📝 Продолжить анкету",
  joinSubmitted: "📝 Анкета получена! Мы проверим её и напишем сюда — обычно в течение дня.",
  docVerified: (title) => `✅ Документ «${title}» проверен — в профиле появилась отметка «Документы проверены».`,
  docRejected: (title) => `Документ «${title}» не принят. Возможно, его плохо видно или он не подходит. Если есть вопросы — напишите сюда.`,
  inactiveWarn: "👋 Вы давно не заходили в Nomerok. Вы ещё принимаете заказы? Нажмите кнопку — иначе через 7 дней профиль уйдёт в архив и клиенты перестанут его видеть. Если просто заняты — поставьте паузу: /pause",
  btnStillHere: "✅ Да, я на связи",
  stillHereOk: "Спасибо! Профиль остаётся на сайте.",
  archivedInactive: "📦 Ваш профиль перенесён в архив: больше месяца от вас не было активности. Клиенты его сейчас не видят. Вернуть можно в любой момент — кнопкой ниже.",
  archivedMissed: "📦 Ваш профиль перенесён в архив: несколько заявок, которые клиенты отправили лично вам, остались без ответа. Клиенты его сейчас не видят. Вернуть можно в любой момент — кнопкой ниже.",
  btnUnarchive: "↩️ Вернуть профиль",
  unarchived: "✅ Профиль снова на сайте. Чтобы он не уходил в архив, отвечайте на заявки, а когда заняты — ставьте паузу: /pause",
  directMissedMaster: "⏰ Заявка, которую клиент отправил лично вам, сутки осталась без ответа — мы передали её другим специалистам. Если сейчас заняты — поставьте паузу: /pause",
  directMissedClient: (name) => `Специалист ${name} пока не ответил — мы отправили вашу заявку другим специалистам этого направления.`,
  pauseAsk: "На сколько поставить паузу? Пока пауза — новые заявки не приходят, а профиль скрыт из каталога.",
  btnWeek: "1 неделя",
  btn2Weeks: "2 недели",
  btnMonth: "Месяц",
  btnNoEnd: "Без срока",
  resumed: "✅ Вы снова принимаете заявки!",
  autoResumed: "✅ Пауза закончилась — заявки снова приходят. Если нужно ещё отдохнуть — /pause",
  notSpecialistShort: "Эта команда — для специалистов с анкетой на сайте.",
  paused: (until: string | null) => until ? `⏸ Пауза до ${until}. В этот день заявки включатся сами. Вернуться раньше — /resume` : "⏸ Пауза без срока. Когда будете готовы — /resume",
  btnClose: "❌ Заявка больше не нужна",
  closedOk: "Заявка закрыта — специалисты больше её не получат. Понадобится снова — оставьте новую на сайте.",
  noResponse: (desc) => `Пока никто не взял вашу заявку «${desc}». Мы передали её администратору — постараемся найти специалиста. Можно также выбрать самому в каталоге.`,
  btnCatalog: "🔎 Открыть каталог",
  followupAsk: (desc) => `Удалось договориться со специалистом по заявке «${desc}»?`,
  btnDealWith: (name) => `✅ Да, с ${name}`,
  btnLater: "⏳ Ещё решаем",
  btnNoHelp: "❌ Никто не помог",
  dealOk: (name) => `Отлично! Через пару дней спросим, как прошла работа с ${name} — ваш отзыв поможет другим клиентам.`,
  laterOk: "Хорошо, удачи! Если что-то пойдёт не так — напишите сюда.",
  noHelpOk: "Жаль, что не получилось. Можем разослать заявку ещё раз другим специалистам — или выберите сами в каталоге.",
  btnResend: "🔁 Разослать ещё раз",
  resentOk: (n) => `Отправили заявку ещё ${n} специалистам. Как только кто-то откликнется — пришлём контакты сюда.`,
  resentNone: "Других специалистов этого направления пока нет. Мы передали заявку администратору — постараемся найти специалиста вручную.",
  reviewInvite: (name) => `Как прошла работа с <b>${name}</b>? Оставьте короткий отзыв — можно с фото. Отзывы помогают другим клиентам выбрать специалиста.`,
  btnReview: "⭐ Оставить отзыв",
  reviewStart: (name) => `Оставьте отзыв о специалисте <b>${name}</b>. Отзыв появится на сайте после проверки. Ссылка действует 7 дней.`,
  ownReview: "Нельзя оставить отзыв о своём профиле 🙂",
  alreadyReviewed: "Вы уже оставили отзыв об этом специалисте. Спасибо!",
  reviewNotFound: "Специалист не найден — возможно, профиль скрыт.",
  reviewReceived: "Спасибо за отзыв! Он появится на сайте после проверки — обычно в течение дня.",
  reviewPublishedClient: (name) => `Ваш отзыв о ${name} опубликован. Спасибо!`,
  reviewPublishedMaster: (stars) => `⭐ У вас новый отзыв: ${stars}. Посмотреть и ответить можно в кабинете.`,
  linkInvalid: "Эта ссылка устарела или неверна. Откройте её заново с сайта.",
  approved: (url) => `🎉 <b>Ваш профиль опубликован!</b>\n${url}\n\nТеперь клиенты видят вас в каталоге.`,
  approvedAllDone: "Профиль заполнен полностью — отлично! 👍",
  stepsIntro: "Чтобы клиенты чаще выбирали вас, заполните в кабинете:",
  rejected: "К сожалению, мы не можем опубликовать анкету в таком виде. Напишите сюда, если есть вопросы, — подскажем, что поправить.",
  hidden: "Ваш профиль временно скрыт с сайта. Напишите сюда, если есть вопросы.",
  cabinetLink: "👤 Ваш кабинет — здесь можно менять фото, услуги и цены.\nСсылка действует 24 часа.",
  notSpecialist: "Этот Telegram не привязан к анкете специалиста. Заполните анкету на сайте, и после отправки нажмите «Подтвердить номер в Telegram».",
  help: "Команды:\n/cabinet — ссылка на ваш кабинет\n/pause — пауза (отпуск, не принимаю заявки)\n/resume — снова принимаю заявки\n/help — помощь\n\nЛюбое другое сообщение мы передадим команде.",
  forwarded: "Спасибо! Передали сообщение команде, ответим в ближайшее время.",
  newRequest: (cat, desc, when) => `🆕 <b>Новая заявка: ${cat}</b>\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nНажмите «Беру», чтобы получить телефон клиента.`,
  directRequest: (desc, when) => `✉️ <b>Клиент написал лично вам</b> (со страницы вашего профиля)\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nНажмите «Беру заказ», чтобы получить телефон клиента. Если не ответить в течение суток, задача уйдёт другим специалистам.`,
  btnTake: "✋ Беру заказ",
  takenMaster: (name, phone, desc) =>
    `✅ <b>Заявка ваша.</b> Свяжитесь с клиентом в течение часа:\n\n👤 ${name}\n📞 <b>${phone}</b>\n\n<i>${desc}</i>\n\nМы сообщили клиенту, что вы откликнулись.`,
  takenButtonDone: "✅ Вы откликнулись",
  alreadyYours: "Вы уже откликнулись — контакты клиента выше.",
  requestFull: "На эту заявку уже откликнулись другие специалисты.",
  notAllowed: "Откликаться могут только специалисты с опубликованным профилем и подтверждённым номером.",
  requestGone: "Заявка больше не актуальна.",
  clientLinked: "✅ Готово! Как только специалист откликнется на вашу заявку, мы пришлём сюда его контакты. А через день спросим, удалось ли договориться.",
  clientResponse: (name, cat, phone, tg) =>
    `🙋 <b>На вашу заявку откликнулся специалист</b>\n\n${name} — ${cat}\n📞 ${phone}${tg ? `\n✈️ ${tg}` : ""}\n\nСпециалист свяжется с вами. Если удобнее — позвоните сами.`,
  btnProfile: "Профиль специалиста",
  btnWhatsApp: "WhatsApp",
  commands: { cabinet: "Мой кабинет специалиста", help: "Помощь", pause: "Пауза: отпуск, не принимаю заявки", resume: "Снова принимаю заявки" },
  steps: {
    documents: "загрузите диплом или сертификат в кабинете",
    portfolio: "добавьте фото работ (хотя бы 3)",
    where: "укажите, где работаете (выезд или адрес на карте)",
    verified: "подтвердите номер (кнопка «📱 Поделиться номером»)",
    photo: "добавьте фото",
    about: "расскажите о себе",
    services: "перечислите услуги с ценами",
    price: "укажите цену «от»",
    languages: "отметьте языки",
    credentials: "укажите образование и документы",
  },
};

const en: BotDict = {
  welcome: (site) => `👋 Hello! This is the <b>${site}</b> bot — specialists in Batumi.\n\nSpecialists confirm their number and receive requests here; clients receive responses to their requests.`,
  btnFind: "🔎 Find a specialist",
  btnJoin: "🧑‍🔧 List your profile",
  btnCabinet: "👤 My dashboard",
  askContact: (name, phone) =>
    `Hello, ${name}! 👋\n\nTo confirm the number <b>${phone}</b>, tap <b>“📱 Share my number”</b> at the bottom of the screen.\n\nClients will see a “Number verified” badge and you'll receive requests.`,
  btnShareContact: "📱 Share my number",
  verified: "✅ Number verified!",
  verifiedPending: "We'll review your profile and message you here, usually within a day.",
  verifiedPublished: "You'll now receive client requests in your category.",
  alreadyVerified: "✅ Your number is already verified.",
  mismatch: (tg, form) =>
    `⚠️ This Telegram's number (<b>${tg}</b>) doesn't match the number in your profile (<b>${form}</b>).\n\nOpen the link from the Telegram account registered to ${form}, or write here which number to use.`,
  notOwnContact: "Please send your own number with the “📱 Share my number” button, not someone else's contact.",
  noPendingProfile: "Thanks! But no profile awaiting verification is linked to this Telegram.",
  joinAsk: "📝 Let's fill in your profile faster: tap the button below and share your number. We'll add your number, username and photo from Telegram — your number will be verified right away.",
  joinReady: "Tap the button to continue your profile on the website — phone, username and photo are already filled in. The link is valid for 24 hours.",
  btnJoinContinue: "📝 Continue profile",
  joinSubmitted: "📝 Profile received! We'll review it and message you here, usually within a day.",
  docVerified: (title) => `✅ Your document “${title}” is verified — your profile now shows “Documents verified”.`,
  docRejected: (title) => `Your document “${title}” wasn't accepted. It may be unreadable or unsuitable. Any questions — write here.`,
  inactiveWarn: "👋 You haven't been active on Nomerok for a while. Are you still taking orders? Tap the button — otherwise in 7 days your profile will be archived and clients won't see it. Just busy? Pause instead: /pause",
  btnStillHere: "✅ Yes, I'm here",
  stillHereOk: "Thanks! Your profile stays on the site.",
  archivedInactive: "📦 Your profile has been archived: there has been no activity for over a month. Clients can't see it right now. You can bring it back anytime with the button below.",
  archivedMissed: "📦 Your profile has been archived: several requests that clients sent to you personally went unanswered. Clients can't see it right now. You can bring it back anytime with the button below.",
  btnUnarchive: "↩️ Restore profile",
  unarchived: "✅ Your profile is back on the site. To keep it from being archived, reply to requests — and when you're busy, pause: /pause",
  directMissedMaster: "⏰ A request a client sent to you personally went unanswered for a day — we passed it on to other specialists. If you're busy right now, pause: /pause",
  directMissedClient: (name) => `${name} hasn't responded yet — we've sent your request to other specialists in this field.`,
  pauseAsk: "How long should the pause be? While paused, you won't receive new requests, and your profile is hidden from the catalog.",
  btnWeek: "1 week",
  btn2Weeks: "2 weeks",
  btnMonth: "1 month",
  btnNoEnd: "No end date",
  resumed: "✅ You're accepting requests again!",
  autoResumed: "✅ Your pause has ended — requests are coming in again. Need more time off? /pause",
  notSpecialistShort: "This command is for specialists with a profile on the site.",
  paused: (until) => until ? `⏸ Paused until ${until}. Requests will switch back on that day. To come back earlier — /resume` : "⏸ Paused with no end date. When you're ready — /resume",
  btnClose: "❌ I no longer need this",
  closedOk: "Request closed — specialists won't receive it anymore. Need help again? Leave a new request on the website.",
  noResponse: (desc) => `No one has taken your request “${desc}” yet. We've passed it to our team and will try to find a specialist. You can also pick one yourself in the catalog.`,
  btnCatalog: "🔎 Open the catalog",
  followupAsk: (desc) => `Did you come to an agreement with a specialist about “${desc}”?`,
  btnDealWith: (name) => `✅ Yes, with ${name}`,
  btnLater: "⏳ Still deciding",
  btnNoHelp: "❌ No one helped",
  dealOk: (name) => `Great! In a couple of days we'll ask how the work with ${name} went — your review will help other clients.`,
  laterOk: "OK, good luck! If anything goes wrong, write here.",
  noHelpOk: "Sorry it didn't work out. We can send your request to other specialists — or pick one yourself in the catalog.",
  btnResend: "🔁 Send it out again",
  resentOk: (n) => `We sent your request to ${n} more specialists. As soon as someone responds, we'll send their contacts here.`,
  resentNone: "There are no other specialists in this field yet. We've passed your request to our team and will try to find someone manually.",
  reviewInvite: (name) => `How did the work with <b>${name}</b> go? Leave a short review — photos welcome. Reviews help other clients choose.`,
  btnReview: "⭐ Leave a review",
  reviewStart: (name) => `Leave a review for <b>${name}</b>. It will appear on the website after moderation. The link is valid for 7 days.`,
  ownReview: "You can't review your own profile 🙂",
  alreadyReviewed: "You've already reviewed this specialist. Thank you!",
  reviewNotFound: "Specialist not found — the profile may be hidden.",
  reviewReceived: "Thanks for your review! It will appear on the website after moderation, usually within a day.",
  reviewPublishedClient: (name) => `Your review of ${name} is now published. Thank you!`,
  reviewPublishedMaster: (stars) => `⭐ You have a new review: ${stars}. You can read and reply in your dashboard.`,
  linkInvalid: "This link is outdated or invalid. Please open it again from the website.",
  approved: (url) => `🎉 <b>Your profile is live!</b>\n${url}\n\nClients can now see you in the catalogue.`,
  approvedAllDone: "Your profile is complete — great! 👍",
  stepsIntro: "To get chosen more often, complete in your dashboard:",
  rejected: "Unfortunately we can't publish the profile as it is. Write here if you have questions — we'll tell you what to fix.",
  hidden: "Your profile is temporarily hidden. Write here if you have questions.",
  cabinetLink: "👤 Your dashboard — change your photo, services and prices.\nThe link is valid for 24 hours.",
  notSpecialist: "This Telegram isn't linked to a specialist profile. Fill in the form on the website and then tap “Verify number in Telegram”.",
  help: "Commands:\n/cabinet — link to your dashboard\n/pause — pause (vacation, not taking requests)\n/resume — accept requests again\n/help — help\n\nAny other message will be passed to our team.",
  forwarded: "Thanks! We've passed your message to the team and will reply soon.",
  newRequest: (cat, desc, when) => `🆕 <b>New request: ${cat}</b>\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nTap “I'll take it” to get the client's phone.`,
  directRequest: (desc, when) => `✉️ <b>A client messaged you personally</b> (from your profile page)\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nTap “I'll take it” to get the client's phone. If there's no reply within a day, the job goes to other specialists.`,
  btnTake: "✋ I'll take it",
  takenMaster: (name, phone, desc) =>
    `✅ <b>The request is yours.</b> Contact the client within an hour:\n\n👤 ${name}\n📞 <b>${phone}</b>\n\n<i>${desc}</i>\n\nWe've told the client you responded.`,
  takenButtonDone: "✅ You responded",
  alreadyYours: "You've already responded — the client's contacts are above.",
  requestFull: "Other specialists have already responded to this request.",
  notAllowed: "Only specialists with a published profile and a verified number can respond.",
  requestGone: "This request is no longer active.",
  clientLinked: "✅ Done! As soon as a specialist responds to your request, we'll send their contacts here. A day later we'll ask whether you reached an agreement.",
  clientResponse: (name, cat, phone, tg) =>
    `🙋 <b>A specialist responded to your request</b>\n\n${name} — ${cat}\n📞 ${phone}${tg ? `\n✈️ ${tg}` : ""}\n\nThe specialist will contact you. Feel free to call them yourself.`,
  btnProfile: "Specialist's profile",
  btnWhatsApp: "WhatsApp",
  commands: { cabinet: "My specialist dashboard", help: "Help", pause: "Pause: vacation, not taking requests", resume: "Accept requests again" },
  steps: {
    documents: "upload a diploma or certificate in your dashboard",
    portfolio: "add photos of your work (at least 3)",
    where: "say where you work (visits or an address on the map)",
    verified: "verify your number (“📱 Share my number” button)",
    photo: "add a photo",
    about: "tell clients about yourself",
    services: "list your services with prices",
    price: "set a starting price",
    languages: "select your languages",
    credentials: "add education and credentials",
  },
};

const ka: BotDict = {
  welcome: (site) => `👋 გამარჯობა! ეს არის <b>${site}</b>-ის ბოტი — სპეციალისტები ბათუმში.\n\nაქ სპეციალისტები ადასტურებენ ნომერს და იღებენ განაცხადებს, კლიენტები კი — გამოხმაურებებს.`,
  btnFind: "🔎 სპეციალისტის პოვნა",
  btnJoin: "🧑‍🔧 პროფილის განთავსება",
  btnCabinet: "👤 ჩემი კაბინეტი",
  askContact: (name, phone) =>
    `გამარჯობა, ${name}! 👋\n\nნომრის <b>${phone}</b> დასადასტურებლად დააჭირეთ ღილაკს <b>„📱 ნომრის გაზიარება“</b> ეკრანის ქვედა ნაწილში.\n\nკლიენტები დაინახავენ ნიშანს „ნომერი დადასტურებულია“, თქვენ კი მიიღებთ განაცხადებს.`,
  btnShareContact: "📱 ნომრის გაზიარება",
  verified: "✅ ნომერი დადასტურებულია!",
  verifiedPending: "შევამოწმებთ ანკეტას და აქ მოგწერთ — ჩვეულებრივ ერთი დღის განმავლობაში.",
  verifiedPublished: "ახლა მიიღებთ თქვენი კატეგორიის კლიენტების განაცხადებს.",
  alreadyVerified: "✅ თქვენი ნომერი უკვე დადასტურებულია.",
  mismatch: (tg, form) =>
    `⚠️ ამ Telegram-ის ნომერი (<b>${tg}</b>) არ ემთხვევა ანკეტაში მითითებულ ნომერს (<b>${form}</b>).\n\nგახსენით ბმული იმ Telegram-იდან, რომელიც ${form}-ზეა რეგისტრირებული, ან მოგვწერეთ აქ, რომელი ნომერი მივუთითოთ.`,
  notOwnContact: "გთხოვთ, გამოგზავნოთ თქვენი ნომერი ღილაკით „📱 ნომრის გაზიარება“ და არა სხვისი კონტაქტი.",
  noPendingProfile: "გმადლობთ! მაგრამ ამ Telegram-ზე დასადასტურებელი ანკეტა არ არის მიბმული.",
  joinAsk: "📝 ანკეტას უფრო სწრაფად შევავსებთ: დააჭირეთ ქვემოთ ღილაკს და გაგვიზიარეთ ნომერი. ანკეტაში ჩავსვამთ თქვენს ნომერს, ნიკს და ფოტოს Telegram-იდან — ნომერი მაშინვე დადასტურდება.",
  joinReady: "დააჭირეთ ღილაკს, რომ საიტზე ანკეტა გააგრძელოთ — ტელეფონი, ნიკი და ფოტო უკვე ჩასმულია. ბმული მოქმედებს 24 საათი.",
  btnJoinContinue: "📝 ანკეტის გაგრძელება",
  joinSubmitted: "📝 ანკეტა მიღებულია! შევამოწმებთ და აქ მოგწერთ — ჩვეულებრივ დღის განმავლობაში.",
  docVerified: (title) => `✅ დოკუმენტი „${title}“ შემოწმებულია — პროფილში გამოჩნდა ნიშანი „დოკუმენტები შემოწმებულია“.`,
  docRejected: (title) => `დოკუმენტი „${title}“ არ მიიღეს. შესაძლოა ცუდად ჩანს ან არ შეესაბამება. კითხვების შემთხვევაში — მოგვწერეთ აქ.`,
  inactiveWarn: "👋 დიდი ხანია Nomerok-ზე არ შემოსულხართ. ისევ იღებთ შეკვეთებს? დააჭირეთ ღილაკს — წინააღმდეგ შემთხვევაში 7 დღეში პროფილი არქივში გადავა და კლიენტები მას ვეღარ დაინახავენ. თუ უბრალოდ დაკავებული ხართ — ჩართეთ პაუზა: /pause",
  btnStillHere: "✅ დიახ, კავშირზე ვარ",
  stillHereOk: "გმადლობთ! პროფილი საიტზე რჩება.",
  archivedInactive: "📦 თქვენი პროფილი არქივში გადავიდა: ერთ თვეზე მეტია აქტივობა არ ყოფილა. კლიენტები მას ახლა ვერ ხედავენ. დაბრუნება ნებისმიერ დროს შეგიძლიათ ქვემოთ ღილაკით.",
  archivedMissed: "📦 თქვენი პროფილი არქივში გადავიდა: რამდენიმე განაცხადი, რომელიც კლიენტებმა პირადად თქვენ გამოგიგზავნეს, უპასუხოდ დარჩა. კლიენტები მას ახლა ვერ ხედავენ. დაბრუნება ნებისმიერ დროს შეგიძლიათ ქვემოთ ღილაკით.",
  btnUnarchive: "↩️ პროფილის დაბრუნება",
  unarchived: "✅ პროფილი ისევ საიტზეა. რომ არქივში არ გადავიდეს, უპასუხეთ განაცხადებს, დაკავებულობისას კი ჩართეთ პაუზა: /pause",
  directMissedMaster: "⏰ განაცხადი, რომელიც კლიენტმა პირადად თქვენ გამოგიგზავნათ, დღე-ღამე უპასუხოდ დარჩა — სხვა სპეციალისტებს გადავეცით. თუ ახლა დაკავებული ხართ — ჩართეთ პაუზა: /pause",
  directMissedClient: (name) => `სპეციალისტს ${name} ჯერ არ უპასუხია — თქვენი განაცხადი ამ მიმართულების სხვა სპეციალისტებს გავუგზავნეთ.`,
  pauseAsk: "რამდენი ხნით ჩავრთოთ პაუზა? პაუზის დროს ახალი განაცხადები არ მოდის, პროფილი კი კატალოგიდან დამალულია.",
  btnWeek: "1 კვირა",
  btn2Weeks: "2 კვირა",
  btnMonth: "თვე",
  btnNoEnd: "ვადის გარეშე",
  resumed: "✅ ისევ იღებთ განაცხადებს!",
  autoResumed: "✅ პაუზა დასრულდა — განაცხადები ისევ მოდის. თუ კიდევ გჭირდებათ დასვენება — /pause",
  notSpecialistShort: "ეს ბრძანება საიტზე ანკეტის მქონე სპეციალისტებისთვისაა.",
  paused: (until) => until ? `⏸ პაუზა ${until}-მდე. ამ დღეს განაცხადები თავად ჩაირთვება. ადრე დასაბრუნებლად — /resume` : "⏸ პაუზა ვადის გარეშე. როცა მზად იქნებით — /resume",
  btnClose: "❌ განაცხადი აღარ მჭირდება",
  closedOk: "განაცხადი დაიხურა — სპეციალისტები მას აღარ მიიღებენ. თუ ისევ დაგჭირდებათ — დატოვეთ ახალი საიტზე.",
  noResponse: (desc) => `თქვენი განაცხადი „${desc}“ ჯერ არავის აუღია. გადავეცით ადმინისტრატორს — შევეცდებით სპეციალისტის პოვნას. შეგიძლიათ თავადაც აირჩიოთ კატალოგში.`,
  btnCatalog: "🔎 კატალოგის გახსნა",
  followupAsk: (desc) => `მოახერხეთ სპეციალისტთან შეთანხმება განაცხადზე „${desc}“?`,
  btnDealWith: (name) => `✅ დიახ, ${name}-თან`,
  btnLater: "⏳ ჯერ ვწყვეტთ",
  btnNoHelp: "❌ არავინ დამეხმარა",
  dealOk: (name) => `შესანიშნავია! ორიოდე დღეში გკითხავთ, როგორ ჩაიარა მუშაობამ ${name}-თან — თქვენი შეფასება სხვა კლიენტებს დაეხმარება.`,
  laterOk: "კარგი, წარმატებები! თუ რამე არასწორად წავა — მოგვწერეთ აქ.",
  noHelpOk: "სამწუხაროა, რომ ვერ გამოვიდა. შეგვიძლია განაცხადი სხვა სპეციალისტებსაც გავუგზავნოთ — ან თავად აირჩიეთ კატალოგში.",
  btnResend: "🔁 ხელახლა გაგზავნა",
  resentOk: (n) => `განაცხადი კიდევ ${n} სპეციალისტს გავუგზავნეთ. როგორც კი ვინმე გამოეხმაურება — კონტაქტებს აქ გამოგიგზავნით.`,
  resentNone: "ამ მიმართულების სხვა სპეციალისტები ჯერ არ არიან. განაცხადი ადმინისტრატორს გადავეცით — შევეცდებით სპეციალისტის ხელით პოვნას.",
  reviewInvite: (name) => `როგორ ჩაიარა მუშაობამ <b>${name}</b>-თან? დატოვეთ მოკლე შეფასება — შეიძლება ფოტოთი. შეფასებები სხვა კლიენტებს არჩევანში ეხმარება.`,
  btnReview: "⭐ შეფასების დატოვება",
  reviewStart: (name) => `დატოვეთ შეფასება სპეციალისტზე <b>${name}</b>. შემოწმების შემდეგ გამოჩნდება საიტზე. ბმული მოქმედებს 7 დღე.`,
  ownReview: "საკუთარ პროფილზე შეფასების დატოვება არ შეიძლება 🙂",
  alreadyReviewed: "ამ სპეციალისტზე შეფასება უკვე დატოვეთ. გმადლობთ!",
  reviewNotFound: "სპეციალისტი ვერ მოიძებნა — შესაძლოა პროფილი დამალულია.",
  reviewReceived: "გმადლობთ შეფასებისთვის! შემოწმების შემდეგ გამოჩნდება საიტზე — ჩვეულებრივ დღის განმავლობაში.",
  reviewPublishedClient: (name) => `თქვენი შეფასება ${name}-ზე გამოქვეყნდა. გმადლობთ!`,
  reviewPublishedMaster: (stars) => `⭐ ახალი შეფასება გაქვთ: ${stars}. ნახვა და პასუხი შეგიძლიათ კაბინეტში.`,
  linkInvalid: "ეს ბმული მოძველებულია ან არასწორია. გახსენით ხელახლა საიტიდან.",
  approved: (url) => `🎉 <b>თქვენი პროფილი გამოქვეყნდა!</b>\n${url}\n\nახლა კლიენტები გხედავენ კატალოგში.`,
  approvedAllDone: "პროფილი სრულად არის შევსებული — შესანიშნავია! 👍",
  stepsIntro: "რომ კლიენტებმა უფრო ხშირად აგირჩიონ, კაბინეტში შეავსეთ:",
  rejected: "სამწუხაროდ, ანკეტას ამ სახით ვერ გამოვაქვეყნებთ. მოგვწერეთ აქ, თუ კითხვები გაქვთ — გეტყვით, რა გავასწოროთ.",
  hidden: "თქვენი პროფილი დროებით დამალულია. მოგვწერეთ აქ, თუ კითხვები გაქვთ.",
  cabinetLink: "👤 თქვენი კაბინეტი — აქ შეგიძლიათ შეცვალოთ ფოტო, მომსახურება და ფასები.\nბმული მოქმედებს 24 საათი.",
  notSpecialist: "ეს Telegram არ არის მიბმული სპეციალისტის ანკეტაზე. შეავსეთ ანკეტა საიტზე და გაგზავნის შემდეგ დააჭირეთ „ნომრის დადასტურება Telegram-ში“.",
  help: "ბრძანებები:\n/cabinet — ბმული თქვენს კაბინეტზე\n/pause — პაუზა (შვებულება, არ ვიღებ განაცხადებს)\n/resume — ისევ ვიღებ განაცხადებს\n/help — დახმარება\n\nნებისმიერ სხვა შეტყობინებას გადავცემთ გუნდს.",
  forwarded: "გმადლობთ! შეტყობინება გადავეცით გუნდს, მალე გიპასუხებთ.",
  newRequest: (cat, desc, when) => `🆕 <b>ახალი განაცხადი: ${cat}</b>\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nდააჭირეთ „ვიღებ“, რომ მიიღოთ კლიენტის ტელეფონი.`,
  directRequest: (desc, when) => `✉️ <b>კლიენტმა პირადად თქვენ მოგწერათ</b> (თქვენი პროფილის გვერდიდან)\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nდააჭირეთ „ვიღებ შეკვეთას“, რომ მიიღოთ კლიენტის ტელეფონი. თუ დღე-ღამეში არ უპასუხებთ, ამოცანა სხვა სპეციალისტებს გადაეცემა.`,
  btnTake: "✋ ვიღებ შეკვეთას",
  takenMaster: (name, phone, desc) =>
    `✅ <b>განაცხადი თქვენია.</b> დაუკავშირდით კლიენტს ერთი საათის განმავლობაში:\n\n👤 ${name}\n📞 <b>${phone}</b>\n\n<i>${desc}</i>\n\nკლიენტს ვაცნობეთ, რომ გამოეხმაურეთ.`,
  takenButtonDone: "✅ თქვენ გამოეხმაურეთ",
  alreadyYours: "თქვენ უკვე გამოეხმაურეთ — კლიენტის კონტაქტები ზემოთაა.",
  requestFull: "ამ განაცხადს უკვე გამოეხმაურნენ სხვა სპეციალისტები.",
  notAllowed: "გამოხმაურება შეუძლიათ მხოლოდ სპეციალისტებს გამოქვეყნებული პროფილითა და დადასტურებული ნომრით.",
  requestGone: "განაცხადი აღარ არის აქტუალური.",
  clientLinked: "✅ მზადაა! როგორც კი სპეციალისტი გამოეხმაურება თქვენს განაცხადს, მის კონტაქტებს აქ გამოგიგზავნით. დღის შემდეგ გკითხავთ, მოახერხეთ თუ არა შეთანხმება.",
  clientResponse: (name, cat, phone, tg) =>
    `🙋 <b>თქვენს განაცხადს გამოეხმაურა სპეციალისტი</b>\n\n${name} — ${cat}\n📞 ${phone}${tg ? `\n✈️ ${tg}` : ""}\n\nსპეციალისტი დაგიკავშირდებათ. თუ გირჩევნიათ — თავად დაურეკეთ.`,
  btnProfile: "სპეციალისტის პროფილი",
  btnWhatsApp: "WhatsApp",
  commands: { cabinet: "სპეციალისტის კაბინეტი", help: "დახმარება", pause: "პაუზა: შვებულება, არ ვიღებ განაცხადებს", resume: "ისევ ვიღებ განაცხადებს" },
  steps: {
    documents: "ატვირთეთ დიპლომი ან სერტიფიკატი კაბინეტში",
    portfolio: "დაამატეთ სამუშაოების ფოტოები (მინიმუმ 3)",
    where: "მიუთითეთ, სად მუშაობთ (გამოძახება ან მისამართი რუკაზე)",
    verified: "დაადასტურეთ ნომერი (ღილაკი „📱 ნომრის გაზიარება“)",
    photo: "დაამატეთ ფოტო",
    about: "მოგვიყევით თქვენ შესახებ",
    services: "ჩამოთვალეთ მომსახურება ფასებით",
    price: "მიუთითეთ ფასი „-დან“",
    languages: "მონიშნეთ ენები",
    credentials: "მიუთითეთ განათლება და დოკუმენტები",
  },
};

const BOT: Record<Locale, BotDict> = { ru, en, ka };

export function botDict(lang: string | null | undefined): BotDict {
  return BOT[(lang as Locale) in BOT ? (lang as Locale) : "ru"];
}
