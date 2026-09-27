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
  commands: { cabinet: string; help: string };
  steps: Record<"verified" | "photo" | "about" | "services" | "price" | "languages" | "credentials", string>;
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
  linkInvalid: "Эта ссылка устарела или неверна. Откройте её заново с сайта.",
  approved: (url) => `🎉 <b>Ваш профиль опубликован!</b>\n${url}\n\nТеперь клиенты видят вас в каталоге.`,
  approvedAllDone: "Профиль заполнен полностью — отлично! 👍",
  stepsIntro: "Чтобы клиенты чаще выбирали вас, заполните в кабинете:",
  rejected: "К сожалению, мы не можем опубликовать анкету в таком виде. Напишите сюда, если есть вопросы, — подскажем, что поправить.",
  hidden: "Ваш профиль временно скрыт с сайта. Напишите сюда, если есть вопросы.",
  cabinetLink: "👤 Ваш кабинет — здесь можно менять фото, услуги и цены.\nСсылка действует 24 часа.",
  notSpecialist: "Этот Telegram не привязан к анкете специалиста. Заполните анкету на сайте, и после отправки нажмите «Подтвердить номер в Telegram».",
  help: "Команды:\n/cabinet — ссылка на ваш кабинет\n/help — помощь\n\nЛюбое другое сообщение мы передадим команде.",
  forwarded: "Спасибо! Передали сообщение команде, ответим в ближайшее время.",
  newRequest: (cat, desc, when) => `🆕 <b>Новая заявка: ${cat}</b>\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nНажмите «Беру», чтобы получить телефон клиента.`,
  directRequest: (desc, when) => `🆕 <b>Заявка лично вам</b> (со страницы вашего профиля)\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nНажмите «Беру», чтобы получить телефон клиента.`,
  btnTake: "✋ Беру заказ",
  takenMaster: (name, phone, desc) =>
    `✅ <b>Заявка ваша.</b> Свяжитесь с клиентом в течение часа:\n\n👤 ${name}\n📞 <b>${phone}</b>\n\n<i>${desc}</i>\n\nМы сообщили клиенту, что вы откликнулись.`,
  takenButtonDone: "✅ Вы откликнулись",
  alreadyYours: "Вы уже откликнулись — контакты клиента выше.",
  requestFull: "На эту заявку уже откликнулись другие специалисты.",
  notAllowed: "Откликаться могут только специалисты с опубликованным профилем и подтверждённым номером.",
  requestGone: "Заявка больше не актуальна.",
  clientLinked: "✅ Готово! Как только специалист откликнется на вашу заявку, мы пришлём сюда его контакты.",
  clientResponse: (name, cat, phone, tg) =>
    `🙋 <b>На вашу заявку откликнулся специалист</b>\n\n${name} — ${cat}\n📞 ${phone}${tg ? `\n✈️ ${tg}` : ""}\n\nСпециалист свяжется с вами. Если удобнее — позвоните сами.`,
  btnProfile: "Профиль специалиста",
  btnWhatsApp: "WhatsApp",
  commands: { cabinet: "Мой кабинет специалиста", help: "Помощь" },
  steps: {
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
  linkInvalid: "This link is outdated or invalid. Please open it again from the website.",
  approved: (url) => `🎉 <b>Your profile is live!</b>\n${url}\n\nClients can now see you in the catalogue.`,
  approvedAllDone: "Your profile is complete — great! 👍",
  stepsIntro: "To get chosen more often, complete in your dashboard:",
  rejected: "Unfortunately we can't publish the profile as it is. Write here if you have questions — we'll tell you what to fix.",
  hidden: "Your profile is temporarily hidden. Write here if you have questions.",
  cabinetLink: "👤 Your dashboard — change your photo, services and prices.\nThe link is valid for 24 hours.",
  notSpecialist: "This Telegram isn't linked to a specialist profile. Fill in the form on the website and then tap “Verify number in Telegram”.",
  help: "Commands:\n/cabinet — link to your dashboard\n/help — help\n\nAny other message will be passed to our team.",
  forwarded: "Thanks! We've passed your message to the team and will reply soon.",
  newRequest: (cat, desc, when) => `🆕 <b>New request: ${cat}</b>\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nTap “I'll take it” to get the client's phone.`,
  directRequest: (desc, when) => `🆕 <b>Request for you</b> (from your profile page)\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nTap “I'll take it” to get the client's phone.`,
  btnTake: "✋ I'll take it",
  takenMaster: (name, phone, desc) =>
    `✅ <b>The request is yours.</b> Contact the client within an hour:\n\n👤 ${name}\n📞 <b>${phone}</b>\n\n<i>${desc}</i>\n\nWe've told the client you responded.`,
  takenButtonDone: "✅ You responded",
  alreadyYours: "You've already responded — the client's contacts are above.",
  requestFull: "Other specialists have already responded to this request.",
  notAllowed: "Only specialists with a published profile and a verified number can respond.",
  requestGone: "This request is no longer active.",
  clientLinked: "✅ Done! As soon as a specialist responds to your request, we'll send their contacts here.",
  clientResponse: (name, cat, phone, tg) =>
    `🙋 <b>A specialist responded to your request</b>\n\n${name} — ${cat}\n📞 ${phone}${tg ? `\n✈️ ${tg}` : ""}\n\nThe specialist will contact you. Feel free to call them yourself.`,
  btnProfile: "Specialist's profile",
  btnWhatsApp: "WhatsApp",
  commands: { cabinet: "My specialist dashboard", help: "Help" },
  steps: {
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
  linkInvalid: "ეს ბმული მოძველებულია ან არასწორია. გახსენით ხელახლა საიტიდან.",
  approved: (url) => `🎉 <b>თქვენი პროფილი გამოქვეყნდა!</b>\n${url}\n\nახლა კლიენტები გხედავენ კატალოგში.`,
  approvedAllDone: "პროფილი სრულად არის შევსებული — შესანიშნავია! 👍",
  stepsIntro: "რომ კლიენტებმა უფრო ხშირად აგირჩიონ, კაბინეტში შეავსეთ:",
  rejected: "სამწუხაროდ, ანკეტას ამ სახით ვერ გამოვაქვეყნებთ. მოგვწერეთ აქ, თუ კითხვები გაქვთ — გეტყვით, რა გავასწოროთ.",
  hidden: "თქვენი პროფილი დროებით დამალულია. მოგვწერეთ აქ, თუ კითხვები გაქვთ.",
  cabinetLink: "👤 თქვენი კაბინეტი — აქ შეგიძლიათ შეცვალოთ ფოტო, მომსახურება და ფასები.\nბმული მოქმედებს 24 საათი.",
  notSpecialist: "ეს Telegram არ არის მიბმული სპეციალისტის ანკეტაზე. შეავსეთ ანკეტა საიტზე და გაგზავნის შემდეგ დააჭირეთ „ნომრის დადასტურება Telegram-ში“.",
  help: "ბრძანებები:\n/cabinet — ბმული თქვენს კაბინეტზე\n/help — დახმარება\n\nნებისმიერ სხვა შეტყობინებას გადავცემთ გუნდს.",
  forwarded: "გმადლობთ! შეტყობინება გადავეცით გუნდს, მალე გიპასუხებთ.",
  newRequest: (cat, desc, when) => `🆕 <b>ახალი განაცხადი: ${cat}</b>\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nდააჭირეთ „ვიღებ“, რომ მიიღოთ კლიენტის ტელეფონი.`,
  directRequest: (desc, when) => `🆕 <b>განაცხადი პირადად თქვენთვის</b> (თქვენი პროფილის გვერდიდან)\n\n${desc}${when ? `\n\n🕒 ${when}` : ""}\n\nდააჭირეთ „ვიღებ“, რომ მიიღოთ კლიენტის ტელეფონი.`,
  btnTake: "✋ ვიღებ შეკვეთას",
  takenMaster: (name, phone, desc) =>
    `✅ <b>განაცხადი თქვენია.</b> დაუკავშირდით კლიენტს ერთი საათის განმავლობაში:\n\n👤 ${name}\n📞 <b>${phone}</b>\n\n<i>${desc}</i>\n\nკლიენტს ვაცნობეთ, რომ გამოეხმაურეთ.`,
  takenButtonDone: "✅ თქვენ გამოეხმაურეთ",
  alreadyYours: "თქვენ უკვე გამოეხმაურეთ — კლიენტის კონტაქტები ზემოთაა.",
  requestFull: "ამ განაცხადს უკვე გამოეხმაურნენ სხვა სპეციალისტები.",
  notAllowed: "გამოხმაურება შეუძლიათ მხოლოდ სპეციალისტებს გამოქვეყნებული პროფილითა და დადასტურებული ნომრით.",
  requestGone: "განაცხადი აღარ არის აქტუალური.",
  clientLinked: "✅ მზადაა! როგორც კი სპეციალისტი გამოეხმაურება თქვენს განაცხადს, მის კონტაქტებს აქ გამოგიგზავნით.",
  clientResponse: (name, cat, phone, tg) =>
    `🙋 <b>თქვენს განაცხადს გამოეხმაურა სპეციალისტი</b>\n\n${name} — ${cat}\n📞 ${phone}${tg ? `\n✈️ ${tg}` : ""}\n\nსპეციალისტი დაგიკავშირდებათ. თუ გირჩევნიათ — თავად დაურეკეთ.`,
  btnProfile: "სპეციალისტის პროფილი",
  btnWhatsApp: "WhatsApp",
  commands: { cabinet: "სპეციალისტის კაბინეტი", help: "დახმარება" },
  steps: {
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
