export const CATEGORY_GROUPS = ["Дом и ремонт", "Дети и обучение", "Здоровье", "Красота и спорт", "Дела и документы", "Другое"] as const;

export const CATEGORIES = [
  // Дом и ремонт
  { id: "plumber", label: "Сантехник", plural: "Сантехники", group: "Дом и ремонт" },
  { id: "electrician", label: "Электрик", plural: "Электрики", group: "Дом и ремонт" },
  { id: "repair", label: "Ремонт и отделка", plural: "Ремонт и отделка", group: "Дом и ремонт" },
  { id: "handyman", label: "Мастер на час", plural: "Мастер на час", group: "Дом и ремонт" },
  { id: "aircon", label: "Кондиционеры", plural: "Кондиционеры", group: "Дом и ремонт" },
  { id: "appliances", label: "Ремонт техники", plural: "Ремонт техники", group: "Дом и ремонт" },
  { id: "cleaning", label: "Уборка", plural: "Уборка", group: "Дом и ремонт" },
  { id: "moving", label: "Переезд и грузчики", plural: "Переезд", group: "Дом и ремонт" },
  // Дети и обучение
  { id: "nanny", label: "Няня", plural: "Няни", group: "Дети и обучение" },
  { id: "tutor", label: "Репетитор", plural: "Репетиторы", group: "Дети и обучение" },
  { id: "speech", label: "Логопед / дефектолог", plural: "Логопеды", group: "Дети и обучение" },
  { id: "languages", label: "Языковые курсы", plural: "Языки", group: "Дети и обучение" },
  { id: "music", label: "Музыка и творчество", plural: "Музыка и творчество", group: "Дети и обучение" },
  // Здоровье
  { id: "doctor", label: "Врач", plural: "Врачи", group: "Здоровье" },
  { id: "dentist", label: "Стоматолог", plural: "Стоматологи", group: "Здоровье" },
  { id: "psychologist", label: "Психолог", plural: "Психологи", group: "Здоровье" },
  { id: "massage", label: "Массаж", plural: "Массаж", group: "Здоровье" },
  { id: "vet", label: "Ветеринар", plural: "Ветеринары", group: "Здоровье" },
  // Красота и спорт
  { id: "beauty", label: "Красота", plural: "Красота", group: "Красота и спорт" },
  { id: "fitness", label: "Фитнес-тренер", plural: "Тренеры", group: "Красота и спорт" },
  // Дела и документы
  { id: "lawyer", label: "Юрист", plural: "Юристы", group: "Дела и документы" },
  { id: "accountant", label: "Бухгалтер", plural: "Бухгалтеры", group: "Дела и документы" },
  { id: "translator", label: "Переводчик", plural: "Переводчики", group: "Дела и документы" },
  { id: "realtor", label: "Риелтор", plural: "Риелторы", group: "Дела и документы" },
  { id: "photo", label: "Фото и видео", plural: "Фото и видео", group: "Дела и документы" },
  { id: "other", label: "Другое", plural: "Другое", group: "Другое" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];

/** Категории, где на профиле показываем предупреждение про медицину. */
export const MEDICAL_CATEGORIES: readonly string[] = ["doctor", "dentist", "psychologist", "massage", "speech"];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? "Другое";
}

export function categoryPlural(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.plural ?? "Другое";
}

export const PRICE_UNITS = ["час", "занятие", "приём", "выезд", "услуга", "м²", "день"] as const;

export const LANGUAGES = ["Русский", "Грузинский", "Английский", "Украинский", "Турецкий"] as const;
