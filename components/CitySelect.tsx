import { CITIES } from "@/lib/cities";
import type { Locale } from "@/lib/i18n";

export const CITY_LABEL: Record<Locale, string> = { ru: "Город", en: "City", ka: "ქალაქი" };

/** Выпадающий список городов Грузии (Батуми — первым). */
export function CityOptions({ lang }: { lang: Locale }) {
  return (
    <>
      {CITIES.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label[lang]}
        </option>
      ))}
    </>
  );
}
