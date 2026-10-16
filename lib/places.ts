/* «Места» — общие типы, категории и подписи (можно и на сервере, и в браузере). */
import type { Locale } from "./i18n/config";

export type Place = {
  id: string;
  slug: string;
  name: string;
  name_en?: string | null;
  name_ka?: string | null;
  cat: string;
  sub?: string | null;
  addr?: string | null;
  lat?: number | null;
  lng?: number | null;
  phones?: string[];
  site?: string | null;
  ig?: string | null;
  socials?: string[];
  email?: string | null;
  hours?: string | null;
  desc_ru?: string | null;
  desc_en?: string | null;
  src?: string | null;
  links?: string[];
  area?: string;
  city?: string;
  status: "published" | "hidden";
  photos?: string[];
  tags?: string[];
  work_status?: string | null; // работает / закрыто / не найдено — по последней проверке
  checked?: string | null;
  edited?: boolean;
  claim_chat_id?: number | null;
  claim_at?: string | null;
  owner_chat_id?: number | null;
  owner_name?: string | null;
  owner_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type L3 = Record<Locale, string>;
export const PLACE_CATS: { id: string; emoji: string; label: L3 }[] = [
  { id: "food", emoji: "🍽", label: { ru: "Рестораны и кафе", en: "Restaurants & cafés", ka: "რესტორნები და კაფეები" } },
  { id: "stay", emoji: "🏨", label: { ru: "Отели и жильё", en: "Hotels & stays", ka: "სასტუმროები" } },
  { id: "groceries", emoji: "🛒", label: { ru: "Продукты и напитки", en: "Groceries & drinks", ka: "სურსათი და სასმელი" } },
  { id: "beauty", emoji: "💅", label: { ru: "Красота и уход", en: "Beauty & care", ka: "სილამაზე" } },
  { id: "health", emoji: "🏥", label: { ru: "Медицина и аптеки", en: "Health & pharmacies", ka: "მედიცინა და აფთიაქები" } },
  { id: "education", emoji: "🎓", label: { ru: "Образование", en: "Education", ka: "განათლება" } },
  { id: "kids", emoji: "🧸", label: { ru: "Детские товары", en: "Kids", ka: "საბავშვო" } },
  { id: "clothes", emoji: "👗", label: { ru: "Одежда и обувь", en: "Clothes & shoes", ka: "ტანსაცმელი და ფეხსაცმელი" } },
  { id: "shops", emoji: "🛍", label: { ru: "Магазины", en: "Shops", ka: "მაღაზიები" } },
  { id: "electronics", emoji: "📱", label: { ru: "Электроника и связь", en: "Electronics & telecom", ka: "ელექტრონიკა" } },
  { id: "repair", emoji: "🛠", label: { ru: "Мастерские и ремонт", en: "Repair workshops", ka: "სახელოსნოები" } },
  { id: "home", emoji: "🏠", label: { ru: "Дом и стройка", en: "Home & building", ka: "სახლი და მშენებლობა" } },
  { id: "auto", emoji: "🚗", label: { ru: "Авто и транспорт", en: "Cars & transport", ka: "ავტო და ტრანსპორტი" } },
  { id: "culture", emoji: "🎭", label: { ru: "Культура и развлечения", en: "Culture & fun", ka: "კულტურა და გართობა" } },
  { id: "sport", emoji: "🏋️", label: { ru: "Спорт и фитнес", en: "Sport & fitness", ka: "სპორტი" } },
  { id: "tourism", emoji: "🧭", label: { ru: "Туризм и экскурсии", en: "Tours", ka: "ტურიზმი" } },
  { id: "events", emoji: "🎉", label: { ru: "Праздники и события", en: "Events", ka: "ღონისძიებები" } },
  { id: "realty", emoji: "🔑", label: { ru: "Недвижимость", en: "Real estate", ka: "უძრავი ქონება" } },
  { id: "finance", emoji: "🏦", label: { ru: "Банки и финансы", en: "Banks & finance", ka: "ბანკები" } },
  { id: "business", emoji: "💼", label: { ru: "Деловые услуги", en: "Business services", ka: "ბიზნეს მომსახურება" } },
  { id: "pets", emoji: "🐾", label: { ru: "Животные", en: "Pets", ka: "ცხოველები" } },
  { id: "flowers", emoji: "💐", label: { ru: "Цветы и подарки", en: "Flowers & gifts", ka: "ყვავილები და საჩუქრები" } },
  { id: "hobby", emoji: "📚", label: { ru: "Книги и хобби", en: "Books & hobbies", ka: "წიგნები და ჰობი" } },
  { id: "delivery", emoji: "📦", label: { ru: "Доставка и логистика", en: "Delivery", ka: "მიწოდება" } },
  { id: "coworking", emoji: "💻", label: { ru: "Коворкинги и офисы", en: "Coworking", ka: "კოვორკინგი" } },
  { id: "media", emoji: "🎬", label: { ru: "Медиа и творчество", en: "Media & creative", ka: "მედია" } },
  { id: "production", emoji: "🏭", label: { ru: "Производство", en: "Manufacturing", ka: "წარმოება" } },
  { id: "rent", emoji: "🚲", label: { ru: "Аренда и прокат", en: "Rentals", ka: "გაქირავება" } },
  { id: "services", emoji: "🧺", label: { ru: "Бытовые услуги", en: "Household services", ka: "საყოფაცხოვრებო" } },
];
export const placeCat = (id: string) => PLACE_CATS.find((c) => c.id === id) ?? PLACE_CATS[PLACE_CATS.length - 1];

export function placeName(p: Pick<Place, "name" | "name_en" | "name_ka">, lang: Locale): string {
  if (lang === "en") return p.name_en || p.name;
  if (lang === "ka") return p.name_ka || p.name;
  return p.name;
}
export function placeDesc(p: Pick<Place, "desc_ru" | "desc_en">, lang: Locale): string | null {
  return lang === "ru" ? p.desc_ru || null : p.desc_en || p.desc_ru || null;
}
/** Карточка достаточно полная, чтобы показывать её поисковикам. */
export const placeIndexable = (p: Place) => !!(p.desc_ru || p.desc_en);

/** Часы работы OSM «Mo-Fr 09:00-18:00» → по-человечески. */
export function prettyHours(h: string, lang: Locale): string {
  if (h.trim() === "24/7") return lang === "ru" ? "Круглосуточно" : lang === "ka" ? "24/7" : "24/7";
  const D: Record<string, L3> = {
    Mo: { ru: "Пн", en: "Mon", ka: "ორშ" }, Tu: { ru: "Вт", en: "Tue", ka: "სამ" }, We: { ru: "Ср", en: "Wed", ka: "ოთხ" },
    Th: { ru: "Чт", en: "Thu", ka: "ხუთ" }, Fr: { ru: "Пт", en: "Fri", ka: "პარ" }, Sa: { ru: "Сб", en: "Sat", ka: "შაბ" }, Su: { ru: "Вс", en: "Sun", ka: "კვ" },
  };
  return h
    .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su)\b/g, (d) => D[d][lang])
    .replace(/\boff\b/gi, lang === "ru" ? "выходной" : lang === "ka" ? "დასვენება" : "closed")
    .replace(/;\s*/g, " · ");
}

export const PT: Record<Locale, Record<string, string>> = {
  ru: {
    nav: "Места",
    title: "Места Батуми: кафе, сервисы, магазины",
    h1: "Места Батуми",
    lead: "Адреса, телефоны, сайты и соцсети заведений и организаций города. Ищите по названию или выбирайте раздел.",
    search: "Название, услуга или улица…",
    find: "Найти",
    found: "Найдено",
    nothing: "Ничего не нашли. Попробуйте другое слово.",
    all: "Все разделы",
    call: "Позвонить",
    site: "Сайт",
    route: "Маршрут",
    hours: "Часы работы",
    address: "Адрес",
    contacts: "Контакты",
    about: "О месте",
    near: "Рядом",
    owner: "Это ваше заведение?",
    ownerText: "Подтвердите через Telegram — сможете добавить фото, меню и актуальные часы работы.",
    ownerBtn: "Подтвердить в Telegram",
    ownerOk: "✓ Подтверждено владельцем",
    data: "Данные из открытых источников",
    stale: "Информация могла устареть — перед визитом лучше позвонить.",
    wrong: "Нашли ошибку?",
    wrongLink: "Сообщите нам",
    more: "Показать ещё",
    picks: "Подборки",
    prev: "← Назад",
    next: "Дальше →",
  },
  en: {
    nav: "Places",
    title: "Places in Batumi: cafés, services, shops",
    h1: "Places in Batumi",
    lead: "Addresses, phones, websites and social links of the city's venues and businesses. Search by name or pick a category.",
    search: "Name, service or street…",
    find: "Search",
    found: "Found",
    nothing: "Nothing found. Try another word.",
    all: "All categories",
    call: "Call",
    site: "Website",
    route: "Directions",
    hours: "Opening hours",
    address: "Address",
    contacts: "Contacts",
    about: "About",
    near: "Nearby",
    owner: "Is this your business?",
    ownerText: "Confirm via Telegram to add photos, a menu and up-to-date hours.",
    ownerBtn: "Confirm in Telegram",
    ownerOk: "✓ Confirmed by owner",
    data: "Data from open sources",
    stale: "Information may be out of date — better call before visiting.",
    wrong: "Found a mistake?",
    wrongLink: "Tell us",
    more: "Show more",
    picks: "Collections",
    prev: "← Back",
    next: "Next →",
  },
  ka: {
    nav: "ადგილები",
    title: "ბათუმის ადგილები: კაფეები, სერვისები, მაღაზიები",
    h1: "ბათუმის ადგილები",
    lead: "ქალაქის დაწესებულებების მისამართები, ტელეფონები, საიტები და სოციალური ქსელები.",
    search: "სახელი, მომსახურება ან ქუჩა…",
    find: "ძებნა",
    found: "ნაპოვნია",
    nothing: "ვერაფერი ვიპოვეთ. სცადეთ სხვა სიტყვა.",
    all: "ყველა განყოფილება",
    call: "დარეკვა",
    site: "საიტი",
    route: "მარშრუტი",
    hours: "სამუშაო საათები",
    address: "მისამართი",
    contacts: "კონტაქტები",
    about: "ადგილის შესახებ",
    near: "ახლოს",
    owner: "ეს თქვენი დაწესებულებაა?",
    ownerText: "დაადასტურეთ Telegram-ით — შეძლებთ ფოტოების, მენიუს და საათების დამატებას.",
    ownerBtn: "დადასტურება Telegram-ში",
    ownerOk: "✓ დადასტურებულია მფლობელის მიერ",
    data: "მონაცემები ღია წყაროებიდან",
    stale: "ინფორმაცია შეიძლება მოძველებული იყოს — ვიზიტამდე დარეკეთ.",
    wrong: "იპოვეთ შეცდომა?",
    wrongLink: "მოგვწერეთ",
    more: "მეტის ჩვენება",
    picks: "კრებულები",
    prev: "← უკან",
    next: "შემდეგი →",
  },
};
