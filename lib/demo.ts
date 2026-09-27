import type { NewMaster, PublicMaster } from "./types";

/*
 * Демо-профили: показывают, как выглядит каталог, пока нет настоящих специалистов.
 * Отмечены «Пример профиля», телефоны несуществующие (+995 000 …), заявки им не уходят.
 * Показываются автоматически, пока на сайте меньше DEMO_UNTIL настоящих специалистов.
 */
export const DEMO_PREFIX = "demo-";

export function isDemoSlug(slug: string): boolean {
  return slug.startsWith(DEMO_PREFIX);
}

type Demo = Omit<NewMaster, "status" | "consent_at" | "photo_url" | "phone" | "telegram" | "whatsapp"> & { slugBase: string; photo: string };

/** Фото с Unsplash (бесплатная лицензия), обрезаны по лицу. */
function unsplash(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&crop=faces&auto=format&q=80`;
}

export const DEMO_MASTERS: Demo[] = [
  {
    slugBase: "giorgi-plumber",
    photo: unsplash("1506794778202-cad84cf45f1d"),
    name: "Гиорги Мчедлидзе",
    category: "plumber",
    services: "Замена смесителя — 40 ₾\nУстранение засора — 50 ₾\nУстановка бойлера — 90 ₾\nЗамена труб — по договорённости",
    about: "Работаю сантехником в Батуми 12 лет. Приезжаю в день обращения, инструмент и расходники свои. Даю гарантию на работу 6 месяцев.",
    credentials: "",
    experience_years: 12,
    languages: ["Грузинский", "Русский"],
    price_from: 40,
    price_unit: "выезд",
  },
  {
    slugBase: "nino-tutor",
    photo: unsplash("1494790108377-be9c29b29330"),
    name: "Нино Абашидзе",
    category: "tutor",
    services: "Английский для детей 6–12 лет — 35 ₾\nПодготовка к IELTS — 60 ₾\nРазговорный английский для взрослых — 45 ₾",
    about: "Преподаю английский 8 лет, занимаюсь онлайн и у себя в районе Нового бульвара. Первое занятие — знакомство и оценка уровня.",
    credentials: "БГУ им. Шота Руставели, факультет филологии. Сертификат CELTA.",
    experience_years: 8,
    languages: ["Грузинский", "Английский", "Русский"],
    price_from: 35,
    price_unit: "занятие",
  },
  {
    slugBase: "elena-cleaning",
    photo: unsplash("1438761681033-6461ffad8d80"),
    name: "Елена Коваленко",
    category: "cleaning",
    services: "Уборка квартиры до 60 м² — 80 ₾\nГенеральная уборка — 150 ₾\nУборка после ремонта — от 200 ₾\nМойка окон — 10 ₾ / окно",
    about: "Аккуратная уборка квартир и апартаментов, в том числе посуточных — между гостями. Свои средства и пылесос.",
    credentials: "",
    experience_years: 5,
    languages: ["Русский", "Украинский"],
    price_from: 80,
    price_unit: "услуга",
  },
  {
    slugBase: "levan-electrician",
    photo: unsplash("1500648767791-00dcc994a43e"),
    name: "Леван Джапаридзе",
    category: "electrician",
    services: "Установка розетки / выключателя — 20 ₾\nПодключение люстры — 30 ₾\nЗамена проводки — по договорённости\nДиагностика — 40 ₾",
    about: "Электрик с опытом 10 лет. Работаю аккуратно, после себя убираю. Выезжаю по всему Батуми и в Гонио.",
    credentials: "",
    experience_years: 10,
    languages: ["Грузинский", "Русский", "Турецкий"],
    price_from: 20,
    price_unit: "услуга",
  },
  {
    slugBase: "tamar-nanny",
    photo: unsplash("1544005313-94ddf0286df2"),
    name: "Тамар Беридзе",
    category: "nanny",
    services: "Няня на час — 15 ₾\nНяня на день — 90 ₾\nВечерняя няня — 20 ₾ / час",
    about: "Мама двоих детей, работаю няней 6 лет. Играем, гуляем, читаем, готовлю детское меню. Есть рекомендации от семей.",
    credentials: "Курс первой помощи детям (2025).",
    experience_years: 6,
    languages: ["Грузинский", "Русский"],
    price_from: 15,
    price_unit: "час",
  },
  {
    slugBase: "anna-psychologist",
    photo: unsplash("1573496359142-b8d87734a5a2"),
    name: "Анна Соколова",
    category: "psychologist",
    services: "Индивидуальная консультация (60 мин) — 80 ₾\nОнлайн-консультация — 70 ₾\nСемейная консультация — 120 ₾",
    about: "Помогаю при тревоге, стрессе, адаптации после переезда. Работаю в когнитивно-поведенческом подходе.",
    credentials: "МГУ, факультет психологии, 2014. Повышение квалификации по КПТ.",
    experience_years: 11,
    languages: ["Русский", "Английский"],
    price_from: 70,
    price_unit: "приём",
  },
  {
    slugBase: "david-aircon",
    photo: unsplash("1472099645785-5658abf4ff4e"),
    name: "Давид Кахидзе",
    category: "aircon",
    services: "Чистка кондиционера — 50 ₾\nЗаправка фреоном — 80 ₾\nУстановка кондиционера — от 150 ₾",
    about: "Обслуживаю кондиционеры всех марок. Перед сезоном — запись заранее, летом очереди.",
    credentials: "",
    experience_years: 7,
    languages: ["Грузинский", "Русский"],
    price_from: 50,
    price_unit: "услуга",
  },
  {
    slugBase: "irina-beauty",
    photo: unsplash("1534528741775-53994a69daeb"),
    name: "Ирина Мельник",
    category: "beauty",
    services: "Маникюр с покрытием — 45 ₾\nПедикюр — 60 ₾\nНаращивание ресниц — 70 ₾",
    about: "Мастер маникюра и ресниц, принимаю у себя в кабинете в центре или выезжаю на дом.",
    credentials: "",
    experience_years: 4,
    languages: ["Русский", "Украинский", "Английский"],
    price_from: 45,
    price_unit: "услуга",
  },
];

/** Когда настоящих опубликованных специалистов станет столько — примеры исчезнут сами. */
export const DEMO_UNTIL = 6;

const DEMO_DATE = "2026-09-01T00:00:00.000Z";

/** Примеры в виде публичных карточек (в базе их нет). */
export function demoPublicMasters(): PublicMaster[] {
  return DEMO_MASTERS.map((d) => ({
    id: DEMO_PREFIX + d.slugBase,
    slug: DEMO_PREFIX + d.slugBase,
    name: d.name,
    category: d.category,
    services: d.services,
    about: d.about,
    credentials: d.credentials,
    experience_years: d.experience_years,
    languages: d.languages,
    price_from: d.price_from,
    price_unit: d.price_unit,
    photo_url: d.photo,
    created_at: DEMO_DATE,
    updated_at: DEMO_DATE,
    verified: false,
    demo: true,
    rating: null,
    reviews: 0,
  }));
}
