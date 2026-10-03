import type { Locale } from "./i18n/config";

/*
 * «Полезные телефоны Батуми»: экстренные службы, коммуналка, госучреждения, медицина.
 * Номера проверены вручную (осень 2026). Источники на странице не показываем — по решению владельца.
 */

type L = Record<Locale, string>;

export type PhoneItem = {
  name: L;
  note?: L;
  /** Номера: что показать и что набрать */
  numbers: { show: string; dial: string; label?: L }[];
};

export type PhoneSection = {
  id: string;
  icon: string;
  title: L;
  items: PhoneItem[];
  /** Подсказка «если проблема у вас дома — вот кто поможет» */
  help?: { text: L; cat: string }[];
};

const n = (show: string, label?: L) => ({ show, dial: show.replace(/[^\d+]/g, ""), label });

export const QUICK: { icon: string; label: L; show: string; dial: string }[] = [
  { icon: "🚨", label: { ru: "Экстренно", en: "Emergency", ka: "გადაუდებელი" }, show: "112", dial: "112" },
  { icon: "⚡", label: { ru: "Свет", en: "Electricity", ka: "დენი" }, show: "032 247 17 07", dial: "+995322471707" },
  { icon: "💧", label: { ru: "Вода", en: "Water", ka: "წყალი" }, show: "0422 24 00 00", dial: "+995422240000" },
  { icon: "🔥", label: { ru: "Газ", en: "Gas", ka: "გაზი" }, show: "16 114", dial: "16114" },
];

export const SECTIONS: PhoneSection[] = [
  {
    id: "emergency",
    icon: "🚨",
    title: { ru: "Экстренные службы", en: "Emergency", ka: "გადაუდებელი სამსახურები" },
    items: [
      {
        name: { ru: "Единый номер экстренных служб", en: "Emergency number", ka: "გადაუდებელი დახმარების ერთიანი ნომერი" },
        note: {
          ru: "Полиция, скорая и пожарные — один номер. Бесплатно, круглосуточно, с любого телефона. Операторы обычно говорят по-английски и по-русски.",
          en: "Police, ambulance and fire — one number. Free, 24/7, from any phone. Operators usually speak English and Russian.",
          ka: "პოლიცია, სასწრაფო და მეხანძრეები — ერთი ნომერი. უფასოა, 24/7, ნებისმიერი ტელეფონიდან.",
        },
        numbers: [n("112")],
      },
    ],
  },
  {
    id: "utilities",
    icon: "🏠",
    title: { ru: "Свет, вода, газ", en: "Electricity, water, gas", ka: "დენი, წყალი, გაზი" },
    items: [
      {
        name: { ru: "⚡ Электричество — Energo-Pro Georgia", en: "⚡ Electricity — Energo-Pro Georgia", ka: "⚡ ელექტროენერგია — ენერგო-პრო ჯორჯია" },
        note: {
          ru: "Отключения света, аварии на линии, вопросы по счётчику. Сервис-центр в Батуми: ул. Петре Багратиони, 103.",
          en: "Power outages, line faults, meter questions. Batumi service centre: 103 Petre Bagrationi St.",
          ka: "დენის გათიშვა, ავარია ხაზზე, მრიცხველი. ბათუმის სერვის-ცენტრი: პეტრე ბაგრატიონის ქ. 103.",
        },
        numbers: [n("+995 32 247 17 07", { ru: "горячая линия", en: "hotline", ka: "ცხელი ხაზი" })],
      },
      {
        name: { ru: "💧 Вода — Batumi Water", en: "💧 Water — Batumi Water", ka: "💧 წყალი — ბათუმის წყალი" },
        note: {
          ru: "Нет воды, прорыв трубы на улице, канализация. Офис: ул. Табукашвили, 19.",
          en: "No water, burst street pipe, sewage. Office: 19 Tabukashvili St.",
          ka: "წყალი არ არის, მილის გარღვევა, კანალიზაცია. ოფისი: ტაბუკაშვილის ქ. 19.",
        },
        numbers: [n("+995 422 24 00 00", { ru: "горячая линия", en: "hotline", ka: "ცხელი ხაზი" })],
      },
      {
        name: { ru: "🔥 Газ — SOCAR Georgia Gas", en: "🔥 Gas — SOCAR Georgia Gas", ka: "🔥 გაზი — სოკარ ჯორჯია გაზი" },
        note: {
          ru: "Запах газа — сразу звоните, не включайте свет и не пользуйтесь огнём. Сервис-центр в Батуми — на ул. Баку.",
          en: "Smell of gas — call at once, don't switch on lights or use fire. Batumi service centre is on Baku St.",
          ka: "გაზის სუნი — დაურეკეთ დაუყოვნებლივ, არ ჩართოთ შუქი. ბათუმის სერვის-ცენტრი — ბაქოს ქუჩაზე.",
        },
        numbers: [n("16 114", { ru: "аварийная и горячая линия", en: "emergency & hotline", ka: "ავარიული და ცხელი ხაზი" })],
      },
    ],
    help: [
      { cat: "electrician", text: { ru: "Свет есть у соседей, но не у вас? Это проводка — нужен электрик", en: "Neighbours have power but you don't? It's your wiring — call an electrician", ka: "მეზობლებს აქვთ დენი, თქვენ არა? საჭიროა ელექტრიკოსი" } },
      { cat: "plumber", text: { ru: "Течёт внутри квартиры — это к сантехнику", en: "Leak inside the flat — that's a plumber", ka: "ბინაში ჟონავს — საჭიროა სანტექნიკოსი" } },
      { cat: "appliances", text: { ru: "Сломался котёл, бойлер или плита", en: "Boiler, water heater or stove broke", ka: "გაფუჭდა ქვაბი, ბოილერი ან ქურა" } },
    ],
  },
  {
    id: "city",
    icon: "🏛",
    title: { ru: "Город и документы", en: "City & documents", ka: "ქალაქი და დოკუმენტები" },
    items: [
      {
        name: { ru: "Мэрия Батуми", en: "Batumi City Hall", ka: "ბათუმის მერია" },
        note: {
          ru: "Благоустройство, дворы, освещение улиц, мусор. Адрес: ул. Л. Асатиани, 25.",
          en: "Streets, yards, street lighting, rubbish. Address: 25 L. Asatiani St.",
          ka: "კეთილმოწყობა, ეზოები, გარე განათება, ნაგავი. მისამართი: ლ. ასათიანის ქ. 25.",
        },
        numbers: [
          n("0 800 000 810", { ru: "горячая линия, бесплатно", en: "hotline, free", ka: "ცხელი ხაზი, უფასო" }),
          n("+995 422 27 26 06", { ru: "приёмная", en: "reception", ka: "მისაღები" }),
        ],
      },
      {
        name: { ru: "Дом юстиции (Public Service Hall)", en: "Public Service Hall", ka: "იუსტიციის სახლი" },
        note: {
          ru: "Паспорта и ID, регистрация бизнеса и недвижимости, нотариальные справки, ВНЖ.",
          en: "Passports and ID, business and property registration, certificates, residence permits.",
          ka: "პასპორტი და ID, ბიზნესისა და უძრავი ქონების რეგისტრაცია, ცნობები, ბინადრობა.",
        },
        numbers: [n("+995 32 240 10 10", { ru: "единый колл-центр", en: "call centre", ka: "ცხელი ხაზი" })],
      },
    ],
  },
  {
    id: "health",
    icon: "🏥",
    title: { ru: "Медицина", en: "Health", ka: "მედიცინა" },
    items: [
      {
        name: { ru: "Скорая помощь", en: "Ambulance", ka: "სასწრაფო დახმარება" },
        note: { ru: "Вызов скорой — через единый номер.", en: "Call an ambulance via the single emergency number.", ka: "სასწრაფოს გამოძახება — ერთიანი ნომრით." },
        numbers: [n("112")],
      },
      {
        name: { ru: "Батумская республиканская клиническая больница", en: "Batumi Republican Clinical Hospital", ka: "ბათუმის რესპუბლიკური კლინიკური საავადმყოფო" },
        note: {
          ru: "Многопрофильная, для взрослых и детей, есть приёмное отделение. Адрес: ул. Т. Абусеридзе, 2.",
          en: "Multi-profile, adults and children, has an emergency room. Address: 2 T. Abuseridze St.",
          ka: "მრავალპროფილური, ზრდასრულები და ბავშვები, მიმღები განყოფილება. მისამართი: თ. აბუსერიძის ქ. 2.",
        },
        numbers: [n("+995 422 22 00 08"), n("+995 577 22 00 08")],
      },
      {
        name: { ru: "Горячая линия Минздрава", en: "Ministry of Health hotline", ka: "ჯანდაცვის სამინისტროს ცხელი ხაზი" },
        note: { ru: "Госпрограммы, страховка, права пациента.", en: "State programmes, insurance, patient rights.", ka: "სახელმწიფო პროგრამები, დაზღვევა, პაციენტის უფლებები." },
        numbers: [n("15 05")],
      },
      {
        name: { ru: "Центр контроля заболеваний", en: "Disease Control Centre (NCDC)", ka: "დაავადებათა კონტროლის ცენტრი" },
        note: { ru: "Прививки, инфекции, эпидемии.", en: "Vaccinations, infections, outbreaks.", ka: "ვაქცინაცია, ინფექციები." },
        numbers: [n("116 001")],
      },
    ],
  },
  {
    id: "transport",
    icon: "✈️",
    title: { ru: "Транспорт", en: "Transport", ka: "ტრანსპორტი" },
    items: [
      {
        name: { ru: "Аэропорт Батуми", en: "Batumi Airport", ka: "ბათუმის აეროპორტი" },
        note: { ru: "Справочная: рейсы, задержки, потерянный багаж.", en: "Information: flights, delays, lost luggage.", ka: "ინფორმაცია: რეისები, დაგვიანება, ბარგი." },
        numbers: [n("+995 422 235 100")],
      },
    ],
  },
];

export const PH: Record<Locale, { nav: string; title: string; h1: string; lead: string; quick: string; call: string; helpTitle: string; wrong: string; wrongLink: string }> = {
  ru: {
    nav: "Полезные телефоны",
    title: "Полезные телефоны Батуми: экстренные службы, свет, вода, газ, мэрия, больницы",
    h1: "Полезные телефоны Батуми",
    lead: "Экстренные службы, коммуналка, госучреждения и больницы — всё в одном месте. Нажмите на номер, чтобы позвонить.",
    quick: "Самое нужное",
    call: "Позвонить",
    helpTitle: "Проблема в квартире?",
    wrong: "Номер не отвечает или изменился?",
    wrongLink: "Напишите нам — исправим",
  },
  en: {
    nav: "Useful numbers",
    title: "Useful phone numbers in Batumi: emergency, electricity, water, gas, city hall, hospitals",
    h1: "Useful phone numbers in Batumi",
    lead: "Emergency services, utilities, public offices and hospitals in one place. Tap a number to call.",
    quick: "Most needed",
    call: "Call",
    helpTitle: "Problem in your flat?",
    wrong: "Number not answering or changed?",
    wrongLink: "Let us know — we'll fix it",
  },
  ka: {
    nav: "სასარგებლო ნომრები",
    title: "ბათუმის სასარგებლო ტელეფონები: გადაუდებელი, დენი, წყალი, გაზი, მერია, საავადმყოფოები",
    h1: "ბათუმის სასარგებლო ტელეფონები",
    lead: "გადაუდებელი სამსახურები, კომუნალური, სახელმწიფო უწყებები და საავადმყოფოები ერთ ადგილას. დააჭირეთ ნომერს დასარეკად.",
    quick: "ყველაზე საჭირო",
    call: "დარეკვა",
    helpTitle: "პრობლემა ბინაში?",
    wrong: "ნომერი არ პასუხობს ან შეიცვალა?",
    wrongLink: "მოგვწერეთ — გავასწორებთ",
  },
};
