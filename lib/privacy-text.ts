/* Раздел «Персональные данные» на странице правил (/rules#privacy). Нужен и для подключения входа через Google/Facebook. */
export const PRIVACY = {
  ru: {
    title: "Персональные данные",
    items: [
      "Специалист: храним то, что вы сами указали в анкете (имя, услуги, фото, телефон, ссылки). Контакты из анкеты видят посетители сайта — для этого анкета и создаётся.",
      "Клиент: храним заявку — описание задачи, имя и телефон. Телефон получают только специалисты, которые взялись за заявку.",
      "Вход через Telegram: номер чата, ник и номер телефона, если вы им поделились с ботом.",
      "Вход через Google или Facebook: имя, адрес почты и номер аккаунта в этом сервисе. Пароли, контакты, переписки и публикации мы не получаем и не запрашиваем.",
      "Вход по почте: адрес и одноразовый код. Код хранится только в зашифрованном виде (хеш) и сгорает через 15 минут.",
      "Зачем: чтобы вы могли войти, получать заявки и отклики, отзывы и важные уведомления. Данные не продаём и не передаём для рекламных рассылок.",
      "Где хранится: база данных Supabase, сайт работает на Vercel, письма отправляются через сервис Resend.",
      "Cookie: запоминают вход (до года) и считают посещения. На сайте показывается реклама Google, она может использовать свои cookie.",
      "Удаление: напишите нам через страницу «Написать нам» или боту — удалим аккаунт, анкету и заявки. Отключить вход через Google можно также в настройках своего аккаунта Google.",
    ],
  },
  en: {
    title: "Personal data",
    items: [
      "Specialists: we store what you enter in your profile (name, services, photo, phone, links). Profile contacts are visible to site visitors — that is the purpose of a profile.",
      "Clients: we store your request — the task, your name and phone. The phone is only shared with specialists who take the request.",
      "Telegram sign-in: chat ID, username and phone number if you shared it with the bot.",
      "Google or Facebook sign-in: name, email address and account ID in that service. We never receive or request passwords, contacts, messages or posts.",
      "Email sign-in: your address and a one-time code. The code is stored only as a hash and expires in 15 minutes.",
      "Why: so you can sign in and receive requests, replies, reviews and important notices. We don't sell data or share it for marketing emails.",
      "Where: Supabase database, the site runs on Vercel, emails are sent via Resend.",
      "Cookies: keep you signed in (up to a year) and count visits. The site shows Google ads, which may use their own cookies.",
      "Deletion: write to us via the Contact page or the bot and we'll delete your account, profile and requests. You can also remove Google sign-in in your Google account settings.",
    ],
  },
  ka: {
    title: "პერსონალური მონაცემები",
    items: [
      "სპეციალისტი: ვინახავთ იმას, რაც თავად მიუთითეთ ანკეტაში (სახელი, მომსახურება, ფოტო, ტელეფონი, ბმულები). ანკეტის კონტაქტებს საიტის ვიზიტორები ხედავენ — ანკეტა ამისთვის იქმნება.",
      "კლიენტი: ვინახავთ განაცხადს — ამოცანას, სახელს და ტელეფონს. ტელეფონს იღებენ მხოლოდ ის სპეციალისტები, ვინც განაცხადს აიღებს.",
      "შესვლა Telegram-ით: ჩატის ნომერი, ნიკი და ტელეფონი, თუ ბოტს გაუზიარეთ.",
      "შესვლა Google-ით ან Facebook-ით: სახელი, ელფოსტა და ანგარიშის ნომერი ამ სერვისში. პაროლებს, კონტაქტებს, მიმოწერას და პოსტებს არ ვიღებთ და არ ვითხოვთ.",
      "შესვლა ელფოსტით: მისამართი და ერთჯერადი კოდი. კოდი ინახება მხოლოდ ჰეშის სახით და 15 წუთში უქმდება.",
      "რისთვის: რომ შეძლოთ შესვლა, განაცხადების, პასუხების, შეფასებების და მნიშვნელოვანი შეტყობინებების მიღება. მონაცემებს არ ვყიდით და სარეკლამო დაგზავნისთვის არ გადავცემთ.",
      "სად ინახება: მონაცემთა ბაზა Supabase, საიტი მუშაობს Vercel-ზე, წერილები იგზავნება Resend-ით.",
      "Cookie: ინახავს შესვლას (წლამდე) და ითვლის ვიზიტებს. საიტზე ჩანს Google-ის რეკლამა, რომელმაც შეიძლება საკუთარი cookie გამოიყენოს.",
      "წაშლა: მოგვწერეთ «დაგვიკავშირდით» გვერდიდან ან ბოტს — წავშლით ანგარიშს, ანკეტას და განაცხადებს. Google-ით შესვლის გათიშვა ასევე შეგიძლიათ თქვენი Google ანგარიშის პარამეტრებში.",
    ],
  },
} as const;
