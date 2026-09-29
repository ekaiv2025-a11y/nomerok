import type { SeoContent } from "../seo-categories";

export const SEO_HOME: SeoContent = {
  inspection: {
    ru: {
      title: "Технадзор и приёмка квартир в Батуми — инженеры, цены, контакты",
      description:
        "Технадзор в Батуми: приёмка квартиры от застройщика, проверка перед покупкой, обследование зданий и контроль ремонта. Цены и контакты инженеров напрямую.",
      h1: "Технадзор и приёмка квартир в Батуми",
      lead: "Инженеры, которые проверят квартиру перед покупкой или при приёмке от застройщика, найдут скрытые дефекты и проконтролируют ремонт. Связывайтесь напрямую — или оставьте заявку.",
      servicesTitle: "С чем помогут",
      services: [
        "Приёмка квартиры от застройщика",
        "Проверка квартиры или дома перед покупкой",
        "Технический надзор за ремонтом и строительством",
        "Обследование конструкций: бетон, арматура, трещины",
        "Тепловизионная съёмка: мостики холода, утечки тепла",
        "Проверка гидроизоляции, влажности и вентиляции",
        "Заключение с фото и списком дефектов для застройщика",
      ],
      chooseTitle: "Как выбрать специалиста",
      choose: [
        "Спросите, какими приборами он работает и что будет в заключении: фото, замеры, список дефектов.",
        "Посмотрите раздел «Документы» и образование в профиле — документы загружает сам специалист, при сомнениях попросите оригинал.",
        "Договоритесь о проверке до подписания акта приёмки — потом добиться исправлений сложнее.",
        "Уточните цену заранее: она зависит от площади и того, нужны ли инструментальные измерения.",
      ],
      priceQ: "Сколько стоит приёмка квартиры в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый специалист указывает цены в своём профиле. Сейчас в каталоге — ${p}. Итог зависит от площади и набора проверок.`
          : "Каждый специалист указывает цены в своём профиле. Итог зависит от площади квартиры и того, нужны ли инструментальные измерения.",
      faq: [
        {
          q: "Зачем нужна приёмка квартиры от застройщика?",
          a: "Инженер находит дефекты, которые сложно заметить самому: неровные стены и стяжку, трещины, проблемы с окнами, гидроизоляцией и электрикой. Список дефектов можно передать застройщику до подписания акта.",
        },
        {
          q: "Берёт ли NomerOk комиссию?",
          a: "Нет. Вы договариваетесь со специалистом напрямую и платите только ему.",
        },
      ],
    },
    en: {
      title: "Building inspection in Batumi — snagging, pre-purchase checks, contacts",
      description:
        "Building inspectors in Batumi: new-build handover (snagging), pre-purchase surveys, structural checks and renovation supervision. Prices and direct contacts.",
      h1: "Building inspection in Batumi",
      lead: "Engineers who check a flat before you buy it or accept it from the developer, find hidden defects and supervise renovation. Contact them directly — or leave a request.",
      servicesTitle: "What they can help with",
      services: [
        "New-build handover inspection (snagging)",
        "Pre-purchase survey of a flat or house",
        "Supervision of renovation and construction",
        "Structural checks: concrete, rebar, cracks",
        "Thermal imaging: cold bridges and heat loss",
        "Waterproofing, moisture and ventilation checks",
        "Written report with photos and a defect list",
      ],
      chooseTitle: "How to choose",
      choose: [
        "Ask which instruments they use and what the report includes: photos, measurements, a defect list.",
        "Check education and the “Documents” section — documents are uploaded by the specialist; if in doubt, ask to see the original.",
        "Book the inspection before signing the handover act — getting fixes afterwards is harder.",
        "Agree on the price in advance: it depends on floor area and whether instrument measurements are needed.",
      ],
      priceQ: "How much does a handover inspection cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each specialist lists prices in their profile. In the catalog now — ${p}. The total depends on floor area and the checks you need.`
          : "Each specialist lists prices in their profile. The total depends on floor area and whether instrument measurements are needed.",
      faq: [
        {
          q: "Why inspect a new flat before accepting it?",
          a: "An engineer finds defects that are hard to spot yourself: uneven walls and screed, cracks, window, waterproofing and wiring issues. You can hand the defect list to the developer before signing.",
        },
        {
          q: "Does NomerOk take a commission?",
          a: "No. You deal with the specialist directly and pay only them.",
        },
      ],
    },
    ka: {
      title: "ტექზედამხედველობა და ბინის მიღება ბათუმში — ინჟინრები, ფასები",
      description:
        "ტექზედამხედველობა ბათუმში: ბინის მიღება დეველოპერისგან, შემოწმება ყიდვამდე, შენობების კვლევა და რემონტის კონტროლი. ფასები და პირდაპირი კონტაქტი.",
      h1: "ტექზედამხედველობა და ბინის მიღება ბათუმში",
      lead: "ინჟინრები, რომლებიც შეამოწმებენ ბინას ყიდვამდე ან დეველოპერისგან მიღებისას, იპოვიან ფარულ დეფექტებს და გააკონტროლებენ რემონტს. დაუკავშირდით პირდაპირ ან დატოვეთ განაცხადი.",
      servicesTitle: "რაში დაგეხმარებიან",
      services: [
        "ბინის მიღება დეველოპერისგან",
        "ბინის ან სახლის შემოწმება ყიდვამდე",
        "რემონტისა და მშენებლობის ტექზედამხედველობა",
        "კონსტრუქციების კვლევა: ბეტონი, არმატურა, ბზარები",
        "თერმოვიზიური გადაღება",
        "ჰიდროიზოლაციის, ტენიანობის და ვენტილაციის შემოწმება",
        "დასკვნა ფოტოებით და დეფექტების სიით",
      ],
      chooseTitle: "როგორ ავირჩიოთ სპეციალისტი",
      choose: [
        "ჰკითხეთ, რა ხელსაწყოებით მუშაობს და რა იქნება დასკვნაში.",
        "ნახეთ პროფილში განათლება და განყოფილება „დოკუმენტები“ — დოკუმენტებს თავად სპეციალისტი ტვირთავს.",
        "შემოწმება მიღების აქტის ხელმოწერამდე დაგეგმეთ.",
        "ფასი წინასწარ დააზუსტეთ: ის ფართობზე და შემოწმებების მოცულობაზეა დამოკიდებული.",
      ],
      priceQ: "რა ღირს ბინის მიღება ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული სპეციალისტი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. საბოლოო ფასი ფართობზეა დამოკიდებული.`
          : "თითოეული სპეციალისტი ფასებს პროფილში უთითებს. საბოლოო ფასი ფართობზე და შემოწმებების მოცულობაზეა დამოკიდებული.",
      faq: [
        {
          q: "რატომ არის საჭირო ბინის მიღება სპეციალისტთან ერთად?",
          a: "ინჟინერი პოულობს დეფექტებს, რომლებსაც თავად ძნელად შეამჩნევთ. დეფექტების სია შეგიძლიათ დეველოპერს გადასცეთ აქტის ხელმოწერამდე.",
        },
        {
          q: "იღებს თუ არა NomerOk საკომისიოს?",
          a: "არა. სპეციალისტს პირდაპირ უთანხმდებით და მხოლოდ მას უხდით.",
        },
      ],
    },
  },
  electrician: {
    ru: {
      title: "Электрики в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Электрики Батуми с подтверждёнными номерами: фото работ, цены и настоящие отзывы. Звоните мастеру напрямую или оставьте заявку — свободные электрики откликнутся сами.",
      h1: "Электрики в Батуми",
      lead: "Номера электриков, подтверждённые через Telegram: фото работ, цены и настоящие отзывы. Звоните напрямую — или оставьте заявку, и свободные мастера откликнутся сами.",
      servicesTitle: "С чем помогут электрики",
      services: [
        "Установка и перенос розеток и выключателей",
        "Монтаж люстр, светильников и подсветки",
        "Замена проводки в квартире или доме",
        "Сборка и ремонт электрощита",
        "Установка автоматов и УЗО",
        "Поиск и устранение неисправностей",
        "Подключение электроплиты, духовки и бойлера",
      ],
      chooseTitle: "Как выбрать электрика",
      choose: [
        "Смотрите фото работ в профиле — по ним видно, аккуратно ли уложены кабели и собран щит.",
        "Обратите внимание на отметку «Номер подтверждён»: мастер подтвердил номер через Telegram.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Работу в щите и замену проводки доверяйте только электрику, а не «мастеру на все руки». Спросите об опыте; дипломы и сертификаты можно посмотреть в разделе «Документы» профиля или попросить показать.",
        "Пропал свет или что-то искрит — оставьте заявку: её сразу получат все электрики каталога.",
      ],
      priceQ: "Сколько стоит вызов электрика в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый мастер указывает цены в своём профиле. Сейчас в каталоге — ${p}. Точную стоимость электрик называет, когда увидит объём работы.`
          : "Каждый мастер указывает цены в своём профиле. Точную стоимость электрик называет, когда увидит объём работы, — спросите цену до начала.",
      faq: [
        {
          q: "Можно вызвать электрика срочно?",
          a: "Да. Оставьте заявку и отметьте, что срочно, — её получат все электрики каталога в Telegram, свободные сами вам позвонят. Если пахнет гарью или искрит, до приезда мастера отключите автомат в щите.",
        },
        {
          q: "На каких языках говорят электрики?",
          a: "Языки общения указаны в профиле каждого мастера. Выберите того, с кем вам удобно объясниться: на русском, грузинском или английском.",
        },
      ],
    },
    en: {
      title: "Electricians in Batumi — prices, reviews, direct contacts",
      description:
        "Electricians in Batumi with verified phone numbers: work photos, prices and real reviews. Call an electrician directly or post a request and available electricians will contact you.",
      h1: "Electricians in Batumi",
      lead: "Electricians' numbers verified via Telegram, with work photos, prices and real reviews. Call directly — or post a request and available electricians will get back to you.",
      servicesTitle: "What electricians can help with",
      services: [
        "Installing and moving sockets and switches",
        "Fitting chandeliers, lights and LED strips",
        "Rewiring an apartment or house",
        "Building and repairing the fuse board",
        "Installing circuit breakers and RCDs",
        "Finding and fixing faults",
        "Connecting electric stoves, ovens and water heaters",
      ],
      chooseTitle: "How to choose an electrician",
      choose: [
        "Look at work photos in the profile — you can see how neatly cables are laid and panels are built.",
        "Check the “Number verified” badge — the number was confirmed via Telegram.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Leave fuse board work and rewiring to a real electrician, not a general handyman. Ask about experience; diplomas and certificates can be found in the profile’s “Documents” section, or ask to see them.",
        "Power out or something sparking? Post a request — every electrician in the catalogue gets it at once.",
      ],
      priceQ: "How much does an electrician cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each electrician lists prices in their profile. Right now the catalogue shows ${p}. The final price depends on the scope of work.`
          : "Each electrician lists prices in their profile. The final price depends on the scope of work — ask before work starts.",
      faq: [
        {
          q: "Can I get an electrician urgently?",
          a: "Yes. Post a request and mark it urgent — every electrician in the catalogue gets it in Telegram, and those who are free will call you. If you smell burning or see sparks, switch off the breaker until they arrive.",
        },
        {
          q: "Does NomerOk take a commission?",
          a: "No. You deal with the electrician directly and pay only them — the service charges clients nothing.",
        },
      ],
    },
    ka: {
      title: "ელექტრიკოსები ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბათუმის ელექტრიკოსები დადასტურებული ნომრებით: სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "ელექტრიკოსები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი ელექტრიკოსები თავად დაგიკავშირდებიან.",
      servicesTitle: "რაში დაგეხმარებათ ელექტრიკოსი",
      services: [
        "როზეტების და ჩამრთველების მონტაჟი",
        "ჭაღების და სანათების დაკიდება",
        "ელექტროგაყვანილობის შეცვლა",
        "ელექტროფარის აწყობა და შეკეთება",
        "ავტომატური ამომრთველების მონტაჟი",
        "დაზიანების პოვნა და აღმოფხვრა",
        "ელექტროქურის, ღუმელის და წყლის გამაცხელებლის მიერთება",
      ],
      chooseTitle: "როგორ ავირჩიოთ ელექტრიკოსი",
      choose: [
        "ნახეთ სამუშაოების ფოტოები პროფილში — ჩანს, რამდენად სუფთად მუშაობს ხელოსანი.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "ელექტროფარზე და გაყვანილობაზე მუშაობა მხოლოდ ელექტრიკოსს მიანდეთ. ჰკითხეთ გამოცდილების შესახებ; დიპლომები და სერტიფიკატები შეგიძლიათ ნახოთ პროფილის განყოფილებაში „დოკუმენტები“.",
        "დენი გაითიშა ან რაღაც ნაპერწკლებს ყრის? დატოვეთ განაცხადი — მას ყველა ელექტრიკოსი მიიღებს.",
      ],
      priceQ: "რა ღირს ელექტრიკოსის გამოძახება ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული ხელოსანი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. ზუსტი ფასი სამუშაოს მოცულობაზეა დამოკიდებული.`
          : "თითოეული ხელოსანი ფასებს პროფილში უთითებს. ზუსტი ფასი სამუშაოს მოცულობაზეა დამოკიდებული — ჰკითხეთ დაწყებამდე.",
      faq: [
        {
          q: "შეიძლება ელექტრიკოსის სასწრაფოდ გამოძახება?",
          a: "დიახ. დატოვეთ განაცხადი და მიუთითეთ, რომ სასწრაფოა — მას ყველა ელექტრიკოსი მიიღებს Telegram-ში. თუ დამწვრის სუნია, ხელოსნის მოსვლამდე ფარში ავტომატი გამორთეთ.",
        },
        {
          q: "რა ენებზე საუბრობენ ელექტრიკოსები?",
          a: "თითოეული ხელოსნის პროფილში მითითებულია, რა ენებზე საუბრობს. აირჩიეთ ის, ვისთანაც გაგიადვილდებათ საუბარი.",
        },
      ],
    },
  },

  repair: {
    ru: {
      title: "Ремонт и отделка в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Мастера по ремонту и отделке в Батуми с подтверждёнными номерами: фото готовых объектов, цены и настоящие отзывы. Звоните напрямую или оставьте заявку.",
      h1: "Ремонт и отделка в Батуми",
      lead: "Мастера по ремонту с номерами, подтверждёнными через Telegram: фото готовых работ, цены и настоящие отзывы. Звоните напрямую — или оставьте заявку, и свободные мастера откликнутся сами.",
      servicesTitle: "Какие работы делают мастера",
      services: [
        "Ремонт квартиры под ключ",
        "Косметический ремонт",
        "Штукатурка и шпаклёвка стен",
        "Покраска стен и потолков",
        "Укладка плитки",
        "Укладка ламината и паркета",
        "Гипсокартон и натяжные потолки",
        "Ремонт ванной комнаты",
      ],
      chooseTitle: "Как выбрать мастера по ремонту",
      choose: [
        "Смотрите фото готовых объектов в профиле — особенно углы, стыки плитки и ровность стен.",
        "Обратите внимание на отметку «Номер подтверждён»: мастер подтвердил номер через Telegram.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "До начала работ договоритесь о смете, этапах и сроках, а также о том, кто покупает материалы. Платите по этапам, а не всю сумму вперёд.",
        "Опишите объект в заявке, приложите фото — её получат все мастера по ремонту, и вы сравните предложения.",
      ],
      priceQ: "Сколько стоит ремонт квартиры в Батуми?",
      priceA: (p) =>
        p
          ? `Мастера указывают цены в своих профилях. Сейчас в каталоге — ${p}. Итоговая стоимость зависит от площади, состояния помещения и материалов, поэтому смету составляют после осмотра.`
          : "Мастера указывают цены в своих профилях. Итоговая стоимость зависит от площади, состояния помещения и материалов, поэтому смету составляют после осмотра.",
      faq: [
        {
          q: "Можно найти мастера на отдельную работу, а не на весь ремонт?",
          a: "Да. Многие берут отдельные работы: только плитку, покраску или потолки. Напишите в заявке, что именно нужно сделать.",
        },
        {
          q: "Сервис берёт процент с ремонта?",
          a: "Нет. Вы договариваетесь с мастером напрямую и платите только ему — NomerOk не берёт комиссию и не делает наценку.",
        },
      ],
    },
    en: {
      title: "Renovation in Batumi — prices, reviews, direct contacts",
      description:
        "Renovation and finishing specialists in Batumi with verified phone numbers: photos of finished projects, prices and real reviews. Call directly or post a request.",
      h1: "Renovation in Batumi",
      lead: "Renovation specialists with numbers verified via Telegram, photos of finished work, prices and real reviews. Call directly — or post a request and available specialists will get back to you.",
      servicesTitle: "What renovation specialists do",
      services: [
        "Full turnkey apartment renovation",
        "Cosmetic refresh",
        "Plastering and skimming walls",
        "Painting walls and ceilings",
        "Tiling",
        "Laying laminate and parquet",
        "Drywall and stretch ceilings",
        "Bathroom renovation",
      ],
      chooseTitle: "How to choose a renovation specialist",
      choose: [
        "Look at photos of finished projects — pay attention to corners, tile joints and how flat the walls are.",
        "Check the “Number verified” badge — the number was confirmed via Telegram.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Before starting, agree on an estimate, stages, deadlines and who buys the materials. Pay stage by stage, not everything upfront.",
        "Describe the job in a request and add photos — every renovation specialist gets it, and you can compare offers.",
      ],
      priceQ: "How much does renovation cost in Batumi?",
      priceA: (p) =>
        p
          ? `Specialists list prices in their profiles. Right now the catalogue shows ${p}. The total depends on the area, condition and materials, so the estimate is made after inspection.`
          : "Specialists list prices in their profiles. The total depends on the area, condition and materials, so the estimate is made after inspection.",
      faq: [
        {
          q: "Can I hire someone for a single job rather than a full renovation?",
          a: "Yes. Many take separate jobs — just tiling, painting or ceilings. Say exactly what you need in your request.",
        },
        {
          q: "Do specialists speak English or Russian?",
          a: "Each profile lists the languages the specialist speaks. Choose someone you can easily discuss the details with.",
        },
      ],
    },
    ka: {
      title: "რემონტი და მოპირკეთება ბათუმში — ფასები, შეფასებები, კონტაქტი",
      description:
        "რემონტის ხელოსნები ბათუმში დადასტურებული ნომრებით: დასრულებული სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "რემონტი და მოპირკეთება ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, დასრულებული სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი ხელოსნები თავად დაგიკავშირდებიან.",
      servicesTitle: "რა სამუშაოებს ასრულებენ ხელოსნები",
      services: [
        "ბინის სრული რემონტი",
        "კოსმეტიკური რემონტი",
        "კედლების ბათქაში და შპაკლი",
        "კედლების და ჭერის შეღებვა",
        "ფილის დაგება",
        "ლამინატის და პარკეტის დაგება",
        "თაბაშირ-მუყაო და გადაჭიმული ჭერი",
        "სააბაზანოს რემონტი",
      ],
      chooseTitle: "როგორ ავირჩიოთ რემონტის ხელოსანი",
      choose: [
        "ნახეთ დასრულებული სამუშაოების ფოტოები — მიაქციეთ ყურადღება კუთხეებს, ფილის ნაკერებს და კედლების სისწორეს.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "დაწყებამდე შეათანხმეთ ხარჯთაღრიცხვა, ეტაპები, ვადები და ვინ ყიდულობს მასალებს. გადაიხადეთ ეტაპობრივად, არა მთელი თანხა წინასწარ.",
        "აღწერეთ სამუშაო განაცხადში და დაურთეთ ფოტოები — მას ყველა ხელოსანი მიიღებს და შეძლებთ შეთავაზებების შედარებას.",
      ],
      priceQ: "რა ღირს ბინის რემონტი ბათუმში?",
      priceA: (p) =>
        p
          ? `ხელოსნები ფასებს პროფილში უთითებენ. ახლა კატალოგში — ${p}. საბოლოო ფასი ფართზე, ბინის მდგომარეობაზე და მასალებზეა დამოკიდებული, ამიტომ ხარჯთაღრიცხვა დათვალიერების შემდეგ დგება.`
          : "ხელოსნები ფასებს პროფილში უთითებენ. საბოლოო ფასი ფართზე, ბინის მდგომარეობაზე და მასალებზეა დამოკიდებული, ამიტომ ხარჯთაღრიცხვა დათვალიერების შემდეგ დგება.",
      faq: [
        {
          q: "შეიძლება ხელოსნის პოვნა ცალკე სამუშაოზე?",
          a: "დიახ. ბევრი ცალკე სამუშაოსაც იღებს — მხოლოდ ფილას, შეღებვას ან ჭერს. განაცხადში დაწერეთ, რა გჭირდებათ.",
        },
        {
          q: "NomerOk იღებს საკომისიოს?",
          a: "არა. ხელოსანთან პირდაპირ თანხმდებით და მხოლოდ მას უხდით.",
        },
      ],
    },
  },

  handyman: {
    ru: {
      title: "Мастер на час в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Мастера на час в Батуми с подтверждёнными номерами: фото работ, цены и настоящие отзывы. Звоните напрямую или оставьте заявку — свободные мастера откликнутся сами.",
      h1: "Мастер на час в Батуми",
      lead: "Номера мастеров на час, подтверждённые через Telegram: фото работ, цены и настоящие отзывы. Звоните напрямую — или оставьте заявку, и свободные мастера откликнутся сами.",
      servicesTitle: "С чем поможет мастер на час",
      services: [
        "Сборка и ремонт мебели",
        "Навеска полок, карнизов, картин и зеркал",
        "Установка телевизора на стену",
        "Регулировка и ремонт дверей и замков",
        "Мелкий ремонт в квартире",
        "Замена ручек, петель и фурнитуры",
        "Установка сушилок, крючков и держателей",
      ],
      chooseTitle: "Как выбрать мастера на час",
      choose: [
        "Смотрите фото работ в профиле — видно, какие задачи мастер уже делал.",
        "Обратите внимание на отметку «Номер подтверждён»: мастер подтвердил номер через Telegram.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Составьте список всех дел сразу и уточните, есть ли у мастера свой инструмент и минимальная оплата за выезд.",
        "Опишите задачи в заявке — её получат все мастера на час, и свободные откликнутся.",
      ],
      priceQ: "Сколько стоит мастер на час в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый мастер указывает цены в своём профиле. Сейчас в каталоге — ${p}. Итог зависит от количества и сложности задач.`
          : "Каждый мастер указывает цены в своём профиле. Итог зависит от количества и сложности задач — уточните цену заранее.",
      faq: [
        {
          q: "Мастер на час займётся электрикой или сантехникой?",
          a: "Мелкие задачи — да, если мастер указал это в профиле. Но работу в электрощите, замену проводки и труб лучше доверить профильному электрику или сантехнику.",
        },
        {
          q: "Мастера говорят по-русски?",
          a: "В профиле каждого мастера указаны языки общения. Выберите того, с кем вам удобно договориться.",
        },
      ],
    },
    en: {
      title: "Handyman in Batumi — prices, reviews, direct contacts",
      description:
        "Handymen in Batumi with verified phone numbers: work photos, prices and real reviews. Call a handyman directly or post a request and available handymen will contact you.",
      h1: "Handyman in Batumi",
      lead: "Handymen's numbers verified via Telegram, with work photos, prices and real reviews. Call directly — or post a request and available handymen will get back to you.",
      servicesTitle: "What a handyman can help with",
      services: [
        "Assembling and repairing furniture",
        "Hanging shelves, curtain rails, pictures and mirrors",
        "Wall-mounting a TV",
        "Adjusting and repairing doors and locks",
        "Small repairs around the apartment",
        "Replacing handles, hinges and fittings",
        "Fitting drying racks, hooks and holders",
      ],
      chooseTitle: "How to choose a handyman",
      choose: [
        "Look at work photos in the profile — you can see what jobs the handyman has done.",
        "Check the “Number verified” badge — the number was confirmed via Telegram.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Make a list of all your jobs at once and ask whether they bring their own tools and if there is a minimum call-out charge.",
        "Describe your jobs in a request — every handyman in the catalogue gets it, and free ones will respond.",
      ],
      priceQ: "How much does a handyman cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each handyman lists prices in their profile. Right now the catalogue shows ${p}. The total depends on how many jobs there are and how complex they are.`
          : "Each handyman lists prices in their profile. The total depends on how many jobs there are and how complex they are — ask in advance.",
      faq: [
        {
          q: "Can a handyman do electrical or plumbing work?",
          a: "Small jobs — yes, if the profile says so. But fuse board work, rewiring and pipe replacement are better left to a dedicated electrician or plumber.",
        },
        {
          q: "Does NomerOk charge a fee?",
          a: "No. You agree everything with the handyman directly; clients never pay the service.",
        },
      ],
    },
    ka: {
      title: "ხელოსანი საათობრივად ბათუმში — ფასები, შეფასებები, კონტაქტი",
      description:
        "ხელოსნები საათობრივად ბათუმში დადასტურებული ნომრებით: სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "ხელოსანი საათობრივად ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი ხელოსნები თავად დაგიკავშირდებიან.",
      servicesTitle: "რაში დაგეხმარებათ ხელოსანი",
      services: [
        "ავეჯის აწყობა და შეკეთება",
        "თაროების, კარნიზების, სურათების და სარკეების დაკიდება",
        "ტელევიზორის კედელზე დამაგრება",
        "კარების და საკეტების რეგულირება და შეკეთება",
        "წვრილმანი შეკეთება ბინაში",
        "სახელურების, ანჯამების და ფურნიტურის გამოცვლა",
        "საშრობების, კაკვების და სამაგრების დამონტაჟება",
      ],
      chooseTitle: "როგორ ავირჩიოთ ხელოსანი",
      choose: [
        "ნახეთ სამუშაოების ფოტოები პროფილში — ჩანს, რა სამუშაოები შეუსრულებია ხელოსანს.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "ყველა საქმე ერთად ჩამოწერეთ და ჰკითხეთ, აქვს თუ არა ხელოსანს საკუთარი ხელსაწყოები და რა არის მინიმალური ფასი.",
        "აღწერეთ საქმეები განაცხადში — მას ყველა ხელოსანი მიიღებს და თავისუფლები გიპასუხებენ.",
      ],
      priceQ: "რა ღირს ხელოსანი საათობრივად ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული ხელოსანი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. საბოლოო ფასი საქმეების რაოდენობაზე და სირთულეზეა დამოკიდებული.`
          : "თითოეული ხელოსანი ფასებს პროფილში უთითებს. საბოლოო ფასი საქმეების რაოდენობაზე და სირთულეზეა დამოკიდებული — წინასწარ ჰკითხეთ.",
      faq: [
        {
          q: "ხელოსანი ელექტროობას ან სანტექნიკას გააკეთებს?",
          a: "წვრილმან საქმეებს — კი, თუ პროფილში წერია. ელექტროფარზე, გაყვანილობაზე და მილებზე მუშაობა კი ჯობს ელექტრიკოსს ან სანტექნიკოსს მიანდოთ.",
        },
        {
          q: "NomerOk იღებს საკომისიოს?",
          a: "არა. ხელოსანთან პირდაპირ თანხმდებით, კლიენტები სერვისს არაფერს უხდიან.",
        },
      ],
    },
  },

  aircon: {
    ru: {
      title: "Кондиционеры в Батуми — установка, ремонт, отзывы, цены",
      description:
        "Мастера по кондиционерам в Батуми с подтверждёнными номерами: установка, чистка и ремонт, фото работ, цены и настоящие отзывы. Звоните напрямую или оставьте заявку.",
      h1: "Установка и ремонт кондиционеров в Батуми",
      lead: "Номера мастеров по кондиционерам, подтверждённые через Telegram: фото работ, цены и настоящие отзывы. Звоните напрямую — или оставьте заявку, и свободные мастера откликнутся сами.",
      servicesTitle: "С чем помогут мастера",
      services: [
        "Установка сплит-систем",
        "Чистка и обслуживание кондиционеров",
        "Заправка фреоном",
        "Диагностика и ремонт",
        "Демонтаж и перенос кондиционера",
        "Устранение протечек из внутреннего блока",
        "Установка мульти-сплит систем",
      ],
      chooseTitle: "Как выбрать мастера по кондиционерам",
      choose: [
        "Смотрите фото работ в профиле — видно, как аккуратно проложена трасса и закреплён наружный блок.",
        "Обратите внимание на отметку «Номер подтверждён»: мастер подтвердил номер через Telegram.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "При установке спросите, вакуумирует ли мастер систему перед запуском, что входит в цену (длина трассы, кронштейны) и где будет стоять наружный блок.",
        "Кондиционер не холодит или течёт — оставьте заявку, её сразу получат все мастера по кондиционерам.",
      ],
      priceQ: "Сколько стоит установка кондиционера в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый мастер указывает цены в своём профиле. Сейчас в каталоге — ${p}. Итоговая стоимость зависит от мощности кондиционера, длины трассы и того, как крепится наружный блок.`
          : "Каждый мастер указывает цены в своём профиле. Итоговая стоимость зависит от мощности кондиционера, длины трассы и того, как крепится наружный блок.",
      faq: [
        {
          q: "Как часто нужно чистить кондиционер?",
          a: "Обычно — хотя бы раз в год, лучше перед сезоном. Если кондиционер работает постоянно или появился неприятный запах, чистку стоит сделать чаще.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Сервис бесплатный для клиентов: вы договариваетесь с мастером напрямую и платите только ему.",
        },
      ],
    },
    en: {
      title: "Air conditioning in Batumi — installation, repair, reviews",
      description:
        "Air conditioning specialists in Batumi with verified phone numbers: installation, cleaning and repair, work photos, prices and real reviews. Call directly or post a request.",
      h1: "Air conditioner installation and repair in Batumi",
      lead: "AC specialists' numbers verified via Telegram, with work photos, prices and real reviews. Call directly — or post a request and available specialists will get back to you.",
      servicesTitle: "What AC specialists can help with",
      services: [
        "Installing split systems",
        "Cleaning and servicing air conditioners",
        "Refrigerant recharge",
        "Diagnostics and repair",
        "Removing and relocating units",
        "Fixing leaks from the indoor unit",
        "Installing multi-split systems",
      ],
      chooseTitle: "How to choose an AC specialist",
      choose: [
        "Look at work photos in the profile — you can see how neatly pipes are routed and the outdoor unit is mounted.",
        "Check the “Number verified” badge — the number was confirmed via Telegram.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "For installation, ask whether they vacuum the system before start-up, what the price includes (pipe length, brackets) and where the outdoor unit will go.",
        "AC not cooling or leaking? Post a request — every AC specialist in the catalogue gets it at once.",
      ],
      priceQ: "How much does AC installation cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each specialist lists prices in their profile. Right now the catalogue shows ${p}. The total depends on the unit's capacity, pipe length and how the outdoor unit is mounted.`
          : "Each specialist lists prices in their profile. The total depends on the unit's capacity, pipe length and how the outdoor unit is mounted.",
      faq: [
        {
          q: "How often should an air conditioner be cleaned?",
          a: "Usually at least once a year, ideally before the season. If it runs constantly or starts to smell, clean it more often.",
        },
        {
          q: "Do AC specialists speak English or Russian?",
          a: "Each profile lists the languages the specialist speaks. Many speak Georgian, Russian and English.",
        },
      ],
    },
    ka: {
      title: "კონდიციონერები ბათუმში — მონტაჟი, შეკეთება, შეფასებები",
      description:
        "კონდიციონერების ხელოსნები ბათუმში დადასტურებული ნომრებით: მონტაჟი, წმენდა და შეკეთება, ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ ან დატოვეთ განაცხადი.",
      h1: "კონდიციონერების მონტაჟი და შეკეთება ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი ხელოსნები თავად დაგიკავშირდებიან.",
      servicesTitle: "რაში დაგეხმარებიან ხელოსნები",
      services: [
        "სპლიტ-სისტემების მონტაჟი",
        "კონდიციონერის წმენდა და მომსახურება",
        "ფრეონით შევსება",
        "დიაგნოსტიკა და შეკეთება",
        "კონდიციონერის დემონტაჟი და გადატანა",
        "შიდა ბლოკიდან წყლის ჟონვის აღმოფხვრა",
        "მულტი-სპლიტ სისტემების მონტაჟი",
      ],
      chooseTitle: "როგორ ავირჩიოთ კონდიციონერების ხელოსანი",
      choose: [
        "ნახეთ სამუშაოების ფოტოები პროფილში — ჩანს, რამდენად სუფთად არის გაყვანილი მილები და დამაგრებული გარე ბლოკი.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "მონტაჟისას ჰკითხეთ, აკეთებს თუ არა ვაკუუმირებას ჩართვამდე, რა შედის ფასში და სად დაიდგმება გარე ბლოკი.",
        "კონდიციონერი არ აგრილებს ან წყალი ჟონავს? დატოვეთ განაცხადი — მას ყველა ხელოსანი მიიღებს.",
      ],
      priceQ: "რა ღირს კონდიციონერის მონტაჟი ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული ხელოსანი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. საბოლოო ფასი კონდიციონერის სიმძლავრეზე, მილების სიგრძეზე და გარე ბლოკის დამაგრებაზეა დამოკიდებული.`
          : "თითოეული ხელოსანი ფასებს პროფილში უთითებს. საბოლოო ფასი კონდიციონერის სიმძლავრეზე, მილების სიგრძეზე და გარე ბლოკის დამაგრებაზეა დამოკიდებული.",
      faq: [
        {
          q: "რამდენად ხშირად უნდა გაიწმინდოს კონდიციონერი?",
          a: "ჩვეულებრივ წელიწადში ერთხელ მაინც, სჯობს სეზონის დაწყებამდე. თუ ხშირად მუშაობს ან უსიამოვნო სუნი გაჩნდა — უფრო ხშირად.",
        },
        {
          q: "NomerOk იღებს საკომისიოს?",
          a: "არა. სერვისი კლიენტებისთვის უფასოა — ხელოსანთან პირდაპირ თანხმდებით.",
        },
      ],
    },
  },

  appliances: {
    ru: {
      title: "Ремонт техники в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Мастера по ремонту бытовой техники в Батуми с подтверждёнными номерами: фото работ, цены и настоящие отзывы. Звоните напрямую или оставьте заявку — мастера откликнутся.",
      h1: "Ремонт техники в Батуми",
      lead: "Номера мастеров по ремонту техники, подтверждённые через Telegram: фото работ, цены и настоящие отзывы. Звоните напрямую — или оставьте заявку, и свободные мастера откликнутся сами.",
      servicesTitle: "Что ремонтируют мастера",
      services: [
        "Стиральные машины",
        "Холодильники и морозильники",
        "Посудомоечные машины",
        "Электроплиты и духовки",
        "Бойлеры и водонагреватели",
        "Микроволновки и мелкая техника",
        "Диагностика на дому",
      ],
      chooseTitle: "Как выбрать мастера по ремонту техники",
      choose: [
        "Смотрите фото работ и описание в профиле — видно, с какой техникой и брендами мастер работает.",
        "Обратите внимание на отметку «Номер подтверждён»: мастер подтвердил номер через Telegram.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Сразу назовите марку, модель и что именно не так (код ошибки, шум, не греет). Спросите, платная ли диагностика, если от ремонта откажетесь, и даёт ли мастер гарантию на работу.",
        "Опишите поломку в заявке — её получат все мастера по ремонту техники, свободные откликнутся.",
      ],
      priceQ: "Сколько стоит ремонт бытовой техники в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый мастер указывает цены в своём профиле. Сейчас в каталоге — ${p}. Точная цена зависит от поломки и стоимости деталей — её называют после диагностики.`
          : "Каждый мастер указывает цены в своём профиле. Точная цена зависит от поломки и стоимости деталей — её называют после диагностики.",
      faq: [
        {
          q: "Мастер приедет на дом?",
          a: "Большинство крупной техники ремонтируют на месте. Выезжает ли мастер и в какие районы — указано в его профиле.",
        },
        {
          q: "На каких языках говорят мастера?",
          a: "Языки общения указаны в профиле каждого мастера — русский, грузинский, английский. Выберите, с кем вам удобно.",
        },
        {
          q: "Нужно ли платить сервису?",
          a: "Нет. Вы платите только мастеру за его работу, NomerOk ничего не берёт с клиентов.",
        },
      ],
    },
    en: {
      title: "Appliance repair in Batumi — prices, reviews, direct contacts",
      description:
        "Appliance repair technicians in Batumi with verified phone numbers: work photos, prices and real reviews. Call directly or post a request and available technicians will contact you.",
      h1: "Appliance repair in Batumi",
      lead: "Appliance technicians' numbers verified via Telegram, with work photos, prices and real reviews. Call directly — or post a request and available technicians will get back to you.",
      servicesTitle: "What technicians repair",
      services: [
        "Washing machines",
        "Fridges and freezers",
        "Dishwashers",
        "Electric stoves and ovens",
        "Boilers and water heaters",
        "Microwaves and small appliances",
        "Home diagnostics",
      ],
      chooseTitle: "How to choose an appliance technician",
      choose: [
        "Look at work photos and the description in the profile — you can see which appliances and brands they handle.",
        "Check the “Number verified” badge — the number was confirmed via Telegram.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Give the brand, model and the problem right away (error code, noise, not heating). Ask whether diagnostics is paid if you decline the repair, and whether they guarantee their work.",
        "Describe the fault in a request — every appliance technician in the catalogue gets it, and free ones will respond.",
      ],
      priceQ: "How much does appliance repair cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each technician lists prices in their profile. Right now the catalogue shows ${p}. The exact price depends on the fault and spare parts and is given after diagnostics.`
          : "Each technician lists prices in their profile. The exact price depends on the fault and spare parts and is given after diagnostics.",
      faq: [
        {
          q: "Will the technician come to my home?",
          a: "Most large appliances are repaired on site. Whether a technician makes house calls, and to which areas, is shown in their profile.",
        },
        {
          q: "Does NomerOk charge a fee?",
          a: "No. You pay only the technician for their work; clients never pay the service.",
        },
      ],
    },
    ka: {
      title: "ტექნიკის შეკეთება ბათუმში — ფასები, შეფასებები, კონტაქტი",
      description:
        "საყოფაცხოვრებო ტექნიკის ხელოსნები ბათუმში დადასტურებული ნომრებით: სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "ტექნიკის შეკეთება ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი ხელოსნები თავად დაგიკავშირდებიან.",
      servicesTitle: "რას აკეთებენ ხელოსნები",
      services: [
        "სარეცხი მანქანები",
        "მაცივრები და საყინულეები",
        "ჭურჭლის სარეცხი მანქანები",
        "ელექტროქურები და ღუმელები",
        "წყლის გამაცხელებლები",
        "მიკროტალღური ღუმელები და მცირე ტექნიკა",
        "დიაგნოსტიკა ბინაზე",
      ],
      chooseTitle: "როგორ ავირჩიოთ ტექნიკის ხელოსანი",
      choose: [
        "ნახეთ სამუშაოების ფოტოები და აღწერა პროფილში — ჩანს, რა ტექნიკასა და ბრენდებზე მუშაობს ხელოსანი.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "თავიდანვე უთხარით მარკა, მოდელი და რა პრობლემაა. ჰკითხეთ, ფასიანია თუ არა დიაგნოსტიკა, თუ შეკეთებაზე უარს იტყვით, და აძლევს თუ არა გარანტიას.",
        "აღწერეთ დაზიანება განაცხადში — მას ყველა ხელოსანი მიიღებს და თავისუფლები გიპასუხებენ.",
      ],
      priceQ: "რა ღირს ტექნიკის შეკეთება ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული ხელოსანი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. ზუსტი ფასი დაზიანებაზე და ნაწილების ღირებულებაზეა დამოკიდებული და დიაგნოსტიკის შემდეგ ცხადდება.`
          : "თითოეული ხელოსანი ფასებს პროფილში უთითებს. ზუსტი ფასი დაზიანებაზე და ნაწილების ღირებულებაზეა დამოკიდებული და დიაგნოსტიკის შემდეგ ცხადდება.",
      faq: [
        {
          q: "ხელოსანი ბინაზე მოვა?",
          a: "დიდ ტექნიკას ძირითადად ადგილზე აკეთებენ. მოდის თუ არა ხელოსანი ბინაზე და რომელ უბნებში, პროფილშია მითითებული.",
        },
        {
          q: "NomerOk იღებს საკომისიოს?",
          a: "არა. სამუშაოს საფასურს მხოლოდ ხელოსანს უხდით, სერვისს არაფერს.",
        },
      ],
    },
  },

  cleaning: {
    ru: {
      title: "Уборка в Батуми — цены, отзывы, контакты напрямую",
      description:
        "Уборка квартир и домов в Батуми: специалисты с подтверждёнными номерами, фото работ, цены и настоящие отзывы. Звоните напрямую или оставьте заявку — свободные откликнутся.",
      h1: "Уборка в Батуми",
      lead: "Номера специалистов по уборке, подтверждённые через Telegram: фото работ, цены и настоящие отзывы. Звоните напрямую — или оставьте заявку, и свободные специалисты откликнутся сами.",
      servicesTitle: "Какую уборку заказывают",
      services: [
        "Регулярная уборка квартиры",
        "Генеральная уборка",
        "Уборка после ремонта",
        "Уборка квартиры между арендаторами",
        "Мытьё окон и балконов",
        "Химчистка диванов, ковров и матрасов",
        "Уборка офисов",
      ],
      chooseTitle: "Как выбрать специалиста по уборке",
      choose: [
        "Смотрите фото «до и после» в профиле — так проще понять качество работы.",
        "Обратите внимание на отметку «Номер подтверждён»: специалист подтвердил номер через Telegram.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Заранее согласуйте список того, что убрать (окна, духовка, холодильник, балкон), и кто привозит средства и инвентарь.",
        "Оставьте заявку с площадью и видом уборки — её получат все специалисты по уборке, свободные откликнутся.",
      ],
      priceQ: "Сколько стоит уборка квартиры в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый специалист указывает цены в своём профиле. Сейчас в каталоге — ${p}. Итог зависит от площади, вида уборки и дополнительных задач вроде окон.`
          : "Каждый специалист указывает цены в своём профиле. Итог зависит от площади, вида уборки и дополнительных задач вроде окон.",
      faq: [
        {
          q: "Можно заказать уборку к заезду гостей?",
          a: "Да. Напишите в заявке дату и время заезда — её получат все специалисты по уборке, и свободные на это время откликнутся.",
        },
        {
          q: "Специалисты говорят по-русски?",
          a: "Языки общения указаны в каждом профиле. Выберите того, с кем удобно обсудить детали.",
        },
      ],
    },
    en: {
      title: "Cleaning in Batumi — prices, reviews, direct contacts",
      description:
        "Apartment and house cleaning in Batumi: cleaners with verified phone numbers, work photos, prices and real reviews. Call directly or post a request and available cleaners will reply.",
      h1: "Cleaning in Batumi",
      lead: "Cleaners' numbers verified via Telegram, with work photos, prices and real reviews. Call directly — or post a request and available cleaners will get back to you.",
      servicesTitle: "Types of cleaning",
      services: [
        "Regular apartment cleaning",
        "Deep cleaning",
        "Post-renovation cleaning",
        "Cleaning between tenants",
        "Window and balcony cleaning",
        "Sofa, carpet and mattress cleaning",
        "Office cleaning",
      ],
      chooseTitle: "How to choose a cleaner",
      choose: [
        "Look at before-and-after photos in the profile — it's the easiest way to judge the quality.",
        "Check the “Number verified” badge — the number was confirmed via Telegram.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Agree in advance on a checklist (windows, oven, fridge, balcony) and on who brings the cleaning products and equipment.",
        "Post a request with the size of the place and the type of cleaning — every cleaner in the catalogue gets it.",
      ],
      priceQ: "How much does apartment cleaning cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each cleaner lists prices in their profile. Right now the catalogue shows ${p}. The total depends on the area, type of cleaning and extras like windows.`
          : "Each cleaner lists prices in their profile. The total depends on the area, type of cleaning and extras like windows.",
      faq: [
        {
          q: "Can I book cleaning before guests arrive?",
          a: "Yes. Put the check-in date and time in your request — every cleaner in the catalogue gets it, and those free at that time will respond.",
        },
        {
          q: "Does NomerOk take a commission?",
          a: "No. You arrange everything with the cleaner directly and pay only them.",
        },
      ],
    },
    ka: {
      title: "დალაგება ბათუმში — ფასები, შეფასებები, პირდაპირი კონტაქტი",
      description:
        "ბინების და სახლების დალაგება ბათუმში: დადასტურებული ნომრები, სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "დალაგება ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი სპეციალისტები თავად დაგიკავშირდებიან.",
      servicesTitle: "რა სახის დალაგება შეგიძლიათ შეუკვეთოთ",
      services: [
        "ბინის რეგულარული დალაგება",
        "გენერალური დალაგება",
        "დალაგება რემონტის შემდეგ",
        "დალაგება მდგმურების გამოცვლისას",
        "ფანჯრების და აივნების რეცხვა",
        "დივნების, ხალიჩების და ლეიბების ქიმწმენდა",
        "ოფისების დალაგება",
      ],
      chooseTitle: "როგორ ავირჩიოთ დამლაგებელი",
      choose: [
        "ნახეთ ფოტოები „მანამდე და მერე“ პროფილში — ასე უფრო ადვილად შეაფასებთ ხარისხს.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "წინასწარ შეათანხმეთ, რა უნდა დალაგდეს (ფანჯრები, ღუმელი, მაცივარი, აივანი) და ვის მოაქვს სარეცხი საშუალებები და ინვენტარი.",
        "დატოვეთ განაცხადი ფართის და დალაგების სახის მითითებით — მას ყველა დამლაგებელი მიიღებს.",
      ],
      priceQ: "რა ღირს ბინის დალაგება ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული სპეციალისტი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. საბოლოო ფასი ფართზე, დალაგების სახეზე და დამატებით სამუშაოებზეა დამოკიდებული.`
          : "თითოეული სპეციალისტი ფასებს პროფილში უთითებს. საბოლოო ფასი ფართზე, დალაგების სახეზე და დამატებით სამუშაოებზეა დამოკიდებული.",
      faq: [
        {
          q: "შეიძლება დალაგების შეკვეთა სტუმრების ჩამოსვლამდე?",
          a: "დიახ. განაცხადში მიუთითეთ თარიღი და დრო — მას ყველა დამლაგებელი მიიღებს და ამ დროს თავისუფლები გიპასუხებენ.",
        },
        {
          q: "NomerOk იღებს საკომისიოს?",
          a: "არა. სპეციალისტთან პირდაპირ თანხმდებით და მხოლოდ მას უხდით.",
        },
      ],
    },
  },

  moving: {
    ru: {
      title: "Переезд и грузчики в Батуми — цены, отзывы, контакты",
      description:
        "Грузчики и помощь с переездом в Батуми: подтверждённые номера, фото работ, цены и настоящие отзывы. Звоните напрямую или оставьте заявку — свободные откликнутся сами.",
      h1: "Переезд и грузчики в Батуми",
      lead: "Номера грузчиков и перевозчиков, подтверждённые через Telegram: фото работ, цены и настоящие отзывы. Звоните напрямую — или оставьте заявку, и свободные откликнутся сами.",
      servicesTitle: "С чем помогут при переезде",
      services: [
        "Квартирный переезд",
        "Офисный переезд",
        "Грузчики для погрузки и разгрузки",
        "Перевозка мебели и техники",
        "Упаковка вещей",
        "Разборка и сборка мебели",
        "Вывоз старой мебели и строительного мусора",
      ],
      chooseTitle: "Как выбрать грузчиков",
      choose: [
        "Смотрите фото в профиле — видно, какая машина и как упаковывают мебель.",
        "Обратите внимание на отметку «Номер подтверждён»: номер подтверждён через Telegram.",
        "Читайте отзывы — их оставляют только через Telegram, накрутить их нельзя.",
        "Заранее договоритесь о цене с учётом этажа, наличия лифта, упаковки и сборки мебели. Перечислите крупные вещи, чтобы не было доплат на месте.",
        "Оставьте заявку с датой, адресами и списком вещей — её получат все грузчики каталога.",
      ],
      priceQ: "Сколько стоят грузчики и переезд в Батуми?",
      priceA: (p) =>
        p
          ? `Каждый исполнитель указывает цены в своём профиле. Сейчас в каталоге — ${p}. Итог зависит от объёма вещей, этажа, лифта и расстояния.`
          : "Каждый исполнитель указывает цены в своём профиле. Итог зависит от объёма вещей, этажа, лифта и расстояния — договоритесь о цене заранее.",
      faq: [
        {
          q: "Грузчики приезжают со своей машиной?",
          a: "Зависит от исполнителя: одни работают с машиной, другие — только грузчиками. Это указано в профиле, а в заявке напишите, нужна ли машина.",
        },
        {
          q: "Можно найти грузчиков на сегодня?",
          a: "Да. Оставьте заявку и отметьте, что срочно, — её получат все грузчики каталога в Telegram, свободные сами позвонят.",
        },
        {
          q: "NomerOk берёт комиссию?",
          a: "Нет. Вы платите только исполнителю, сервис денег с клиентов не берёт.",
        },
      ],
    },
    en: {
      title: "Moving & movers in Batumi — prices, reviews, direct contacts",
      description:
        "Movers and moving help in Batumi with verified phone numbers: work photos, prices and real reviews. Call directly or post a request and available movers will contact you.",
      h1: "Moving & movers in Batumi",
      lead: "Movers' numbers verified via Telegram, with work photos, prices and real reviews. Call directly — or post a request and available movers will get back to you.",
      servicesTitle: "What movers can help with",
      services: [
        "Apartment moves",
        "Office moves",
        "Loading and unloading",
        "Transporting furniture and appliances",
        "Packing",
        "Taking apart and assembling furniture",
        "Removing old furniture and construction waste",
      ],
      chooseTitle: "How to choose movers",
      choose: [
        "Look at photos in the profile — you can see the vehicle and how furniture is packed.",
        "Check the “Number verified” badge — the number was confirmed via Telegram.",
        "Read reviews — they can only be left via Telegram, so they can't be faked.",
        "Agree on the price in advance, including floors, whether there is a lift, packing and furniture assembly. List large items so there are no surprise extras.",
        "Post a request with the date, addresses and a list of items — every mover in the catalogue gets it.",
      ],
      priceQ: "How much do movers cost in Batumi?",
      priceA: (p) =>
        p
          ? `Each mover lists prices in their profile. Right now the catalogue shows ${p}. The total depends on the volume, floors, lift and distance.`
          : "Each mover lists prices in their profile. The total depends on the volume, floors, lift and distance — agree on the price in advance.",
      faq: [
        {
          q: "Do movers come with their own vehicle?",
          a: "It depends: some work with a van or truck, others only do loading. The profile says which — mention in your request if you need a vehicle.",
        },
        {
          q: "Can I find movers for today?",
          a: "Yes. Post a request and mark it urgent — every mover in the catalogue gets it in Telegram, and those who are free will call you.",
        },
      ],
    },
    ka: {
      title: "გადაზიდვა და მტვირთავები ბათუმში — ფასები, შეფასებები",
      description:
        "მტვირთავები და გადაზიდვა ბათუმში დადასტურებული ნომრებით: სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ ან დატოვეთ განაცხადი.",
      h1: "გადაზიდვა და მტვირთავები ბათუმში",
      lead: "Telegram-ით დადასტურებული ნომრები, სამუშაოების ფოტოები, ფასები და ნამდვილი შეფასებები. დაურეკეთ პირდაპირ — ან დატოვეთ განაცხადი და თავისუფალი მტვირთავები თავად დაგიკავშირდებიან.",
      servicesTitle: "რაში დაგეხმარებიან გადაზიდვისას",
      services: [
        "ბინის გადაზიდვა",
        "ოფისის გადაზიდვა",
        "ტვირთის ჩატვირთვა და გადმოტვირთვა",
        "ავეჯის და ტექნიკის გადატანა",
        "ნივთების შეფუთვა",
        "ავეჯის დაშლა და აწყობა",
        "ძველი ავეჯის და სამშენებლო ნაგვის გატანა",
      ],
      chooseTitle: "როგორ ავირჩიოთ მტვირთავები",
      choose: [
        "ნახეთ ფოტოები პროფილში — ჩანს, როგორი მანქანაა და როგორ ფუთავენ ავეჯს.",
        "მიაქციეთ ყურადღება ნიშანს „ნომერი დადასტურებულია“.",
        "წაიკითხეთ შეფასებები — მათი დატოვება მხოლოდ Telegram-ით შეიძლება.",
        "ფასი წინასწარ შეათანხმეთ — სართულის, ლიფტის, შეფუთვის და ავეჯის აწყობის გათვალისწინებით. ჩამოთვალეთ დიდი ნივთები, რომ ადგილზე დამატებითი გადასახადი არ გაჩნდეს.",
        "დატოვეთ განაცხადი თარიღით, მისამართებით და ნივთების სიით — მას ყველა მტვირთავი მიიღებს.",
      ],
      priceQ: "რა ღირს მტვირთავები და გადაზიდვა ბათუმში?",
      priceA: (p) =>
        p
          ? `თითოეული შემსრულებელი ფასებს პროფილში უთითებს. ახლა კატალოგში — ${p}. საბოლოო ფასი ნივთების მოცულობაზე, სართულზე, ლიფტზე და მანძილზეა დამოკიდებული.`
          : "თითოეული შემსრულებელი ფასებს პროფილში უთითებს. საბოლოო ფასი ნივთების მოცულობაზე, სართულზე, ლიფტზე და მანძილზეა დამოკიდებული — წინასწარ შეათანხმეთ.",
      faq: [
        {
          q: "მტვირთავები საკუთარი მანქანით მოდიან?",
          a: "შემსრულებელზეა დამოკიდებული: ზოგი მანქანით მუშაობს, ზოგი — მხოლოდ მტვირთავად. ეს პროფილშია მითითებული; განაცხადში დაწერეთ, გჭირდებათ თუ არა მანქანა.",
        },
        {
          q: "NomerOk იღებს საკომისიოს?",
          a: "არა. მხოლოდ შემსრულებელს უხდით, სერვისი კლიენტებისგან ფულს არ იღებს.",
        },
      ],
    },
  },
};
