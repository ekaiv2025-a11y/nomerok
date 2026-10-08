import type { Locale } from "./i18n/config";

/*
 * Нотариусы Батуми — из официального реестра Нотариальной палаты Грузии (notary.ge).
 * Часы: пн–пт, перерыв — в скобках. Проверено: октябрь 2026.
 */
export type Notary = {
  ru: string;
  en: string;
  addrRu: string;
  addrEn: string;
  phones: string[]; // сначала мобильный
  hours: { from: string; to: string; brk?: string; fri?: string; sat?: string; monThu?: boolean };
  access?: boolean; // приспособлено для людей с инвалидностью
};

const H = (from: string, to: string, brk?: string) => ({ from, to, brk });

export const NOTARIES: Notary[] = [
  { ru: "Иа Немсадзе", en: "Ia Nemsadze", addrRu: "ул. Зураба Горгиладзе, 12, 1 этаж", addrEn: "12 Zurab Gorgiladze St, 1st floor", phones: ["+995 599 77 11 50"], hours: H("11:00", "17:00", "14–15") },
  { ru: "Ирма Двалишвили", en: "Irma Dvalishvili", addrRu: "ул. 26 Мая, 26", addrEn: "26 May 26 St", phones: ["+995 577 42 67 78"], hours: { from: "10:00", to: "17:00", brk: "13–14", monThu: true, fri: "10:00–15:00" } },
  { ru: "Кетеван Гатенадзе", en: "Ketevan Gatenadze", addrRu: "пр. Фридона Халваши, 346б", addrEn: "346b Fridon Khalvashi Ave", phones: ["+995 577 90 80 16"], hours: H("11:00", "17:00", "14–15") },
  { ru: "Кетино Тунадзе", en: "Ketino Tunadze", addrRu: "ул. Тамар Мепе, 7, 2 этаж, офис 8", addrEn: "7 Tamar Mepe St, 2nd floor, office 8", phones: ["+995 591 04 43 00"], hours: { from: "11:00", to: "17:00", brk: "14–15", sat: "10:00–14:00" } },
  { ru: "Хатуна Каландаришвили", en: "Khatuna Kalandarishvili", addrRu: "ул. Ноэ Жордания, 12", addrEn: "12 Noe Zhordania St", phones: ["+995 591 70 99 81", "+995 422 27 73 43"], hours: H("11:00", "17:00", "14–15") },
  { ru: "Майя Джинчвелеишвили", en: "Maia Jinchveleishvili", addrRu: "ул. Мазниашвили, 47", addrEn: "47 Mazniashvili St", phones: ["+995 591 70 66 55", "+995 422 27 07 26"], hours: H("11:00", "17:00", "14–15") },
  { ru: "Мариам Кварацхелия", en: "Mariam Kvaratskhelia", addrRu: "ул. Давида Агмашенебели, 10, офис 28", addrEn: "10 Davit Aghmashenebeli St, office 28", phones: ["+995 591 70 11 53"], hours: H("11:00", "17:00", "14–15") },
  { ru: "Марине Сихарулидзе", en: "Marine Sikharulidze", addrRu: "ул. Зураба Горгиладзе, 5", addrEn: "5 Zurab Gorgiladze St", phones: ["+995 591 70 11 31"], hours: H("11:00", "17:00", "13–14"), access: true },
  { ru: "Меги Ломсадзе", en: "Megi Lomsadze", addrRu: "ул. 26 Мая, 1 (Агмашенебели, 16а)", addrEn: "1 May 26 St (16a Aghmashenebeli St)", phones: ["+995 593 01 41 41"], hours: H("11:00", "17:00", "13–14") },
  { ru: "Нани Ананидзе", en: "Nani Ananidze", addrRu: "ул. Гогебашвили, 42", addrEn: "42 Gogebashvili St", phones: ["+995 591 70 99 88", "+995 422 27 40 63"], hours: H("11:00", "17:00", "14–15") },
  { ru: "Натия Пагава", en: "Natia Phagava", addrRu: "ул. Руставели, 13 (вход с ул. Думбадзе, 6)", addrEn: "13 Rustaveli St (entrance from 6 Dumbadze St)", phones: ["+995 591 70 66 30", "+995 422 27 00 13"], hours: H("10:00", "17:00", "13–14"), access: true },
  { ru: "Натия Сванидзе", en: "Natia Svanidze", addrRu: "ул. Зураба Горгиладзе, 54/62", addrEn: "54/62 Zurab Gorgiladze St", phones: ["+995 599 87 05 04", "+995 422 22 23 29"], hours: H("11:00", "17:00", "14–15"), access: true },
  { ru: "Нино Бадагадзе", en: "Nino Badagadze", addrRu: "ул. Реваза Комахидзе, 10/12", addrEn: "10/12 Revaz Komakhidze St", phones: ["+995 591 41 71 15"], hours: H("11:00", "17:00", "14–15"), access: true },
  { ru: "Тамар Чамба", en: "Tamar Chamba", addrRu: "ул. Дидачара, 39", addrEn: "39 Didachara St", phones: ["+995 591 70 11 18", "+995 427 24 20 16"], hours: H("11:00", "17:00", "14–15"), access: true },
  { ru: "Тамар Шушиашвили", en: "Tamar Shushiashvili", addrRu: "ул. Шерифа Химшиашвили, 7б", addrEn: "7b Sherif Khimshiashvili St", phones: ["+995 593 98 93 98"], hours: H("10:00", "17:00") },
  { ru: "Валида Нинидзе", en: "Valida Ninidze", addrRu: "ул. Джавахишвили, 2а", addrEn: "2a Javakhishvili St", phones: ["+995 591 70 99 82", "+995 422 27 76 79"], hours: H("11:00", "17:00", "14–15"), access: true },
];

const W = {
  ru: { days: "Пн–Пт", monThu: "Пн–Чт", fri: "Пт", sat: "Сб", brk: "перерыв" },
  en: { days: "Mon–Fri", monThu: "Mon–Thu", fri: "Fri", sat: "Sat", brk: "break" },
  ka: { days: "ორშ–პარ", monThu: "ორშ–ხუთ", fri: "პარ", sat: "შაბ", brk: "შესვენება" },
};

export function notaryHours(n: Notary, lang: Locale): string {
  const w = W[lang];
  const h = n.hours;
  let s = `${h.monThu ? w.monThu : w.days} ${h.from}–${h.to}${h.brk ? ` (${w.brk} ${h.brk})` : ""}`;
  if (h.fri) s += ` · ${w.fri} ${h.fri}`;
  if (h.sat) s += ` · ${w.sat} ${h.sat}`;
  return s;
}

export const NOTARY_TEXT: Record<Locale, { title: string; hint: string; access: string; sat: string }> = {
  ru: { title: "Нотариусы Батуми", hint: "Доверенности, заверение копий и переводов, сделки с недвижимостью. Звоните заранее — уточните, нужна ли запись.", access: "♿ Доступно для людей с инвалидностью", sat: "работает в субботу" },
  en: { title: "Notaries in Batumi", hint: "Powers of attorney, certified copies and translations, property deals. Call ahead to check if you need an appointment.", access: "♿ Wheelchair accessible", sat: "open on Saturday" },
  ka: { title: "ნოტარიუსები ბათუმში", hint: "მინდობილობა, ასლებისა და თარგმანის დამოწმება, უძრავი ქონების გარიგებები. წინასწარ დარეკეთ.", access: "♿ ადაპტირებულია შეზღუდული შესაძლებლობის მქონე პირებისთვის", sat: "მუშაობს შაბათს" },
};
