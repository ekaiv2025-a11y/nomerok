import type { NewMaster } from "./types";

/*
 * Демо-профили: показывают, как выглядит каталог, пока нет настоящих специалистов.
 * Отмечены «Пример профиля», телефоны несуществующие (+995 000 …), заявки им не уходят.
 * Добавить/удалить — кнопками в админке (вкладка «Специалисты»).
 */
export const DEMO_PREFIX = "demo-";

export function isDemoSlug(slug: string): boolean {
  return slug.startsWith(DEMO_PREFIX);
}

type Demo = Omit<NewMaster, "status" | "consent_at" | "photo_url" | "phone" | "telegram" | "whatsapp"> & { slugBase: string };

export const DEMO_MASTERS: Demo[] = [
  {
    slugBase: "giorgi-plumber",
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
