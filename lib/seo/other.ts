import type { SeoContent } from "../seo-categories";

export const SEO_OTHER: SeoContent = {
  art: {
    ru: {
      title: "Художники и хендмейд в Батуми — картины на заказ, роспись, подарки",
      description: "Художники и мастера хендмейда Батуми: картины на заказ, интерьерная живопись, портреты, роспись, изделия ручной работы. Смотрите работы и пишите напрямую.",
      h1: "Художники и хендмейд в Батуми",
      lead: "Картины на заказ, интерьерная живопись, роспись и изделия ручной работы. Смотрите работы в профилях и договаривайтесь с автором напрямую.",
      servicesTitle: "Что можно заказать",
      services: [
        "Картину на заказ по вашей идее или под интерьер",
        "Готовые работы: пейзажи, абстракция, концептуальное искусство",
        "Портрет по фото",
        "Роспись стен и предметов интерьера",
        "Изделия ручной работы и подарки",
        "Мастер-классы и творческие коллаборации",
      ],
      chooseTitle: "Как выбрать художника",
      choose: [
        "Смотрите работы в профиле и соцсетях автора — стиль и техника видны сразу.",
        "Обсудите размер, сроки, количество эскизов и правок до начала работы.",
        "Уточните, входит ли в цену рама, покрытие лаком и доставка.",
      ],
      priceQ: "Сколько стоит картина на заказ в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый автор указывает цены в профиле. Сейчас в каталоге — ${p}. Итог зависит от размера, техники и сложности.`
          : "Каждый автор указывает цены в профиле. Итог зависит от размера, техники и сложности работы.",
      faq: [{ q: "Берёт ли NomerOk комиссию?", a: "Нет. Вы договариваетесь с автором напрямую и платите только ему." }],
    },
    en: {
      title: "Artists & handmade in Batumi — commissioned paintings, murals, gifts",
      description: "Batumi artists and makers: commissioned paintings, interior art, portraits, murals and handmade items. See the work and contact the artist directly.",
      h1: "Artists & handmade in Batumi",
      lead: "Commissioned paintings, interior art, murals and handmade items. See the work in profiles and agree directly with the artist.",
      servicesTitle: "What you can order",
      services: ["A painting to order or to match your interior", "Ready works: landscapes, abstract, conceptual art", "A portrait from a photo", "Murals and painted decor", "Handmade items and gifts", "Workshops and creative collaborations"],
      chooseTitle: "How to choose",
      choose: ["Look at the works in the profile and on social media — style and technique are obvious.", "Agree on size, deadlines, sketches and revisions before starting.", "Check whether framing, varnish and delivery are included."],
      priceQ: "How much does a commissioned painting cost in Batumi?",
      priceA: (p) => (p ? `Each artist lists prices in their profile. In the catalog now — ${p}. The total depends on size, technique and complexity.` : "Each artist lists prices in their profile. The total depends on size, technique and complexity."),
      faq: [{ q: "Does NomerOk take a commission?", a: "No. You deal with the artist directly and pay only them." }],
    },
    ka: {
      title: "მხატვრები და ხელნაკეთი ბათუმში — ნახატები შეკვეთით, მოხატვა, საჩუქრები",
      description: "ბათუმის მხატვრები და ოსტატები: ნახატები შეკვეთით, ინტერიერის ნახატები, პორტრეტები, მოხატვა და ხელნაკეთი ნივთები. დაუკავშირდით ავტორს პირდაპირ.",
      h1: "მხატვრები და ხელნაკეთი ბათუმში",
      lead: "ნახატები შეკვეთით, ინტერიერის ნახატები, მოხატვა და ხელნაკეთი ნივთები. ნახეთ ნამუშევრები პროფილებში და შეუთანხმდით ავტორს პირდაპირ.",
      servicesTitle: "რისი შეკვეთა შეიძლება",
      services: ["ნახატი შეკვეთით", "მზა ნამუშევრები: პეიზაჟები, აბსტრაქცია, კონცეპტუალური ხელოვნება", "პორტრეტი ფოტოდან", "კედლების და ინტერიერის მოხატვა", "ხელნაკეთი ნივთები და საჩუქრები", "მასტერკლასები და თანამშრომლობა"],
      chooseTitle: "როგორ ავირჩიოთ მხატვარი",
      choose: ["ნახეთ ნამუშევრები პროფილში და სოციალურ ქსელებში.", "წინასწარ შეათანხმეთ ზომა, ვადები და ესკიზები.", "დააზუსტეთ, შედის თუ არა ფასში ჩარჩო და მიტანა."],
      priceQ: "რა ღირს ნახატი შეკვეთით ბათუმში?",
      priceA: (p) => (p ? `თითოეული ავტორი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}.` : "თითოეული ავტორი ფასებს პროფილში უთითებს. ფასი ზომაზე, ტექნიკაზე და სირთულეზეა დამოკიდებული."),
      faq: [{ q: "იღებს თუ არა NomerOk საკომისიოს?", a: "არა. ავტორს პირდაპირ უთანხმდებით და მხოლოდ მას უხდით." }],
    },
  },
  beauty: {
    ru: {
      title: "Мастера красоты в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Мастера маникюра, ресниц, бровей, парикмахеры и визажисты Батуми с подтверждёнными номерами: фото работ, цены и настоящие отзывы. Записывайтесь к мастеру напрямую.",
      h1: "Мастера красоты в Батуми",
      lead: "Номера мастеров красоты, подтверждённые через Telegram: фото работ, цены и настоящие отзывы. Записывайтесь напрямую — или оставьте заявку, и свободные мастера откликнутся сами.",
      servicesTitle: "Какие услуги предлагают мастера",
      services: [
        "Маникюр и покрытие гель-лаком",
        "Педикюр",
        "Наращивание и ламинирование ресниц",
        "Коррекция и окрашивание бровей",
        "Стрижка, окрашивание и укладка волос",
        "Макияж — дневной, вечерний, свадебный",
        "Косметология и уход за лицом",
      ],
      chooseTitle: "Как выбрать мастера красоты",
      choose: [
        "Смотрите фото работ в профиле — по ним видно стиль и аккуратность мастера.",
        "Обратите внимание на отметку «Номер подтверждён», а у косметологов посмотрите раздел «Документы» с дипломами и сертификатами.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Спросите, как мастер стерилизует инструменты, и уточните цену услуги до записи.",
        "Не хотите искать сами — оставьте заявку: её получат все мастера этого направления.",
      ],
      priceQ: "Сколько стоят услуги мастеров красоты в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый мастер указывает цены в своём профиле. Сейчас в каталоге — ${p}. Итоговая цена зависит от услуги и материалов — уточните её при записи.`
          : "Каждый мастер указывает цены в своём профиле. Итоговая цена зависит от услуги и материалов — уточните её при записи.",
      faq: [
        {
          q: "Есть мастера, которые принимают на дому или выезжают к клиенту?",
          a: "В профиле видно, где работает мастер: если он принимает клиентов, адрес показан на карте. Про выезд на дом спросите мастера напрямую.",
        },
        {
          q: "Мастера говорят по-русски?",
          a: "В профиле каждого мастера указаны языки общения. Выберите того, с кем вам удобно договориться.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Вы записываетесь к мастеру напрямую, сервис не берёт денег с клиентов и не делает наценку.",
        },
      ],
    },
    en: {
      title: "Beauty specialists in Batumi — prices, reviews, direct contacts",
      description:
        "Nail, lash and brow artists, hairdressers and makeup artists in Batumi with verified numbers: work photos, prices and real reviews. Book directly with the specialist.",
      h1: "Beauty specialists in Batumi",
      lead: "Beauty specialists' numbers verified via Telegram, with work photos, prices and real reviews. Book directly — or post a request and available specialists will get back to you.",
      servicesTitle: "What beauty specialists offer",
      services: [
        "Manicure and gel polish",
        "Pedicure",
        "Lash extensions and lash lift",
        "Brow shaping and tinting",
        "Haircuts, colouring and styling",
        "Makeup — day, evening, bridal",
        "Cosmetology and facial care",
      ],
      chooseTitle: "How to choose a beauty specialist",
      choose: [
        "Look at work photos in the profile — they show the specialist's style and precision.",
        "Check the “Number verified” badge, and for cosmetologists see the “Documents” section with diplomas and certificates.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Ask how tools are sterilised and confirm the price before booking.",
        "Don't want to search? Post a request — every specialist in this category gets it.",
      ],
      priceQ: "How much do beauty services cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each specialist lists prices in their profile. Right now the catalogue shows ${p}. The final price depends on the service and materials — confirm it when booking.`
          : "Each specialist lists prices in their profile. The final price depends on the service and materials — confirm it when booking.",
      faq: [
        {
          q: "Are there specialists who work from home or visit clients?",
          a: "The profile shows where the specialist works: if they receive clients, the address is on the map. Ask about home visits directly.",
        },
        {
          q: "Do beauty specialists speak English or Russian?",
          a: "Each profile lists the languages the specialist speaks. Choose someone you can easily talk to.",
        },
        { q: "Does NomerOk charge a fee?", a: "No. You book with the specialist directly; clients never pay the service." },
      ],
    },
    ka: {
      title: "სილამაზის ოსტატები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "მანიკურის, წამწამების, წარბების ოსტატები, პარიკმახერები და ვიზაჟისტები ბათუმში დადასტურებული ნომრებით: ნამუშევრების ფოტოები, ფასები და ნამდვილი შეფასებები.",
      h1: "სილამაზის ოსტატები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, ნამუშევრების ფოტოები, ფასები და ნამდვილი შეფასებები. ჩაეწერეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი ოსტატები თავად დაგიკავშირდებიან.",
      servicesTitle: "რა მომსახურებას გთავაზობენ ოსტატები",
      services: [
        "მანიკური და გელ-ლაქით დაფარვა",
        "პედიკური",
        "წამწამების დაგრძელება და ლამინირება",
        "წარბების კორექცია და შეღებვა",
        "თმის შეჭრა, შეღებვა და დავარცხნა",
        "მაკიაჟი — დღის, საღამოს, საქორწილო",
        "კოსმეტოლოგია და სახის მოვლა",
      ],
      chooseTitle: "როგორ ავირჩიოთ სილამაზის ოსტატი",
      choose: [
        "ნახეთ ნამუშევრების ფოტოები პროფილში — ჩანს ოსტატის სტილი და სიზუსტე.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“, კოსმეტოლოგებთან კი — განყოფილებას „დოკუმენტები“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "ჰკითხეთ, როგორ ასტერილებს ოსტატი ინსტრუმენტებს, და ფასი ჩაწერამდე დააზუსტეთ.",
        "არ გსურთ თავად ძებნა? დატოვეთ განაცხადი — მას ამ მიმართულების ყველა ოსტატი მიიღებს.",
      ],
      priceQ: "რა ღირს სილამაზის მომსახურება ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული ოსტატი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. საბოლოო ფასი მომსახურებასა და მასალებზეა დამოკიდებული — დააზუსტეთ ჩაწერისას.`
          : "თითოეული ოსტატი ფასებს პროფილში უთითებს. საბოლოო ფასი მომსახურებასა და მასალებზეა დამოკიდებული — დააზუსტეთ ჩაწერისას.",
      faq: [
        {
          q: "არიან ოსტატები, რომლებიც კლიენტთან მიდიან?",
          a: "პროფილში ჩანს, სად მუშაობს ოსტატი: თუ კლიენტებს იღებს, მისამართი რუკაზეა. ბინაზე მისვლის შესახებ ოსტატს პირდაპირ ჰკითხეთ.",
        },
        { q: "NomerOk იღებს საკომისიოს?", a: "არა. ოსტატთან პირდაპირ თანხმდებით, კლიენტები სერვისს არაფერს უხდიან." },
      ],
    },
  },

  fitness: {
    ru: {
      title: "Спорт и тренеры в Батуми — фитнес, йога, единоборства, плавание",
      description:
        "Тренеры Батуми — фитнес, йога, единоборства, плавание, танцы — с подтверждёнными номерами: фото, цены, сертификаты и настоящие отзывы. Пишите тренеру напрямую или оставьте заявку — свободные тренеры откликнутся.",
      h1: "Спорт и тренеры в Батуми",
      lead: "Фитнес, йога, единоборства, плавание и другие виды спорта — для взрослых и детей. Номера тренеров, подтверждённые через Telegram: фото, цены и настоящие отзывы. Пишите напрямую — или оставьте заявку, и свободные тренеры откликнутся сами.",
      servicesTitle: "С чем помогут тренеры",
      services: [
        "Персональные тренировки",
        "Снижение веса",
        "Набор мышечной массы",
        "Составление программы тренировок",
        "Тренировки дома или на улице",
        "Онлайн-тренировки",
        "Растяжка и функциональный тренинг",
        "Единоборства и самооборона",
        "Плавание, йога, танцы",
        "Секции и занятия для детей",
      ],
      chooseTitle: "Как выбрать фитнес-тренера",
      choose: [
        "Смотрите фото и описание в профиле — видно, с какими целями тренер работает.",
        "Обратите внимание на отметку «Номер подтверждён» и раздел «Документы» в профиле — документы загружает сам специалист.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Заранее договоритесь о цене, месте и расписании тренировок, спросите про пробное занятие.",
        "Не знаете, кого выбрать, — оставьте заявку: её получат все тренеры каталога.",
      ],
      priceQ: "Сколько стоит тренировка с фитнес-тренером в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый тренер указывает цены в своём профиле. Сейчас в каталоге — ${p}. Уточните у тренера, что входит в стоимость и есть ли абонементы.`
          : "Каждый тренер указывает цены в своём профиле. Уточните у тренера, что входит в стоимость и есть ли абонементы.",
      faq: [
        {
          q: "Где проходят тренировки?",
          a: "У каждого тренера по-разному: в зале, дома у клиента, на улице или онлайн. Спросите тренера напрямую, где ему удобно заниматься.",
        },
        {
          q: "Тренеры говорят по-русски?",
          a: "В профиле каждого тренера указаны языки общения. Выберите того, с кем вам удобно заниматься.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Вы договариваетесь с тренером напрямую, сервис не берёт денег с клиентов и не делает наценку.",
        },
      ],
    },
    en: {
      title: "Fitness trainers in Batumi — prices, reviews, direct contacts",
      description:
        "Fitness trainers in Batumi with verified numbers: photos, prices, certificates and real reviews. Message a trainer directly or post a request and available trainers will reply.",
      h1: "Fitness trainers in Batumi",
      lead: "Fitness trainers' numbers verified via Telegram, with photos, prices and real reviews. Message directly — or post a request and available trainers will get back to you.",
      servicesTitle: "What fitness trainers can help with",
      services: [
        "Personal training sessions",
        "Weight loss",
        "Building muscle",
        "Custom training programmes",
        "Training at home or outdoors",
        "Online training",
        "Stretching and functional training",
      ],
      chooseTitle: "How to choose a fitness trainer",
      choose: [
        "Look at photos and the description in the profile — you'll see what goals the trainer works with.",
        "Look for the “Number verified” badge and the “Documents” section — documents are uploaded by the specialist.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Agree on the price, place and schedule in advance, and ask about a trial session.",
        "Not sure who to pick? Post a request — every trainer in the catalogue gets it.",
      ],
      priceQ: "How much does a fitness trainer cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each trainer lists prices in their profile. Right now the catalogue shows ${p}. Ask the trainer what's included and whether packages are available.`
          : "Each trainer lists prices in their profile. Ask the trainer what's included and whether packages are available.",
      faq: [
        {
          q: "Where do sessions take place?",
          a: "It depends on the trainer: at a gym, at your home, outdoors or online. Ask the trainer directly.",
        },
        {
          q: "Do trainers speak English or Russian?",
          a: "Each profile lists the languages the trainer speaks. Choose someone you're comfortable training with.",
        },
        { q: "Does NomerOk charge a fee?", a: "No. You agree everything with the trainer directly; clients never pay the service." },
      ],
    },
    ka: {
      title: "ფიტნეს-ტრენერები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის ფიტნეს-ტრენერები დადასტურებული ნომრებით: ფოტოები, ფასები, სერტიფიკატები და ნამდვილი შეფასებები. მიწერეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "ფიტნეს-ტრენერები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, ფოტოები, ფასები და ნამდვილი შეფასებები. მიწერეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი ტრენერები თავად დაგიკავშირდებიან.",
      servicesTitle: "რაში დაგეხმარებათ ფიტნეს-ტრენერი",
      services: [
        "ინდივიდუალური ვარჯიში",
        "წონის კლება",
        "კუნთოვანი მასის მომატება",
        "სავარჯიშო პროგრამის შედგენა",
        "ვარჯიში სახლში ან გარეთ",
        "ონლაინ ვარჯიში",
        "გაჭიმვა და ფუნქციური ვარჯიში",
      ],
      chooseTitle: "როგორ ავირჩიოთ ფიტნეს-ტრენერი",
      choose: [
        "ნახეთ ფოტოები და აღწერა პროფილში — ჩანს, რა მიზნებზე მუშაობს ტრენერი.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“ და განყოფილებას „დოკუმენტები“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "ფასი, ადგილი და განრიგი წინასწარ შეათანხმეთ, ჰკითხეთ საცდელი ვარჯიშის შესახებ.",
        "არ იცით, ვინ აირჩიოთ? დატოვეთ განაცხადი — მას ყველა ტრენერი მიიღებს.",
      ],
      priceQ: "რა ღირს ვარჯიში ფიტნეს-ტრენერთან ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული ტრენერი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. ჰკითხეთ ტრენერს, რა შედის ფასში და არის თუ არა აბონემენტი.`
          : "თითოეული ტრენერი ფასებს პროფილში უთითებს. ჰკითხეთ ტრენერს, რა შედის ფასში და არის თუ არა აბონემენტი.",
      faq: [
        {
          q: "სად ტარდება ვარჯიში?",
          a: "ეს ტრენერზეა დამოკიდებული: დარბაზში, კლიენტის სახლში, გარეთ ან ონლაინ. ჰკითხეთ ტრენერს პირდაპირ.",
        },
        { q: "NomerOk იღებს საკომისიოს?", a: "არა. ტრენერთან პირდაპირ თანხმდებით, კლიენტები სერვისს არაფერს უხდიან." },
      ],
    },
  },

  lawyer: {
    ru: {
      title: "Юристы в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Юристы Батуми с подтверждёнными номерами: специализация, цены, языки и настоящие отзывы. Звоните юристу напрямую или оставьте заявку — свободные юристы откликнутся сами.",
      h1: "Юристы в Батуми",
      lead: "Номера юристов, подтверждённые через Telegram: специализация, цены, языки и настоящие отзывы. Звоните напрямую — или оставьте заявку, и свободные юристы откликнутся сами.",
      servicesTitle: "С чем помогут юристы",
      services: [
        "Консультации по правовым вопросам",
        "Регистрация компании или ИП",
        "Проверка и составление договоров",
        "Сопровождение сделок с недвижимостью",
        "Помощь с документами для ВНЖ",
        "Семейные и наследственные дела",
        "Представительство в суде",
      ],
      chooseTitle: "Как выбрать юриста",
      choose: [
        "Смотрите в профиле специализацию и опыт — выберите юриста, который занимается именно вашим вопросом.",
        "Обратите внимание на отметку «Номер подтверждён» и раздел «Документы» в профиле — документы загружает сам специалист.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Заранее договоритесь о стоимости, сроках и о том, что входит в работу.",
        "Не знаете, к кому обратиться, — оставьте заявку: её получат все юристы каталога.",
      ],
      priceQ: "Сколько стоит консультация юриста в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый юрист указывает цены в своём профиле. Сейчас в каталоге — ${p}. Стоимость зависит от сложности вопроса — уточните её до начала работы.`
          : "Каждый юрист указывает цены в своём профиле. Стоимость зависит от сложности вопроса — уточните её до начала работы.",
      faq: [
        {
          q: "Есть юристы, которые консультируют на русском или английском?",
          a: "Да, в профиле каждого юриста указаны языки общения. Выберите того, с кем вам удобно обсуждать ваш вопрос.",
        },
        {
          q: "Помогут ли зарегистрировать ИП в Грузии?",
          a: "Некоторые юристы предлагают такую услугу — это указано в профиле. Какие документы нужны и сколько это займёт, спросите у самого юриста.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Вы договариваетесь с юристом напрямую, сервис не берёт денег с клиентов и не делает наценку.",
        },
      ],
    },
    en: {
      title: "Lawyers in Batumi — prices, reviews, direct contacts",
      description:
        "Lawyers in Batumi with verified numbers: areas of practice, prices, languages and real reviews. Call a lawyer directly or post a request and available lawyers will reply.",
      h1: "Lawyers in Batumi",
      lead: "Lawyers' numbers verified via Telegram, with areas of practice, prices, languages and real reviews. Call directly — or post a request and available lawyers will get back to you.",
      servicesTitle: "What lawyers can help with",
      services: [
        "Legal consultations",
        "Registering a company or sole proprietorship",
        "Reviewing and drafting contracts",
        "Support with property transactions",
        "Help with residence permit documents",
        "Family and inheritance matters",
        "Representation in court",
      ],
      chooseTitle: "How to choose a lawyer",
      choose: [
        "Check the area of practice and experience in the profile — pick a lawyer who handles your kind of issue.",
        "Look for the “Number verified” badge and the “Documents” section — documents are uploaded by the specialist.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Agree on the fee, timeline and scope of work in advance.",
        "Not sure who to contact? Post a request — every lawyer in the catalogue gets it.",
      ],
      priceQ: "How much does a lawyer's consultation cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each lawyer lists prices in their profile. Right now the catalogue shows ${p}. The cost depends on how complex your case is — confirm it before work starts.`
          : "Each lawyer lists prices in their profile. The cost depends on how complex your case is — confirm it before work starts.",
      faq: [
        {
          q: "Are there lawyers who consult in English or Russian?",
          a: "Yes, each profile lists the languages the lawyer speaks. Choose someone you can comfortably discuss your case with.",
        },
        {
          q: "Can a lawyer help me register as a sole proprietor in Georgia?",
          a: "Some lawyers offer this service — it's shown in their profile. Ask the lawyer which documents are needed and how long it takes.",
        },
        { q: "Does NomerOk charge a fee?", a: "No. You agree everything with the lawyer directly; clients never pay the service." },
      ],
    },
    ka: {
      title: "იურისტები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის იურისტები დადასტურებული ნომრებით: სპეციალიზაცია, ფასები, ენები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "იურისტები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, სპეციალიზაცია, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი იურისტები თავად დაგიკავშირდებიან.",
      servicesTitle: "რაში დაგეხმარებათ იურისტი",
      services: [
        "იურიდიული კონსულტაცია",
        "კომპანიის ან ინდივიდუალური მეწარმის რეგისტრაცია",
        "ხელშეკრულებების შემოწმება და შედგენა",
        "უძრავი ქონების გარიგებების თანხლება",
        "ბინადრობის ნებართვის დოკუმენტებში დახმარება",
        "საოჯახო და სამემკვიდრეო საქმეები",
        "სასამართლოში წარმომადგენლობა",
      ],
      chooseTitle: "როგორ ავირჩიოთ იურისტი",
      choose: [
        "ნახეთ სპეციალიზაცია და გამოცდილება პროფილში — აირჩიეთ იურისტი, რომელიც თქვენს საკითხზე მუშაობს.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“ და განყოფილებას „დოკუმენტები“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "ფასი, ვადები და სამუშაოს მოცულობა წინასწარ შეათანხმეთ.",
        "არ იცით, ვის მიმართოთ? დატოვეთ განაცხადი — მას ყველა იურისტი მიიღებს.",
      ],
      priceQ: "რა ღირს იურისტის კონსულტაცია ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული იურისტი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. ფასი საკითხის სირთულეზეა დამოკიდებული — დააზუსტეთ მუშაობის დაწყებამდე.`
          : "თითოეული იურისტი ფასებს პროფილში უთითებს. ფასი საკითხის სირთულეზეა დამოკიდებული — დააზუსტეთ მუშაობის დაწყებამდე.",
      faq: [
        {
          q: "არიან იურისტები, რომლებიც რუსულად ან ინგლისურად კონსულტირებენ?",
          a: "დიახ, თითოეული იურისტის პროფილში მითითებულია ენები. აირჩიეთ ის, ვისთანაც თქვენთვის მოსახერხებელია.",
        },
        { q: "NomerOk იღებს საკომისიოს?", a: "არა. იურისტთან პირდაპირ თანხმდებით, კლიენტები სერვისს არაფერს უხდიან." },
      ],
    },
  },

  accountant: {
    ru: {
      title: "Бухгалтеры в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Бухгалтеры Батуми с подтверждёнными номерами: услуги, цены, языки и настоящие отзывы. Пишите бухгалтеру напрямую или оставьте заявку — свободные бухгалтеры откликнутся.",
      h1: "Бухгалтеры в Батуми",
      lead: "Номера бухгалтеров, подтверждённые через Telegram: услуги, цены, языки и настоящие отзывы. Пишите напрямую — или оставьте заявку, и свободные бухгалтеры откликнутся сами.",
      servicesTitle: "С чем помогут бухгалтеры",
      services: [
        "Ведение бухгалтерии ИП и компаний",
        "Подготовка и подача деклараций",
        "Консультации по учёту",
        "Помощь с регистрацией ИП",
        "Работа с онлайн-кабинетом налоговой",
        "Расчёт зарплаты и отчётность",
        "Восстановление учёта",
      ],
      chooseTitle: "Как выбрать бухгалтера",
      choose: [
        "Смотрите в профиле, с кем работает бухгалтер: с ИП, компаниями или физическими лицами.",
        "Обратите внимание на отметку «Номер подтверждён» и раздел «Документы» в профиле — документы загружает сам специалист.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Заранее договоритесь о цене, сроках и о том, какие задачи бухгалтер берёт на себя.",
        "Нужна помощь срочно — оставьте заявку: её получат все бухгалтеры каталога.",
      ],
      priceQ: "Сколько стоят услуги бухгалтера в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый бухгалтер указывает цены в своём профиле. Сейчас в каталоге — ${p}. Стоимость зависит от объёма работы — уточните её заранее.`
          : "Каждый бухгалтер указывает цены в своём профиле. Стоимость зависит от объёма работы — уточните её заранее.",
      faq: [
        {
          q: "Есть бухгалтеры, которые консультируют на русском или английском?",
          a: "Да, в профиле каждого бухгалтера указаны языки общения. Выберите того, с кем вам удобно работать.",
        },
        {
          q: "Помогут ли зарегистрировать ИП и сдавать декларации?",
          a: "Многие бухгалтеры предлагают такие услуги — это указано в профиле. Какие документы нужны и какие сроки, спросите у самого бухгалтера.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Вы договариваетесь с бухгалтером напрямую, сервис не берёт денег с клиентов и не делает наценку.",
        },
      ],
    },
    en: {
      title: "Accountants in Batumi — prices, reviews, direct contacts",
      description:
        "Accountants in Batumi with verified numbers: services, prices, languages and real reviews. Message an accountant directly or post a request and available accountants will reply.",
      h1: "Accountants in Batumi",
      lead: "Accountants' numbers verified via Telegram, with services, prices, languages and real reviews. Message directly — or post a request and available accountants will get back to you.",
      servicesTitle: "What accountants can help with",
      services: [
        "Bookkeeping for sole proprietors and companies",
        "Preparing and filing tax returns",
        "Accounting consultations",
        "Help registering as a sole proprietor",
        "Working with the tax service's online portal",
        "Payroll and reporting",
        "Restoring neglected records",
      ],
      chooseTitle: "How to choose an accountant",
      choose: [
        "Check in the profile who the accountant works with: sole proprietors, companies or individuals.",
        "Look for the “Number verified” badge and the “Documents” section — documents are uploaded by the specialist.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Agree on the fee, deadlines and exactly which tasks the accountant takes on.",
        "Need help fast? Post a request — every accountant in the catalogue gets it.",
      ],
      priceQ: "How much does an accountant cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each accountant lists prices in their profile. Right now the catalogue shows ${p}. The cost depends on the workload — confirm it in advance.`
          : "Each accountant lists prices in their profile. The cost depends on the workload — confirm it in advance.",
      faq: [
        {
          q: "Are there accountants who consult in English or Russian?",
          a: "Yes, each profile lists the languages the accountant speaks. Choose someone you're comfortable working with.",
        },
        {
          q: "Can an accountant help me register as a sole proprietor and file returns?",
          a: "Many accountants offer this — it's shown in their profile. Ask the accountant which documents are needed and what the deadlines are.",
        },
        { q: "Does NomerOk charge a fee?", a: "No. You agree everything with the accountant directly; clients never pay the service." },
      ],
    },
    ka: {
      title: "ბუღალტრები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის ბუღალტრები დადასტურებული ნომრებით: მომსახურება, ფასები, ენები და ნამდვილი შეფასებები. მიწერეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "ბუღალტრები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, მომსახურება, ფასები და ნამდვილი შეფასებები. მიწერეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი ბუღალტრები თავად დაგიკავშირდებიან.",
      servicesTitle: "რაში დაგეხმარებათ ბუღალტერი",
      services: [
        "ინდივიდუალური მეწარმეებისა და კომპანიების ბუღალტერია",
        "დეკლარაციების მომზადება და წარდგენა",
        "საბუღალტრო კონსულტაცია",
        "ინდივიდუალური მეწარმის რეგისტრაციაში დახმარება",
        "შემოსავლების სამსახურის ონლაინ კაბინეტთან მუშაობა",
        "ხელფასების დათვლა და ანგარიშგება",
        "აღრიცხვის აღდგენა",
      ],
      chooseTitle: "როგორ ავირჩიოთ ბუღალტერი",
      choose: [
        "ნახეთ პროფილში, ვისთან მუშაობს ბუღალტერი: მეწარმეებთან, კომპანიებთან თუ ფიზიკურ პირებთან.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“ და განყოფილებას „დოკუმენტები“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "ფასი, ვადები და სამუშაოს მოცულობა წინასწარ შეათანხმეთ.",
        "სასწრაფოდ გჭირდებათ დახმარება? დატოვეთ განაცხადი — მას ყველა ბუღალტერი მიიღებს.",
      ],
      priceQ: "რა ღირს ბუღალტრის მომსახურება ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული ბუღალტერი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. ფასი სამუშაოს მოცულობაზეა დამოკიდებული — დააზუსტეთ წინასწარ.`
          : "თითოეული ბუღალტერი ფასებს პროფილში უთითებს. ფასი სამუშაოს მოცულობაზეა დამოკიდებული — დააზუსტეთ წინასწარ.",
      faq: [
        {
          q: "არიან ბუღალტრები, რომლებიც რუსულად ან ინგლისურად კონსულტირებენ?",
          a: "დიახ, თითოეული ბუღალტრის პროფილში მითითებულია ენები. აირჩიეთ ის, ვისთანაც თქვენთვის მოსახერხებელია.",
        },
        { q: "NomerOk იღებს საკომისიოს?", a: "არა. ბუღალტერთან პირდაპირ თანხმდებით, კლიენტები სერვისს არაფერს უხდიან." },
      ],
    },
  },

  translator: {
    ru: {
      title: "Переводчики в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Переводчики Батуми с подтверждёнными номерами: языки, цены и настоящие отзывы. Письменные и устные переводы — пишите переводчику напрямую или оставьте заявку.",
      h1: "Переводчики в Батуми",
      lead: "Номера переводчиков, подтверждённые через Telegram: языки, цены и настоящие отзывы. Пишите напрямую — или оставьте заявку, и свободные переводчики откликнутся сами.",
      servicesTitle: "С чем помогут переводчики",
      services: [
        "Письменный перевод документов",
        "Перевод с нотариальным заверением",
        "Устный перевод на встречах и сделках",
        "Сопровождение у нотариуса и в госучреждениях",
        "Перевод договоров и справок",
        "Перевод сайтов и текстов",
      ],
      chooseTitle: "Как выбрать переводчика",
      choose: [
        "Смотрите в профиле, с какими языками и типами текстов работает переводчик.",
        "Обратите внимание на отметку «Номер подтверждён» и раздел «Документы» в профиле — документы загружает сам специалист.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Заранее договоритесь о цене, сроках и формате — нужен ли перевод с заверением.",
        "Нужен перевод срочно — оставьте заявку: её получат все переводчики каталога.",
      ],
      priceQ: "Сколько стоит перевод в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый переводчик указывает цены в своём профиле. Сейчас в каталоге — ${p}. Стоимость зависит от языка, объёма и срочности — уточните её заранее.`
          : "Каждый переводчик указывает цены в своём профиле. Стоимость зависит от языка, объёма и срочности — уточните её заранее.",
      faq: [
        {
          q: "Можно сделать нотариально заверенный перевод?",
          a: "Некоторые переводчики предлагают такую услугу. Как проходит заверение и какие документы нужны, уточните у самого переводчика.",
        },
        {
          q: "Нужен переводчик на встречу у нотариуса — это возможно?",
          a: "Да, многие переводчики сопровождают клиентов на встречах. Договоритесь о дате, времени и цене заранее.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Вы договариваетесь с переводчиком напрямую, сервис не берёт денег с клиентов и не делает наценку.",
        },
      ],
    },
    en: {
      title: "Translators in Batumi — prices, reviews, direct contacts",
      description:
        "Translators and interpreters in Batumi with verified numbers: languages, prices and real reviews. Message a translator directly or post a request and available ones will reply.",
      h1: "Translators in Batumi",
      lead: "Translators' numbers verified via Telegram, with languages, prices and real reviews. Message directly — or post a request and available translators will get back to you.",
      servicesTitle: "What translators can help with",
      services: [
        "Written translation of documents",
        "Notarised translations",
        "Interpreting at meetings and deals",
        "Accompanying you to a notary or public offices",
        "Translating contracts and certificates",
        "Translating websites and texts",
      ],
      chooseTitle: "How to choose a translator",
      choose: [
        "Check in the profile which languages and types of text the translator works with.",
        "Look for the “Number verified” badge and the “Documents” section — documents are uploaded by the specialist.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Agree on the price, deadline and format in advance — including whether you need certification.",
        "Need it urgently? Post a request — every translator in the catalogue gets it.",
      ],
      priceQ: "How much does translation cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each translator lists prices in their profile. Right now the catalogue shows ${p}. The cost depends on the language, volume and urgency — confirm it in advance.`
          : "Each translator lists prices in their profile. The cost depends on the language, volume and urgency — confirm it in advance.",
      faq: [
        {
          q: "Can I get a notarised translation?",
          a: "Some translators offer this. Ask the translator how certification works and which documents are needed.",
        },
        {
          q: "I need an interpreter at a notary — is that possible?",
          a: "Yes, many translators accompany clients to meetings. Agree on the date, time and price in advance.",
        },
        { q: "Does NomerOk charge a fee?", a: "No. You agree everything with the translator directly; clients never pay the service." },
      ],
    },
    ka: {
      title: "თარჯიმნები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის თარჯიმნები დადასტურებული ნომრებით: ენები, ფასები და ნამდვილი შეფასებები. წერილობითი და ზეპირი თარგმანი — მიწერეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "თარჯიმნები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, ენები, ფასები და ნამდვილი შეფასებები. მიწერეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი თარჯიმნები თავად დაგიკავშირდებიან.",
      servicesTitle: "რაში დაგეხმარებათ თარჯიმანი",
      services: [
        "დოკუმენტების წერილობითი თარგმანი",
        "ნოტარიულად დამოწმებული თარგმანი",
        "ზეპირი თარგმანი შეხვედრებსა და გარიგებებზე",
        "თანხლება ნოტარიუსთან და სახელმწიფო დაწესებულებებში",
        "ხელშეკრულებებისა და ცნობების თარგმანი",
        "საიტებისა და ტექსტების თარგმანი",
      ],
      chooseTitle: "როგორ ავირჩიოთ თარჯიმანი",
      choose: [
        "ნახეთ პროფილში, რომელ ენებსა და ტექსტებზე მუშაობს თარჯიმანი.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“ და განყოფილებას „დოკუმენტები“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "ფასი, ვადა და ფორმატი წინასწარ შეათანხმეთ — გჭირდებათ თუ არა დამოწმება.",
        "სასწრაფოდ გჭირდებათ თარგმანი? დატოვეთ განაცხადი — მას ყველა თარჯიმანი მიიღებს.",
      ],
      priceQ: "რა ღირს თარგმანი ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული თარჯიმანი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. ფასი ენაზე, მოცულობასა და სისწრაფეზეა დამოკიდებული — დააზუსტეთ წინასწარ.`
          : "თითოეული თარჯიმანი ფასებს პროფილში უთითებს. ფასი ენაზე, მოცულობასა და სისწრაფეზეა დამოკიდებული — დააზუსტეთ წინასწარ.",
      faq: [
        {
          q: "შეიძლება ნოტარიულად დამოწმებული თარგმანის გაკეთება?",
          a: "ზოგიერთი თარჯიმანი ამ მომსახურებას გთავაზობთ. როგორ ხდება დამოწმება და რა დოკუმენტებია საჭირო, თავად თარჯიმანს ჰკითხეთ.",
        },
        { q: "NomerOk იღებს საკომისიოს?", a: "არა. თარჯიმანთან პირდაპირ თანხმდებით, კლიენტები სერვისს არაფერს უხდიან." },
      ],
    },
  },

  realtor: {
    ru: {
      title: "Риелторы Батуми — аренда и покупка квартир, контакты напрямую",
      description:
        "Снять или купить квартиру в Батуми: риелторы с подтверждёнными номерами, языками и настоящими отзывами. Опишите, что ищете — бюджет, район, комнаты, — и риелторы предложат варианты.",
      h1: "Риелторы Батуми: аренда и покупка квартир",
      lead: "Ищете квартиру в аренду или для покупки? Позвоните риелтору напрямую — или оставьте заявку: укажите бюджет, район и сколько нужно комнат, и риелторы сами предложат подходящие варианты.",
      servicesTitle: "С чем помогут риелторы",
      services: [
        "Подбор квартиры в аренду",
        "Помощь с покупкой квартиры",
        "Продажа недвижимости",
        "Сдача квартиры в аренду",
        "Показы объектов и переговоры с собственником",
        "Сопровождение сделки",
        "Подбор коммерческой недвижимости",
      ],
      chooseTitle: "Как выбрать риелтора",
      choose: [
        "Смотрите в профиле, чем занимается риелтор: арендой, покупкой или продажей и в каких районах.",
        "Обратите внимание на отметку «Номер подтверждён»: риелтор подтвердил номер через Telegram.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Заранее договоритесь о размере комиссии и о том, кто её платит, — до первого показа.",
        "Ищете жильё срочно — оставьте заявку: её получат все риелторы каталога.",
      ],
      priceQ: "Сколько берут риелторы в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый риелтор указывает условия в своём профиле. Сейчас в каталоге — ${p}. Размер комиссии обсудите с риелтором до начала работы.`
          : "Каждый риелтор указывает условия в своём профиле. Размер комиссии обсудите с риелтором до начала работы.",
      faq: [
        {
          q: "Кто платит комиссию риелтору?",
          a: "Это зависит от договорённости. Уточните у риелтора до первого показа, какая комиссия и кто её платит — вы или собственник.",
        },
        {
          q: "Как быстрее найти квартиру в аренду в Батуми?",
          a: "Оставьте заявку: выберите «Снять», укажите бюджет, район, количество спален и срок. Заявку получат риелторы каталога, и те, у кого есть подходящие варианты, напишут вам сами.",
        },
        {
          q: "Можно ли купить квартиру в Батуми иностранцу?",
          a: "Обычно да — квартиры в Грузии покупают и иностранцы. Детали оформления, проверку объекта и налоги уточните у риелтора или юриста до сделки.",
        },
        {
          q: "Риелторы говорят по-русски?",
          a: "В профиле каждого риелтора указаны языки общения. Выберите того, с кем вам удобно.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Вы договариваетесь с риелтором напрямую, сервис не берёт денег с клиентов и не делает наценку.",
        },
      ],
    },
    en: {
      title: "Real estate agents in Batumi — prices, reviews, direct contacts",
      description:
        "Real estate agents in Batumi with verified numbers: services, languages and real reviews. Renting, buying or selling — call an agent directly or post a request.",
      h1: "Real estate agents in Batumi",
      lead: "Real estate agents' numbers verified via Telegram, with services, languages and real reviews. Call directly — or post a request and available agents will get back to you.",
      servicesTitle: "What real estate agents can help with",
      services: [
        "Finding a flat to rent",
        "Help buying a flat",
        "Selling property",
        "Renting out your flat",
        "Viewings and negotiating with owners",
        "Support through the deal",
        "Finding commercial property",
      ],
      chooseTitle: "How to choose a real estate agent",
      choose: [
        "Check in the profile what the agent does — renting, buying or selling — and in which areas.",
        "Look for the “Number verified” badge — the agent confirmed their number via Telegram.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Agree on the commission and who pays it before the first viewing.",
        "Need a place fast? Post a request — every agent in the catalogue gets it.",
      ],
      priceQ: "How much do real estate agents charge in Batumi?",
      priceA: (p) =>
        p
          ? `Each agent lists their terms in their profile. Right now the catalogue shows ${p}. Discuss the commission with the agent before work starts.`
          : "Each agent lists their terms in their profile. Discuss the commission with the agent before work starts.",
      faq: [
        {
          q: "Who pays the agent's commission?",
          a: "It depends on the agreement. Ask the agent before the first viewing what the commission is and who pays it — you or the owner.",
        },
        {
          q: "Do agents speak English or Russian?",
          a: "Each profile lists the languages the agent speaks. Choose someone you're comfortable with.",
        },
        { q: "Does NomerOk charge a fee?", a: "No. You agree everything with the agent directly; clients never pay the service." },
      ],
    },
    ka: {
      title: "რიელტორები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის რიელტორები დადასტურებული ნომრებით: მომსახურება, ენები და ნამდვილი შეფასებები. ქირა, ყიდვა და გაყიდვა — დაურეკეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "რიელტორები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, მომსახურება, ენები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი რიელტორები თავად დაგიკავშირდებიან.",
      servicesTitle: "რაში დაგეხმარებათ რიელტორი",
      services: [
        "ბინის მოძებნა ქირით",
        "ბინის ყიდვაში დახმარება",
        "უძრავი ქონების გაყიდვა",
        "ბინის გაქირავება",
        "ობიექტების ჩვენება და მესაკუთრესთან მოლაპარაკება",
        "გარიგების თანხლება",
        "კომერციული ფართის მოძებნა",
      ],
      chooseTitle: "როგორ ავირჩიოთ რიელტორი",
      choose: [
        "ნახეთ პროფილში, რას აკეთებს რიელტორი — ქირა, ყიდვა თუ გაყიდვა — და რომელ უბნებში.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "საკომისიო და ვინ იხდის მას, პირველ ჩვენებამდე შეათანხმეთ.",
        "სასწრაფოდ ეძებთ ბინას? დატოვეთ განაცხადი — მას ყველა რიელტორი მიიღებს.",
      ],
      priceQ: "რამდენს იღებენ რიელტორები ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული რიელტორი პირობებს პროფილში უთითებს. ახლა კატალოგში — ${p}. საკომისიოს ოდენობა რიელტორთან მუშაობის დაწყებამდე განიხილეთ.`
          : "თითოეული რიელტორი პირობებს პროფილში უთითებს. საკომისიოს ოდენობა რიელტორთან მუშაობის დაწყებამდე განიხილეთ.",
      faq: [
        {
          q: "ვინ უხდის საკომისიოს რიელტორს?",
          a: "ეს შეთანხმებაზეა დამოკიდებული. პირველ ჩვენებამდე ჰკითხეთ რიელტორს, რა საკომისიოა და ვინ იხდის — თქვენ თუ მესაკუთრე.",
        },
        { q: "NomerOk იღებს საკომისიოს?", a: "არა. რიელტორთან პირდაპირ თანხმდებით, კლიენტები სერვისს არაფერს უხდიან." },
      ],
    },
  },

  photo: {
    ru: {
      title: "Фотографы и видеографы в Батуми — цены, отзывы, контакты",
      description:
        "Фотографы и видеографы Батуми с подтверждёнными номерами: портфолио, цены и настоящие отзывы. Пишите напрямую или оставьте заявку — свободные фотографы откликнутся.",
      h1: "Фотографы и видеографы в Батуми",
      lead: "Номера фотографов и видеографов, подтверждённые через Telegram: портфолио, цены и настоящие отзывы. Пишите напрямую — или оставьте заявку, и свободные специалисты откликнутся сами.",
      servicesTitle: "Какие съёмки проводят",
      services: [
        "Свадебная съёмка",
        "Семейная и детская фотосессия",
        "Love story и индивидуальные фотосессии",
        "Съёмка мероприятий и праздников",
        "Предметная и контент-съёмка для бизнеса",
        "Видеосъёмка и монтаж",
        "Съёмка недвижимости",
      ],
      chooseTitle: "Как выбрать фотографа или видеографа",
      choose: [
        "Смотрите портфолио в профиле — по нему видно стиль съёмки и обработки.",
        "Обратите внимание на отметку «Номер подтверждён»: специалист подтвердил номер через Telegram.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Заранее договоритесь о цене, длительности съёмки, количестве кадров и сроках сдачи.",
        "Не знаете, кого выбрать, — оставьте заявку: её получат все фотографы и видеографы каталога.",
      ],
      priceQ: "Сколько стоит фотосессия в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый специалист указывает цены в своём профиле. Сейчас в каталоге — ${p}. Итоговая цена зависит от вида и длительности съёмки — уточните её заранее.`
          : "Каждый специалист указывает цены в своём профиле. Итоговая цена зависит от вида и длительности съёмки — уточните её заранее.",
      faq: [
        {
          q: "Когда лучше бронировать фотографа?",
          a: "Чем раньше, тем больше выбор — особенно для свадеб и праздников. Свободные даты уточните у фотографа напрямую.",
        },
        {
          q: "Когда будут готовы фото и видео?",
          a: "Срок у каждого специалиста свой и зависит от объёма обработки и монтажа. Спросите фотографа или видеографа до съёмки.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Вы договариваетесь со специалистом напрямую, сервис не берёт денег с клиентов и не делает наценку.",
        },
      ],
    },
    en: {
      title: "Photographers & videographers in Batumi — prices, reviews",
      description:
        "Photographers and videographers in Batumi with verified numbers: portfolios, prices and real reviews. Message directly or post a request and available ones will reply.",
      h1: "Photographers and videographers in Batumi",
      lead: "Photographers' and videographers' numbers verified via Telegram, with portfolios, prices and real reviews. Message directly — or post a request and available specialists will get back to you.",
      servicesTitle: "What shoots they offer",
      services: [
        "Wedding photography and video",
        "Family and kids' photo sessions",
        "Love story and individual photo sessions",
        "Events and celebrations",
        "Product and content shoots for business",
        "Video shooting and editing",
        "Real estate photography",
      ],
      chooseTitle: "How to choose a photographer or videographer",
      choose: [
        "Look through the portfolio in the profile — it shows the shooting and editing style.",
        "Check the “Number verified” badge — the number was confirmed via Telegram.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Agree on the price, shoot length, number of photos and delivery time in advance.",
        "Not sure who to pick? Post a request — every photographer and videographer in the catalogue gets it.",
      ],
      priceQ: "How much does a photo session cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each specialist lists prices in their profile. Right now the catalogue shows ${p}. The final price depends on the type and length of the shoot — confirm it in advance.`
          : "Each specialist lists prices in their profile. The final price depends on the type and length of the shoot — confirm it in advance.",
      faq: [
        {
          q: "When should I book a photographer?",
          a: "The earlier, the more choice you have — especially for weddings and celebrations. Check available dates with the photographer directly.",
        },
        {
          q: "When will the photos and video be ready?",
          a: "Each specialist has their own timeline, depending on editing. Ask the photographer or videographer before the shoot.",
        },
        { q: "Does NomerOk charge a fee?", a: "No. You agree everything with the specialist directly; clients never pay the service." },
      ],
    },
    ka: {
      title: "ფოტოგრაფები და ვიდეოგრაფები ბათუმში — ფასები, შეფასებები",
      description:
        "ბათუმის ფოტოგრაფები და ვიდეოგრაფები დადასტურებული ნომრებით: პორტფოლიო, ფასები და ნამდვილი შეფასებები. მიწერეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "ფოტოგრაფები და ვიდეოგრაფები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, პორტფოლიო, ფასები და ნამდვილი შეფასებები. მიწერეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი სპეციალისტები თავად დაგიკავშირდებიან.",
      servicesTitle: "რა გადაღებებს გთავაზობენ",
      services: [
        "საქორწილო გადაღება",
        "საოჯახო და საბავშვო ფოტოსესია",
        "Love story და ინდივიდუალური ფოტოსესია",
        "ღონისძიებებისა და დღესასწაულების გადაღება",
        "პროდუქტისა და კონტენტის გადაღება ბიზნესისთვის",
        "ვიდეოგადაღება და მონტაჟი",
        "უძრავი ქონების გადაღება",
      ],
      chooseTitle: "როგორ ავირჩიოთ ფოტოგრაფი ან ვიდეოგრაფი",
      choose: [
        "ნახეთ პორტფოლიო პროფილში — ჩანს გადაღებისა და დამუშავების სტილი.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "ფასი, გადაღების ხანგრძლივობა, კადრების რაოდენობა და ჩაბარების ვადა წინასწარ შეათანხმეთ.",
        "არ იცით, ვინ აირჩიოთ? დატოვეთ განაცხადი — მას ყველა ფოტოგრაფი და ვიდეოგრაფი მიიღებს.",
      ],
      priceQ: "რა ღირს ფოტოსესია ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული სპეციალისტი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. საბოლოო ფასი გადაღების ტიპსა და ხანგრძლივობაზეა დამოკიდებული — დააზუსტეთ წინასწარ.`
          : "თითოეული სპეციალისტი ფასებს პროფილში უთითებს. საბოლოო ფასი გადაღების ტიპსა და ხანგრძლივობაზეა დამოკიდებული — დააზუსტეთ წინასწარ.",
      faq: [
        {
          q: "როდის ჯობია ფოტოგრაფის დაჯავშნა?",
          a: "რაც უფრო ადრე, მით მეტი არჩევანი — განსაკუთრებით ქორწილებისა და დღესასწაულებისთვის. თავისუფალი თარიღები ფოტოგრაფს პირდაპირ ჰკითხეთ.",
        },
        {
          q: "როდის იქნება ფოტოები და ვიდეო მზად?",
          a: "ვადა თითოეულ სპეციალისტს თავისი აქვს და დამუშავებაზეა დამოკიდებული. ჰკითხეთ გადაღებამდე.",
        },
        { q: "NomerOk იღებს საკომისიოს?", a: "არა. სპეციალისტთან პირდაპირ თანხმდებით, კლიენტები სერვისს არაფერს უხდიან." },
      ],
    },
  },
};
