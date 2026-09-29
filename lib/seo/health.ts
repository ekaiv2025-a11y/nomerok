import type { SeoContent } from "../seo-categories";

export const SEO_HEALTH: SeoContent = {
  doctor: {
    ru: {
      title: "Врачи в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Врачи Батуми с подтверждёнными номерами: образование, языки приёма, цены и настоящие отзывы. Записывайтесь напрямую или оставьте заявку — специалисты откликнутся сами.",
      h1: "Врачи в Батуми",
      lead: "Номера врачей, подтверждённые через Telegram: образование, языки приёма, цены и настоящие отзывы. Связывайтесь напрямую — или оставьте заявку, и свободные специалисты ответят сами.",
      servicesTitle: "Каких врачей ищут в Батуми",
      services: [
        "Терапевты и семейные врачи",
        "Педиатры",
        "Гинекологи",
        "Кардиологи",
        "Неврологи",
        "Дерматологи",
        "Лор-врачи",
        "Приём на дому",
      ],
      chooseTitle: "Как выбрать врача",
      choose: [
        "Смотрите в профиле образование, специализацию и опыт — их указывает сам врач.",
        "Обратите внимание на отметку «Документы проверены»: диплом или лицензию проверил NomerOk.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Проверьте языки приёма: в профиле видно, говорит ли врач по-русски, по-английски или по-грузински.",
        "Не знаете, к кому обратиться, — оставьте заявку: её получат все врачи каталога.",
      ],
      priceQ: "Сколько стоит приём врача в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый врач указывает цены в своём профиле. Сейчас в каталоге — ${p}. Точную стоимость уточняйте у врача при записи.`
          : "Каждый врач указывает цены в своём профиле. Точную стоимость уточняйте у врача при записи.",
      faq: [
        {
          q: "Что делать в экстренной ситуации?",
          a: "Звоните 112 — это единый номер экстренных служб в Грузии. Не полагайтесь на каталог: NomerOk не оказывает медицинских услуг и не заменяет скорую помощь.",
        },
        {
          q: "Есть врачи, которые принимают на русском или английском?",
          a: "Да. В профиле каждого врача указаны языки приёма — выберите, с кем вам удобно общаться.",
        },
        {
          q: "NomerOk рекомендует конкретных врачей?",
          a: "Нет. NomerOk — каталог: мы не оказываем медицинских услуг и не рекомендуем конкретных специалистов. Вы выбираете врача сами и договариваетесь с ним напрямую, без комиссии.",
        },
      ],
    },
    en: {
      title: "Doctors in Batumi — prices, reviews, direct contacts",
      description:
        "Doctors in Batumi with verified phone numbers: education, consultation languages, prices and real reviews. Contact a doctor directly or post a request and specialists will reply.",
      h1: "Doctors in Batumi",
      lead: "Doctors' numbers verified via Telegram, with education, consultation languages, prices and real reviews. Contact directly — or post a request and available specialists will get back to you.",
      servicesTitle: "Doctors people look for in Batumi",
      services: [
        "General practitioners and family doctors",
        "Paediatricians",
        "Gynaecologists",
        "Cardiologists",
        "Neurologists",
        "Dermatologists",
        "ENT doctors",
        "Home visits",
      ],
      chooseTitle: "How to choose a doctor",
      choose: [
        "Check the education, specialisation and experience in the profile — the doctor lists them.",
        "Look for the “Documents verified” badge — NomerOk has checked the diploma or licence.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Check consultation languages — the profile shows whether the doctor speaks English, Russian or Georgian.",
        "Not sure who to see? Post a request — every doctor in the catalogue gets it.",
      ],
      priceQ: "How much does a doctor's appointment cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each doctor lists prices in their profile. Right now the catalogue shows ${p}. Confirm the exact price with the doctor when booking.`
          : "Each doctor lists prices in their profile. Confirm the exact price with the doctor when booking.",
      faq: [
        {
          q: "What should I do in an emergency?",
          a: "Call 112 — the emergency number in Georgia. Don't rely on the catalogue: NomerOk does not provide medical services and is not an ambulance service.",
        },
        {
          q: "Are there doctors who consult in English or Russian?",
          a: "Yes. Each profile lists the languages the doctor consults in — pick the one you're comfortable with.",
        },
        {
          q: "Does NomerOk recommend specific doctors?",
          a: "No. NomerOk is a catalogue: it does not provide medical services or recommend specific specialists. You choose and agree with the doctor directly, with no commission.",
        },
      ],
    },
    ka: {
      title: "ექიმები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის ექიმები დადასტურებული ნომრებით: განათლება, მიღების ენები, ფასები და ნამდვილი შეფასებები. დაუკავშირდით პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "ექიმები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, განათლება, მიღების ენები, ფასები და ნამდვილი შეფასებები. დაუკავშირდით პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი სპეციალისტები თავად გიპასუხებენ.",
      servicesTitle: "რომელ ექიმებს ეძებენ ბათუმში",
      services: [
        "თერაპევტები და ოჯახის ექიმები",
        "პედიატრები",
        "გინეკოლოგები",
        "კარდიოლოგები",
        "ნევროლოგები",
        "დერმატოლოგები",
        "ოტორინოლარინგოლოგები",
        "ბინაზე ვიზიტი",
      ],
      chooseTitle: "როგორ ავირჩიოთ ექიმი",
      choose: [
        "ნახეთ პროფილში განათლება, სპეციალიზაცია და გამოცდილება — მათ თავად ექიმი უთითებს.",
        "მიაქციეთ ყურადღება ნიშანს „დოკუმენტები შემოწმებულია“ — დიპლომი ან ლიცენზია NomerOk-მა შეამოწმა.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "შეამოწმეთ მიღების ენები — პროფილში ჩანს, საუბრობს თუ არა ექიმი რუსულად ან ინგლისურად.",
        "არ იცით, ვის მიმართოთ? დატოვეთ განაცხადი — მას კატალოგის ყველა ექიმი მიიღებს.",
      ],
      priceQ: "რა ღირს ექიმთან მიღება ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული ექიმი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. ზუსტი ფასი ჩაწერისას დააზუსტეთ ექიმთან.`
          : "თითოეული ექიმი ფასებს პროფილში უთითებს. ზუსტი ფასი ჩაწერისას დააზუსტეთ ექიმთან.",
      faq: [
        {
          q: "რა გავაკეთო გადაუდებელ შემთხვევაში?",
          a: "დარეკეთ 112-ზე — ეს საქართველოს გადაუდებელი დახმარების ნომერია. ნუ დაეყრდნობით კატალოგს: NomerOk არ ეწევა სამედიცინო მომსახურებას.",
        },
        {
          q: "NomerOk გირჩევთ კონკრეტულ ექიმებს?",
          a: "არა. NomerOk კატალოგია: არ ეწევა სამედიცინო მომსახურებას და არ გირჩევთ კონკრეტულ სპეციალისტებს. ექიმს თავად ირჩევთ და პირდაპირ თანხმდებით, საკომისიოს გარეშე.",
        },
      ],
    },
  },

  dentist: {
    ru: {
      title: "Стоматологи в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Стоматологи Батуми с подтверждёнными номерами: образование, языки приёма, цены, адрес на карте и настоящие отзывы. Записывайтесь напрямую или оставьте заявку.",
      h1: "Стоматологи в Батуми",
      lead: "Номера стоматологов, подтверждённые через Telegram: образование, цены, адрес на карте и настоящие отзывы. Записывайтесь напрямую — или оставьте заявку, и свободные специалисты ответят сами.",
      servicesTitle: "С чем обращаются к стоматологу",
      services: [
        "Консультация и осмотр",
        "Профессиональная гигиена и чистка",
        "Лечение зубов",
        "Протезирование",
        "Имплантация",
        "Ортодонтия (брекеты, элайнеры)",
        "Детская стоматология",
        "Отбеливание",
      ],
      chooseTitle: "Как выбрать стоматолога",
      choose: [
        "Смотрите в профиле образование и специализацию — их указывает сам врач.",
        "Обратите внимание на отметку «Документы проверены»: диплом или лицензию проверил NomerOk.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Проверьте языки приёма и адрес клиники на карте — удобно выбрать ближе к дому.",
        "Не знаете, куда обратиться, — оставьте заявку: её получат все стоматологи каталога.",
      ],
      priceQ: "Сколько стоит приём стоматолога в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый стоматолог указывает цены в своём профиле. Сейчас в каталоге — ${p}. Точную стоимость лечения врач называет после осмотра.`
          : "Каждый стоматолог указывает цены в своём профиле. Точную стоимость лечения врач называет после осмотра — спросите цену заранее.",
      faq: [
        {
          q: "Что делать при острой боли или травме?",
          a: "В экстренной ситуации звоните 112 — это единый номер экстренных служб в Грузии. Не полагайтесь на каталог: NomerOk не оказывает медицинских услуг.",
        },
        {
          q: "Есть стоматологи, которые говорят по-русски или по-английски?",
          a: "Да. В профиле каждого врача указаны языки приёма — выберите, с кем вам удобно.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Вы записываетесь к стоматологу напрямую, сервис не берёт денег с клиентов и не рекомендует конкретных врачей.",
        },
      ],
    },
    en: {
      title: "Dentists in Batumi — prices, reviews, direct contacts",
      description:
        "Dentists in Batumi with verified phone numbers: education, consultation languages, prices, map location and real reviews. Book directly or post a request.",
      h1: "Dentists in Batumi",
      lead: "Dentists' numbers verified via Telegram, with education, prices, map location and real reviews. Book directly — or post a request and available dentists will get back to you.",
      servicesTitle: "What dentists can help with",
      services: [
        "Consultation and check-up",
        "Professional cleaning and hygiene",
        "Fillings and dental treatment",
        "Crowns and dentures",
        "Implants",
        "Orthodontics (braces, aligners)",
        "Children's dentistry",
        "Teeth whitening",
      ],
      chooseTitle: "How to choose a dentist",
      choose: [
        "Check the education and specialisation in the profile — the dentist lists them.",
        "Look for the “Documents verified” badge — NomerOk has checked the diploma or licence.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Check consultation languages and the clinic location on the map.",
        "Not sure where to go? Post a request — every dentist in the catalogue gets it.",
      ],
      priceQ: "How much does a dentist cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each dentist lists prices in their profile. Right now the catalogue shows ${p}. The final treatment price is given after a check-up.`
          : "Each dentist lists prices in their profile. The final treatment price is given after a check-up — ask in advance.",
      faq: [
        {
          q: "What if I have severe pain or an injury?",
          a: "In an emergency call 112 — the emergency number in Georgia. Don't rely on the catalogue: NomerOk does not provide medical services.",
        },
        {
          q: "Do dentists speak English or Russian?",
          a: "Each profile lists the languages the dentist speaks — pick the one you're comfortable with.",
        },
        {
          q: "Does NomerOk charge a fee?",
          a: "No. You book with the dentist directly; clients never pay the service, and NomerOk does not recommend specific dentists.",
        },
      ],
    },
    ka: {
      title: "სტომატოლოგები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის სტომატოლოგები დადასტურებული ნომრებით: განათლება, მიღების ენები, ფასები, მისამართი რუკაზე და ნამდვილი შეფასებები. ჩაეწერეთ პირდაპირ.",
      h1: "სტომატოლოგები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, განათლება, ფასები, მისამართი რუკაზე და ნამდვილი შეფასებები. ჩაეწერეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი სპეციალისტები თავად გიპასუხებენ.",
      servicesTitle: "რაში დაგეხმარებათ სტომატოლოგი",
      services: [
        "კონსულტაცია და გასინჯვა",
        "პროფესიული ჰიგიენა და წმენდა",
        "კბილების მკურნალობა",
        "პროთეზირება",
        "იმპლანტაცია",
        "ორთოდონტია (ბრეკეტები, ელაინერები)",
        "ბავშვთა სტომატოლოგია",
        "კბილების გათეთრება",
      ],
      chooseTitle: "როგორ ავირჩიოთ სტომატოლოგი",
      choose: [
        "ნახეთ პროფილში განათლება და სპეციალიზაცია — მათ თავად ექიმი უთითებს.",
        "მიაქციეთ ყურადღება ნიშანს „დოკუმენტები შემოწმებულია“ — დიპლომი ან ლიცენზია NomerOk-მა შეამოწმა.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "შეამოწმეთ მიღების ენები და კლინიკის მისამართი რუკაზე.",
        "არ იცით, ვის მიმართოთ? დატოვეთ განაცხადი — მას კატალოგის ყველა სტომატოლოგი მიიღებს.",
      ],
      priceQ: "რა ღირს სტომატოლოგთან მიღება ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული სტომატოლოგი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. მკურნალობის ზუსტ ფასს ექიმი გასინჯვის შემდეგ გეტყვით.`
          : "თითოეული სტომატოლოგი ფასებს პროფილში უთითებს. მკურნალობის ზუსტ ფასს ექიმი გასინჯვის შემდეგ გეტყვით.",
      faq: [
        {
          q: "რა გავაკეთო ძლიერი ტკივილის ან ტრავმის დროს?",
          a: "გადაუდებელ შემთხვევაში დარეკეთ 112-ზე — ეს საქართველოს გადაუდებელი დახმარების ნომერია. ნუ დაეყრდნობით კატალოგს: NomerOk არ ეწევა სამედიცინო მომსახურებას.",
        },
        {
          q: "NomerOk იღებს საკომისიოს?",
          a: "არა. სტომატოლოგთან პირდაპირ ეწერებით, კლიენტები სერვისს არაფერს უხდიან.",
        },
      ],
    },
  },

  psychologist: {
    ru: {
      title: "Психологи в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Психологи Батуми с подтверждёнными номерами: образование, подходы, языки консультаций, цены и настоящие отзывы. Очно и онлайн. Пишите напрямую или оставьте заявку.",
      h1: "Психологи в Батуми",
      lead: "Номера психологов, подтверждённые через Telegram: образование, языки консультаций, цены и настоящие отзывы. Пишите напрямую — или оставьте заявку, и специалисты ответят сами.",
      servicesTitle: "С чем работают психологи",
      services: [
        "Индивидуальные консультации",
        "Семейные и парные консультации",
        "Детские и подростковые психологи",
        "Помощь при переезде и адаптации",
        "Стресс и эмоциональное выгорание",
        "Отношения и личные кризисы",
        "Онлайн-консультации",
      ],
      chooseTitle: "Как выбрать психолога",
      choose: [
        "Смотрите в профиле образование и подход, в котором работает специалист.",
        "Обратите внимание на отметку «Документы проверены»: диплом или сертификаты проверил NomerOk.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Выбирайте язык консультации, на котором вам легко говорить, и начните с ознакомительной встречи.",
        "Не знаете, кого выбрать, — оставьте заявку: её получат все психологи каталога.",
      ],
      priceQ: "Сколько стоит консультация психолога в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый психолог указывает цены в своём профиле. Сейчас в каталоге — ${p}. Стоимость и длительность сессии уточняйте у специалиста.`
          : "Каждый психолог указывает цены в своём профиле. Стоимость и длительность сессии уточняйте у специалиста.",
      faq: [
        {
          q: "Можно заниматься онлайн?",
          a: "Да, многие психологи проводят консультации онлайн. Формат работы указан в профиле — уточните его при первом контакте.",
        },
        {
          q: "А конфиденциальность?",
          a: "Конфиденциальность — часть профессиональной этики психолога. Обсудите её со специалистом на первой встрече. NomerOk не участвует в консультациях и не получает их содержание.",
        },
        {
          q: "Если нужна срочная помощь?",
          a: "Если есть угроза жизни или здоровью, звоните 112 — это единый номер экстренных служб в Грузии. Каталог не заменяет экстренную помощь.",
        },
      ],
    },
    en: {
      title: "Psychologists in Batumi — prices, reviews, direct contacts",
      description:
        "Psychologists in Batumi with verified phone numbers: education, approaches, session languages, prices and real reviews. In person and online. Message directly or post a request.",
      h1: "Psychologists in Batumi",
      lead: "Psychologists' numbers verified via Telegram, with education, session languages, prices and real reviews. Message directly — or post a request and specialists will get back to you.",
      servicesTitle: "What psychologists work with",
      services: [
        "Individual sessions",
        "Family and couples counselling",
        "Child and teen psychologists",
        "Support with relocation and adaptation",
        "Stress and burnout",
        "Relationships and personal crises",
        "Online sessions",
      ],
      chooseTitle: "How to choose a psychologist",
      choose: [
        "Check the education and the approach the specialist works in — both are in the profile.",
        "Look for the “Documents verified” badge — NomerOk has checked the diploma or certificates.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Choose a session language you're comfortable in, and start with an introductory meeting.",
        "Not sure who to pick? Post a request — every psychologist in the catalogue gets it.",
      ],
      priceQ: "How much does a psychologist cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each psychologist lists prices in their profile. Right now the catalogue shows ${p}. Confirm the price and session length with the specialist.`
          : "Each psychologist lists prices in their profile. Confirm the price and session length with the specialist.",
      faq: [
        {
          q: "Are online sessions possible?",
          a: "Yes, many psychologists work online. The format is shown in the profile — confirm it when you first get in touch.",
        },
        {
          q: "What about confidentiality?",
          a: "Confidentiality is part of a psychologist's professional ethics — discuss it with the specialist at the first meeting. NomerOk takes no part in sessions and never sees their content.",
        },
        {
          q: "What if I need urgent help?",
          a: "If there is a risk to life or health, call 112 — the emergency number in Georgia. The catalogue is not an emergency service.",
        },
      ],
    },
    ka: {
      title: "ფსიქოლოგები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის ფსიქოლოგები დადასტურებული ნომრებით: განათლება, კონსულტაციის ენები, ფასები და ნამდვილი შეფასებები. პირისპირ და ონლაინ. მიწერეთ პირდაპირ.",
      h1: "ფსიქოლოგები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, განათლება, კონსულტაციის ენები, ფასები და ნამდვილი შეფასებები. მიწერეთ პირდაპირ — ან დატოვეთ განაცხადი და სპეციალისტები თავად გიპასუხებენ.",
      servicesTitle: "რაზე მუშაობენ ფსიქოლოგები",
      services: [
        "ინდივიდუალური კონსულტაციები",
        "ოჯახური და წყვილის კონსულტაციები",
        "ბავშვთა და მოზარდთა ფსიქოლოგები",
        "გადასახლება და ადაპტაცია",
        "სტრესი და გადაწვა",
        "ურთიერთობები და პირადი კრიზისები",
        "ონლაინ კონსულტაციები",
      ],
      chooseTitle: "როგორ ავირჩიოთ ფსიქოლოგი",
      choose: [
        "ნახეთ პროფილში განათლება და მიდგომა, რომლითაც სპეციალისტი მუშაობს.",
        "მიაქციეთ ყურადღება ნიშანს „დოკუმენტები შემოწმებულია“ — დიპლომი ან სერტიფიკატები NomerOk-მა შეამოწმა.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "აირჩიეთ ენა, რომელზეც თავისუფლად საუბრობთ, და დაიწყეთ გაცნობითი შეხვედრით.",
        "არ იცით, ვინ აირჩიოთ? დატოვეთ განაცხადი — მას კატალოგის ყველა ფსიქოლოგი მიიღებს.",
      ],
      priceQ: "რა ღირს ფსიქოლოგის კონსულტაცია ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული ფსიქოლოგი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. სესიის ფასი და ხანგრძლივობა დააზუსტეთ სპეციალისტთან.`
          : "თითოეული ფსიქოლოგი ფასებს პროფილში უთითებს. სესიის ფასი და ხანგრძლივობა დააზუსტეთ სპეციალისტთან.",
      faq: [
        {
          q: "შეიძლება ონლაინ კონსულტაცია?",
          a: "დიახ, ბევრი ფსიქოლოგი ონლაინ მუშაობს. ფორმატი პროფილშია მითითებული — დააზუსტეთ პირველი კონტაქტისას.",
        },
        {
          q: "რაც შეეხება კონფიდენციალურობას?",
          a: "კონფიდენციალურობა ფსიქოლოგის პროფესიული ეთიკის ნაწილია — განიხილეთ ის სპეციალისტთან პირველ შეხვედრაზე. NomerOk კონსულტაციებში არ მონაწილეობს.",
        },
        {
          q: "თუ სასწრაფო დახმარება მჭირდება?",
          a: "თუ სიცოცხლეს ან ჯანმრთელობას საფრთხე ემუქრება, დარეკეთ 112-ზე — ეს საქართველოს გადაუდებელი დახმარების ნომერია.",
        },
      ],
    },
  },

  massage: {
    ru: {
      title: "Массажисты в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Массажисты Батуми с подтверждёнными номерами: виды массажа, образование, цены и настоящие отзывы. В кабинете или с выездом на дом. Записывайтесь напрямую или оставьте заявку.",
      h1: "Массажисты в Батуми",
      lead: "Номера массажистов, подтверждённые через Telegram: виды массажа, цены и настоящие отзывы. Записывайтесь напрямую — или оставьте заявку, и свободные специалисты ответят сами.",
      servicesTitle: "Какой массаж делают массажисты",
      services: [
        "Классический массаж",
        "Расслабляющий массаж",
        "Массаж спины и шейно-воротниковой зоны",
        "Спортивный массаж",
        "Лимфодренажный массаж",
        "Антицеллюлитный массаж",
        "Детский массаж",
        "Массаж с выездом на дом",
      ],
      chooseTitle: "Как выбрать массажиста",
      choose: [
        "Смотрите в профиле образование, курсы и виды массажа, которые делает специалист.",
        "Обратите внимание на отметку «Документы проверены»: дипломы и сертификаты проверил NomerOk.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Уточните заранее цену, длительность сеанса и язык общения.",
        "Нужно на сегодня — оставьте заявку: её получат все массажисты каталога.",
      ],
      priceQ: "Сколько стоит массаж в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый массажист указывает цены в своём профиле. Сейчас в каталоге — ${p}. Цена зависит от вида и длительности массажа.`
          : "Каждый массажист указывает цены в своём профиле. Цена зависит от вида и длительности массажа — уточните её заранее.",
      faq: [
        {
          q: "Можно вызвать массажиста на дом?",
          a: "Да, некоторые массажисты выезжают на дом. Это указано в профиле — или напишите об этом в заявке.",
        },
        {
          q: "Массажисты говорят по-русски?",
          a: "В профиле каждого специалиста указаны языки общения. Выберите, с кем вам удобно.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Вы договариваетесь с массажистом напрямую, сервис не берёт денег с клиентов.",
        },
      ],
    },
    en: {
      title: "Massage in Batumi — prices, reviews, direct contacts",
      description:
        "Massage therapists in Batumi with verified phone numbers: massage types, training, prices and real reviews. In a studio or at home. Book directly or post a request.",
      h1: "Massage therapists in Batumi",
      lead: "Massage therapists' numbers verified via Telegram, with massage types, prices and real reviews. Book directly — or post a request and available therapists will get back to you.",
      servicesTitle: "Types of massage",
      services: [
        "Classic massage",
        "Relaxing massage",
        "Back, neck and shoulder massage",
        "Sports massage",
        "Lymphatic drainage massage",
        "Anti-cellulite massage",
        "Baby and children's massage",
        "Home-visit massage",
      ],
      chooseTitle: "How to choose a massage therapist",
      choose: [
        "Check the training, courses and massage types listed in the profile.",
        "Look for the “Documents verified” badge — NomerOk has checked the diplomas and certificates.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Agree on the price, session length and language in advance.",
        "Need it today? Post a request — every massage therapist in the catalogue gets it.",
      ],
      priceQ: "How much does a massage cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each massage therapist lists prices in their profile. Right now the catalogue shows ${p}. The price depends on the type and length of the massage.`
          : "Each massage therapist lists prices in their profile. The price depends on the type and length of the massage — ask in advance.",
      faq: [
        {
          q: "Can a massage therapist come to my home?",
          a: "Yes, some therapists do home visits. It's shown in the profile — or mention it in your request.",
        },
        {
          q: "Do massage therapists speak English or Russian?",
          a: "Each profile lists the languages the therapist speaks — pick the one you're comfortable with.",
        },
        {
          q: "Does NomerOk charge a fee?",
          a: "No. You agree everything with the therapist directly; clients never pay the service.",
        },
      ],
    },
    ka: {
      title: "მასაჟი ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის მასაჟისტები დადასტურებული ნომრებით: მასაჟის სახეები, განათლება, ფასები და ნამდვილი შეფასებები. კაბინეტში ან ბინაზე. ჩაეწერეთ პირდაპირ.",
      h1: "მასაჟისტები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, მასაჟის სახეები, ფასები და ნამდვილი შეფასებები. ჩაეწერეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი სპეციალისტები თავად გიპასუხებენ.",
      servicesTitle: "მასაჟის სახეები",
      services: [
        "კლასიკური მასაჟი",
        "რელაქსაციური მასაჟი",
        "ზურგისა და კისრის მასაჟი",
        "სპორტული მასაჟი",
        "ლიმფოდრენაჟული მასაჟი",
        "ანტიცელულიტური მასაჟი",
        "ბავშვთა მასაჟი",
        "მასაჟი ბინაზე",
      ],
      chooseTitle: "როგორ ავირჩიოთ მასაჟისტი",
      choose: [
        "ნახეთ პროფილში განათლება, კურსები და მასაჟის სახეები.",
        "მიაქციეთ ყურადღება ნიშანს „დოკუმენტები შემოწმებულია“ — დიპლომები და სერტიფიკატები NomerOk-მა შეამოწმა.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "წინასწარ შეათანხმეთ ფასი, სეანსის ხანგრძლივობა და საუბრის ენა.",
        "დღესვე გჭირდებათ? დატოვეთ განაცხადი — მას კატალოგის ყველა მასაჟისტი მიიღებს.",
      ],
      priceQ: "რა ღირს მასაჟი ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული მასაჟისტი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. ფასი მასაჟის სახესა და ხანგრძლივობაზეა დამოკიდებული.`
          : "თითოეული მასაჟისტი ფასებს პროფილში უთითებს. ფასი მასაჟის სახესა და ხანგრძლივობაზეა დამოკიდებული.",
      faq: [
        {
          q: "შეიძლება მასაჟისტის ბინაზე გამოძახება?",
          a: "დიახ, ზოგიერთი მასაჟისტი ბინაზე მოდის. ეს პროფილშია მითითებული — ან დაწერეთ განაცხადში.",
        },
        {
          q: "NomerOk იღებს საკომისიოს?",
          a: "არა. მასაჟისტთან პირდაპირ თანხმდებით, კლიენტები სერვისს არაფერს უხდიან.",
        },
      ],
    },
  },

  vet: {
    ru: {
      title: "Ветеринары в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Ветеринары Батуми с подтверждёнными номерами: образование, цены, адрес на карте и настоящие отзывы. В клинике или с выездом на дом. Звоните напрямую или оставьте заявку.",
      h1: "Ветеринары в Батуми",
      lead: "Номера ветеринаров, подтверждённые через Telegram: образование, цены, адрес на карте и настоящие отзывы. Звоните напрямую — или оставьте заявку, и свободные врачи ответят сами.",
      servicesTitle: "С чем обращаются к ветеринару",
      services: [
        "Осмотр и консультация",
        "Вакцинация",
        "Чипирование и документы для выезда",
        "Стерилизация и кастрация",
        "Анализы и УЗИ",
        "Груминг и гигиена",
        "Выезд на дом",
      ],
      chooseTitle: "Как выбрать ветеринара",
      choose: [
        "Смотрите в профиле образование, опыт и то, с какими животными работает врач.",
        "Обратите внимание на отметку «Документы проверены»: диплом или лицензию проверил NomerOk.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Проверьте язык общения и адрес клиники на карте — или есть ли выезд на дом.",
        "Не знаете, к кому обратиться, — оставьте заявку: её получат все ветеринары каталога.",
      ],
      priceQ: "Сколько стоит приём ветеринара в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый ветеринар указывает цены в своём профиле. Сейчас в каталоге — ${p}. Точную стоимость врач называет после осмотра.`
          : "Каждый ветеринар указывает цены в своём профиле. Точную стоимость врач называет после осмотра — спросите цену заранее.",
      faq: [
        {
          q: "Что делать, если питомцу срочно нужна помощь?",
          a: "В экстренной ситуации не полагайтесь на каталог: звоните 112 (единый номер экстренных служб в Грузии) или сразу в ближайшую ветклинику, которая работает сейчас.",
        },
        {
          q: "Можно вызвать ветеринара на дом?",
          a: "Да, некоторые ветеринары выезжают на дом. Это указано в профиле — или напишите об этом в заявке.",
        },
        {
          q: "Ветеринары говорят по-русски?",
          a: "В профиле каждого врача указаны языки общения. Выберите, с кем вам удобно.",
        },
      ],
    },
    en: {
      title: "Vets in Batumi — prices, reviews, direct contacts",
      description:
        "Vets in Batumi with verified phone numbers: education, prices, map location and real reviews. At the clinic or home visits. Call a vet directly or post a request.",
      h1: "Vets in Batumi",
      lead: "Vets' numbers verified via Telegram, with education, prices, map location and real reviews. Call directly — or post a request and available vets will get back to you.",
      servicesTitle: "What vets can help with",
      services: [
        "Check-ups and consultations",
        "Vaccinations",
        "Microchipping and travel documents",
        "Spaying and neutering",
        "Tests and ultrasound",
        "Grooming and hygiene",
        "Home visits",
      ],
      chooseTitle: "How to choose a vet",
      choose: [
        "Check the education, experience and which animals the vet works with — all in the profile.",
        "Look for the “Documents verified” badge — NomerOk has checked the diploma or licence.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Check the language, the clinic location on the map, or whether home visits are offered.",
        "Not sure who to call? Post a request — every vet in the catalogue gets it.",
      ],
      priceQ: "How much does a vet cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each vet lists prices in their profile. Right now the catalogue shows ${p}. The final price is given after examination.`
          : "Each vet lists prices in their profile. The final price is given after examination — ask in advance.",
      faq: [
        {
          q: "What if my pet needs urgent help?",
          a: "In an emergency don't rely on the catalogue: call 112 (the emergency number in Georgia) or go straight to the nearest vet clinic that is open now.",
        },
        {
          q: "Can a vet come to my home?",
          a: "Yes, some vets do home visits. It's shown in the profile — or mention it in your request.",
        },
        {
          q: "Do vets speak English or Russian?",
          a: "Each profile lists the languages the vet speaks — pick the one you're comfortable with.",
        },
      ],
    },
    ka: {
      title: "ვეტერინარები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის ვეტერინარები დადასტურებული ნომრებით: განათლება, ფასები, მისამართი რუკაზე და ნამდვილი შეფასებები. კლინიკაში ან ბინაზე. დაურეკეთ პირდაპირ.",
      h1: "ვეტერინარები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, განათლება, ფასები, მისამართი რუკაზე და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი ექიმები თავად გიპასუხებენ.",
      servicesTitle: "რაში დაგეხმარებათ ვეტერინარი",
      services: [
        "გასინჯვა და კონსულტაცია",
        "ვაქცინაცია",
        "ჩიპირება და დოკუმენტები გასამგზავრებლად",
        "სტერილიზაცია და კასტრაცია",
        "ანალიზები და ულტრაბგერა",
        "გრუმინგი და ჰიგიენა",
        "ბინაზე ვიზიტი",
      ],
      chooseTitle: "როგორ ავირჩიოთ ვეტერინარი",
      choose: [
        "ნახეთ პროფილში განათლება, გამოცდილება და რა ცხოველებთან მუშაობს ექიმი.",
        "მიაქციეთ ყურადღება ნიშანს „დოკუმენტები შემოწმებულია“ — დიპლომი ან ლიცენზია NomerOk-მა შეამოწმა.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "შეამოწმეთ საუბრის ენა, კლინიკის მისამართი რუკაზე ან ბინაზე ვიზიტის შესაძლებლობა.",
        "არ იცით, ვის მიმართოთ? დატოვეთ განაცხადი — მას კატალოგის ყველა ვეტერინარი მიიღებს.",
      ],
      priceQ: "რა ღირს ვეტერინართან მიღება ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული ვეტერინარი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. ზუსტ ფასს ექიმი გასინჯვის შემდეგ გეტყვით.`
          : "თითოეული ვეტერინარი ფასებს პროფილში უთითებს. ზუსტ ფასს ექიმი გასინჯვის შემდეგ გეტყვით.",
      faq: [
        {
          q: "რა გავაკეთო, თუ ცხოველს სასწრაფო დახმარება სჭირდება?",
          a: "გადაუდებელ შემთხვევაში ნუ დაეყრდნობით კატალოგს: დარეკეთ 112-ზე (საქართველოს გადაუდებელი დახმარების ნომერი) ან მიმართეთ უახლოეს ღია ვეტკლინიკას.",
        },
        {
          q: "შეიძლება ვეტერინარის ბინაზე გამოძახება?",
          a: "დიახ, ზოგიერთი ვეტერინარი ბინაზე მოდის. ეს პროფილშია მითითებული — ან დაწერეთ განაცხადში.",
        },
      ],
    },
  },
};
