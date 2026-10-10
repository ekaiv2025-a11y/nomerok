import type { Locale } from "./i18n/config";

type L = Record<Locale, string>;

export const CATEGORY_GROUPS = ["home", "kids", "health", "beauty", "business", "other"] as const;
export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

export const GROUP_LABELS: Record<CategoryGroup, L> = {
  home: { ru: "Дом и ремонт", ka: "სახლი და რემონტი", en: "Home & repair" },
  kids: { ru: "Дети и обучение", ka: "ბავშვები და განათლება", en: "Kids & education" },
  health: { ru: "Здоровье", ka: "ჯანმრთელობა", en: "Health" },
  beauty: { ru: "Красота и спорт", ka: "სილამაზე და სპორტი", en: "Beauty & sport" },
  business: { ru: "Дела и документы", ka: "საქმეები და დოკუმენტები", en: "Business & documents" },
  other: { ru: "Другое", ka: "სხვა", en: "Other" },
};

type Cat = { id: string; group: CategoryGroup; label: L; plural: L };

export const CATEGORIES = [
  { id: "plumber", group: "home", label: { ru: "Сантехник", ka: "სანტექნიკოსი", en: "Plumber" }, plural: { ru: "Сантехники", ka: "სანტექნიკოსები", en: "Plumbers" } },
  { id: "electrician", group: "home", label: { ru: "Электрик", ka: "ელექტრიკოსი", en: "Electrician" }, plural: { ru: "Электрики", ka: "ელექტრიკოსები", en: "Electricians" } },
  { id: "repair", group: "home", label: { ru: "Ремонт и отделка", ka: "რემონტი და მოპირკეთება", en: "Renovation" }, plural: { ru: "Ремонт и отделка", ka: "რემონტი", en: "Renovation" } },
  { id: "inspection", group: "home", label: { ru: "Технадзор и приёмка квартир", ka: "ტექზედამხედველობა და ბინის მიღება", en: "Building inspection" }, plural: { ru: "Технадзор", ka: "ტექზედამხედველობა", en: "Building inspectors" } },
  { id: "handyman", group: "home", label: { ru: "Мастер на час", ka: "ხელოსანი საათობრივად", en: "Handyman" }, plural: { ru: "Мастер на час", ka: "ხელოსნები", en: "Handymen" } },
  { id: "aircon", group: "home", label: { ru: "Кондиционеры", ka: "კონდიციონერები", en: "Air conditioning" }, plural: { ru: "Кондиционеры", ka: "კონდიციონერები", en: "Air conditioning" } },
  { id: "appliances", group: "home", label: { ru: "Ремонт техники", ka: "ტექნიკის შეკეთება", en: "Appliance repair" }, plural: { ru: "Ремонт техники", ka: "ტექნიკის შეკეთება", en: "Appliance repair" } },
  { id: "furniture", group: "home", label: { ru: "Мебель: на заказ и перетяжка", ka: "ავეჯი: შეკვეთით და გადაკვრა", en: "Furniture: custom & upholstery" }, plural: { ru: "Мебель", ka: "ავეჯი", en: "Furniture" } },
  { id: "cleaning", group: "home", label: { ru: "Уборка", ka: "დალაგება", en: "Cleaning" }, plural: { ru: "Уборка", ka: "დალაგება", en: "Cleaning" } },
  { id: "moving", group: "home", label: { ru: "Переезд и грузчики", ka: "გადაზიდვა და მტვირთავები", en: "Moving & movers" }, plural: { ru: "Переезд", ka: "გადაზიდვა", en: "Moving" } },
  { id: "nanny", group: "kids", label: { ru: "Няня", ka: "ძიძა", en: "Nanny" }, plural: { ru: "Няни", ka: "ძიძები", en: "Nannies" } },
  { id: "tutor", group: "kids", label: { ru: "Репетитор", ka: "რეპეტიტორი", en: "Tutor" }, plural: { ru: "Репетиторы", ka: "რეპეტიტორები", en: "Tutors" } },
  { id: "speech", group: "kids", label: { ru: "Логопед, дефектолог, тьютор", ka: "ლოგოპედი, დეფექტოლოგი, ტიუტორი", en: "Speech therapist & tutor-assistant" }, plural: { ru: "Логопеды и тьюторы", ka: "ლოგოპედები და ტიუტორები", en: "Speech & special needs" } },
  { id: "languages", group: "kids", label: { ru: "Языковые курсы", ka: "ენის კურსები", en: "Language courses" }, plural: { ru: "Языки", ka: "ენები", en: "Languages" } },
  { id: "music", group: "kids", label: { ru: "Музыка и творчество", ka: "მუსიკა და შემოქმედება", en: "Music & arts" }, plural: { ru: "Музыка и творчество", ka: "მუსიკა და შემოქმედება", en: "Music & arts" } },
  { id: "doctor", group: "health", label: { ru: "Врач", ka: "ექიმი", en: "Doctor" }, plural: { ru: "Врачи", ka: "ექიმები", en: "Doctors" } },
  { id: "dentist", group: "health", label: { ru: "Стоматолог", ka: "სტომატოლოგი", en: "Dentist" }, plural: { ru: "Стоматологи", ka: "სტომატოლოგები", en: "Dentists" } },
  { id: "psychologist", group: "health", label: { ru: "Психолог", ka: "ფსიქოლოგი", en: "Psychologist" }, plural: { ru: "Психологи", ka: "ფსიქოლოგები", en: "Psychologists" } },
  { id: "massage", group: "health", label: { ru: "Массаж", ka: "მასაჟი", en: "Massage" }, plural: { ru: "Массаж", ka: "მასაჟი", en: "Massage" } },
  { id: "vet", group: "health", label: { ru: "Ветеринар", ka: "ვეტერინარი", en: "Vet" }, plural: { ru: "Ветеринары", ka: "ვეტერინარები", en: "Vets" } },
  { id: "beauty", group: "beauty", label: { ru: "Красота", ka: "სილამაზე", en: "Beauty" }, plural: { ru: "Красота", ka: "სილამაზე", en: "Beauty" } },
  { id: "fitness", group: "beauty", label: { ru: "Спорт и тренеры", ka: "სპორტი და მწვრთნელები", en: "Sports & coaches" }, plural: { ru: "Спорт и тренеры", ka: "სპორტი და მწვრთნელები", en: "Sports & coaches" } },
  { id: "lawyer", group: "business", label: { ru: "Юрист", ka: "იურისტი", en: "Lawyer" }, plural: { ru: "Юристы", ka: "იურისტები", en: "Lawyers" } },
  { id: "accountant", group: "business", label: { ru: "Бухгалтер", ka: "ბუღალტერი", en: "Accountant" }, plural: { ru: "Бухгалтеры", ka: "ბუღალტრები", en: "Accountants" } },
  { id: "translator", group: "business", label: { ru: "Переводчик", ka: "თარჯიმანი", en: "Translator" }, plural: { ru: "Переводчики", ka: "თარჯიმნები", en: "Translators" } },
  { id: "realtor", group: "business", label: { ru: "Риелтор", ka: "რიელტორი", en: "Real estate agent" }, plural: { ru: "Риелторы", ka: "რიელტორები", en: "Real estate agents" } },
  { id: "photo", group: "business", label: { ru: "Фото и видео", ka: "ფოტო და ვიდეო", en: "Photo & video" }, plural: { ru: "Фото и видео", ka: "ფოტო და ვიდეო", en: "Photo & video" } },
  { id: "it", group: "business", label: { ru: "IT и маркетинг: сайты, боты, реклама", ka: "IT და მარკეტინგი: საიტები, ბოტები, რეკლამა", en: "IT & marketing: websites, bots, ads" }, plural: { ru: "IT и маркетинг", ka: "IT და მარკეტინგი", en: "IT & marketing" } },
  { id: "food", group: "other", label: { ru: "Торты и еда на заказ", ka: "ტორტები და საჭმელი შეკვეთით", en: "Cakes & food to order" }, plural: { ru: "Торты и еда на заказ", ka: "ტორტები და საჭმელი", en: "Cakes & food" } },
  { id: "art", group: "other", label: { ru: "Художник и хендмейд", ka: "მხატვარი და ხელნაკეთი", en: "Art & handmade" }, plural: { ru: "Художники и хендмейд", ka: "მხატვრები და ხელნაკეთი", en: "Artists & handmade" } },
  { id: "other", group: "other", label: { ru: "Другое", ka: "სხვა", en: "Other" }, plural: { ru: "Другое", ka: "სხვა", en: "Other" } },
] as const satisfies readonly Cat[];

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];

/** Категории, где на профиле показываем предупреждение про медицину. */
export const MEDICAL_CATEGORIES: readonly string[] = ["doctor", "dentist", "psychologist", "massage", "speech"];

export function categoryLabel(id: string, lang: Locale = "ru"): string {
  return CATEGORIES.find((c) => c.id === id)?.label[lang] ?? CATEGORIES[CATEGORIES.length - 1].label[lang];
}

export function categoryPlural(id: string, lang: Locale = "ru"): string {
  return CATEGORIES.find((c) => c.id === id)?.plural[lang] ?? CATEGORIES[CATEGORIES.length - 1].plural[lang];
}

/* Единицы цены хранятся в базе по-русски — показываем на языке посетителя. */
export const PRICE_UNITS = ["час", "занятие", "приём", "выезд", "услуга", "м²", "день"] as const;
const UNIT_LABELS: Record<string, L> = {
  час: { ru: "час", ka: "საათი", en: "hour" },
  занятие: { ru: "занятие", ka: "გაკვეთილი", en: "lesson" },
  приём: { ru: "приём", ka: "ვიზიტი", en: "visit" },
  выезд: { ru: "выезд", ka: "გამოძახება", en: "call-out" },
  услуга: { ru: "услуга", ka: "მომსახურება", en: "service" },
  "м²": { ru: "м²", ka: "მ²", en: "m²" },
  день: { ru: "день", ka: "დღე", en: "day" },
};
export function unitLabel(unit: string, lang: Locale): string {
  return UNIT_LABELS[unit]?.[lang] ?? unit;
}

/* Языки, на которых говорит специалист (тоже хранятся по-русски). */
export const LANGUAGES = ["Русский", "Грузинский", "Английский", "Украинский", "Турецкий"] as const;
const LANGUAGE_LABELS: Record<string, L> = {
  Русский: { ru: "Русский", ka: "რუსული", en: "Russian" },
  Грузинский: { ru: "Грузинский", ka: "ქართული", en: "Georgian" },
  Английский: { ru: "Английский", ka: "ინგლისური", en: "English" },
  Украинский: { ru: "Украинский", ka: "უკრაინული", en: "Ukrainian" },
  Турецкий: { ru: "Турецкий", ka: "თურქული", en: "Turkish" },
};
export function languageLabel(l: string, lang: Locale): string {
  return LANGUAGE_LABELS[l]?.[lang] ?? l;
}
