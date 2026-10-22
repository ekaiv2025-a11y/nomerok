/* Недвижимость: типы, подписи и разбор текста объявления (можно и на сервере, и в браузере). */
import type { Locale } from "./i18n/config";

export type Listing = {
  id: string;
  master_id: string;
  city: string;
  deal: "rent" | "sale" | "daily";
  kind: "apartment" | "house" | "commercial" | "land";
  rooms: number | null;
  area: number | null;
  floor: string | null;
  price: number | null;
  currency: "USD" | "GEL" | "EUR";
  district: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  title: string;
  description: string | null;
  photos: string[];
  status: "draft" | "published" | "archived" | "hidden";
  source: "site" | "telegram";
  tg_key: string | null;
  tg_link: string | null;
  reports: number;
  expires_at: string | null;
  expire_warned_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type RealtyChannel = { chat_id: number; master_id: string; title: string | null; username: string | null; auto_publish: boolean; connected_at: string };

export const LISTING_DAYS = 60;
export const MAX_PHOTOS = 12;

type L3 = Record<Locale, string>;
export const DEALS: Record<Listing["deal"], L3> = {
  rent: { ru: "Аренда", en: "Rent", ka: "ქირავდება" },
  sale: { ru: "Продажа", en: "Sale", ka: "იყიდება" },
  daily: { ru: "Посуточно", en: "Daily", ka: "დღიურად" },
};
export const KINDS: Record<Listing["kind"], L3> = {
  apartment: { ru: "Квартира", en: "Apartment", ka: "ბინა" },
  house: { ru: "Дом", en: "House", ka: "სახლი" },
  commercial: { ru: "Коммерческая", en: "Commercial", ka: "კომერციული" },
  land: { ru: "Участок", en: "Land", ka: "მიწა" },
};
export const CUR_SIGN: Record<Listing["currency"], string> = { USD: "$", GEL: "₾", EUR: "€" };

export function roomsLabel(n: number | null, lang: Locale): string {
  if (n == null) return "";
  if (n === 0) return { ru: "Студия", en: "Studio", ka: "სტუდიო" }[lang];
  return { ru: `${n} ${n === 1 ? "спальня" : n < 5 ? "спальни" : "спален"}`, en: `${n} bedroom${n > 1 ? "s" : ""}`, ka: `${n} საძინებელი` }[lang];
}

export function priceLabel(l: Pick<Listing, "price" | "currency" | "deal">, lang: Locale): string {
  if (l.price == null) return { ru: "Цена по запросу", en: "Price on request", ka: "ფასი მოთხოვნით" }[lang];
  const n = new Intl.NumberFormat("ru-RU").format(l.price);
  const per = l.deal === "rent" ? { ru: " / мес", en: " / mo", ka: " / თვე" }[lang] : l.deal === "daily" ? { ru: " / сутки", en: " / night", ka: " / დღე" }[lang] : "";
  return `${n} ${CUR_SIGN[l.currency]}${per}`;
}

/** Районы, которые узнаём в тексте (для фильтра). */
export const DISTRICTS: Record<string, string[]> = {
  batumi: ["Новый бульвар", "Старый город", "Центр", "Махинджаури", "Гонио", "Кватхели", "Ангиса", "Аэропорт", "Химшиашвили", "Агмашенебели", "Руставели", "Чавчавадзе", "Барцхана", "Хелвачаури", "Ботанический сад", "Зелёный мыс", "Сарпи", "Квариати", "Чакви"],
  tbilisi: ["Ваке", "Сабуртало", "Ваке-Сабуртало", "Мтацминда", "Сололаки", "Вера", "Ортачала", "Чугурети", "Дидубе", "Дигоми", "Глдани", "Надзаладеви", "Исани", "Самгори", "Варкетили", "Авлабари", "Крцаниси", "Багеби", "Лиси", "Цхнети", "Окрокана"],
};

const ALIASES: Record<string, string> = { "old town": "Старый город", "new boulevard": "Новый бульвар", "ძველი ბათუმ": "Старый город", "ახალი ბულვარ": "Новый бульвар", "vake": "Ваке", "saburtalo": "Сабуртало", "gonio": "Гонио", "makhinjauri": "Махинджаури" };

/** Район по тексту: все слова названия (по началу слова), плюс английские/грузинские варианты. */
function findDistrict(low: string, city: string): string | null {
  for (const [k, v] of Object.entries(ALIASES)) if (low.includes(k) && (DISTRICTS[city] ?? []).includes(v)) return v;
  const words = low.split(/[^\p{L}]+/u);
  for (const d of DISTRICTS[city] ?? []) {
    const stems = d.toLowerCase().split(/[\s-]+/).map((w) => w.slice(0, Math.max(3, w.length - 3)));
    if (stems.every((st) => words.some((w) => w.startsWith(st)))) return d;
  }
  return null;
}

const W = String.raw;
/** Разбор свободного текста поста: сделка, комнаты, площадь, этаж, цена, район. Всё, что не нашли, — null. */
export function parseListingText(text: string, defaults: { city?: string } = {}) {
  const t = text.replace(/ /g, " ");
  const low = t.toLowerCase();
  const deal: Listing["deal"] | null = /посуточ|daily|на сутки|დღიურ/.test(low)
    ? "daily"
    : /(прода[её]т|продажа|продам|\bsale\b|for sale|იყიდება|გაიყიდება)/.test(low)
      ? "sale"
      : /(аренд|сда[её]тся|сдам|\brent\b|for rent|ქირავდება|ქირით)/.test(low)
        ? "rent"
        : null;
  const kind: Listing["kind"] = /(участ[ок]|земля|\bland\b|მიწის ნაკვეთ)/.test(low) ? "land" : /(коммерч|офис|магазин|помещени|commercial|office|კომერციულ)/.test(low) ? "commercial" : /(\bдом\b|коттедж|\bhouse\b|villa|вилла|სახლი)/.test(low) && !/квартир|apartment|ბინა/.test(low) ? "house" : "apartment";
  let rooms: number | null = null;
  if (/студи|studio|სტუდიო/.test(low)) rooms = 0;
  const rm =
    low.match(new RegExp(W`(\d)\s*(?:-?\s*х)?\s*(?:спал|bedroom|br\b|საძინებ)`)) ??
    low.match(new RegExp(W`(\d)\s*[- ]?(?:комн|к\.?\s*кв|room)`)) ??
    low.match(/(\d)\s*\+\s*1/); // «2+1»: 2 спальни + гостиная
  if (rm) rooms = Number(rm[1]);
  const am = low.match(/(\d{2,4}(?:[.,]\d)?)\s*(?:м2|м²|кв\.?\s*м|кв\.м|sq\.?\s*m|m2|m²|კვ)/);
  const area = am ? Number(am[1].replace(",", ".")) : null;
  const fm = low.match(/(\d{1,2})\s*(?:\/\s*\d{1,2}\s*)?(?:-?\s*(?:й|ой|ий)?\s*этаж|floor|სართულ)/) ?? low.match(/этаж\s*:?\s*(\d{1,2}(?:\s*\/\s*\d{1,2})?)/);
  const floor = fm ? fm[1].replace(/\s+/g, "") : null;
  // Цена: «650$», «$ 650», «55 000 USD», «1200 лари», «₾ 900»
  let price: number | null = null;
  let currency: Listing["currency"] = "USD";
  const num = W`(\d{1,3}(?:[ .,]\d{3})+|\d+(?:[.,]\d+)?)\s*(k|к|тыс\.?)?`;
  const pm =
    t.match(new RegExp(num + W`\s*(\$|usd|долл|доллар|€|eur|евро|₾|gel|лари|lari|ლარ)`, "i")) ??
    t.match(new RegExp(W`(\$|usd|€|eur|₾|gel)\s*` + num, "i"));
  if (pm) {
    const [a, b, c] = /^\d/.test(pm[1]) ? [pm[1], pm[2], pm[3]] : [pm[2], pm[3], pm[1]];
    let v = Number(a.replace(/[ .,](?=\d{3}\b)/g, "").replace(",", "."));
    if (b) v *= 1000;
    const cur = (c || "").toLowerCase();
    currency = /€|eur|евро/.test(cur) ? "EUR" : /₾|gel|лари|lari|ლარ/.test(cur) ? "GEL" : "USD";
    if (v > 0 && v < 100_000_000) price = Math.round(v);
  }
  const city = /тбилис|tbilisi|თბილის/.test(low) ? "tbilisi" : /батум|batumi|ბათუმ/.test(low) ? "batumi" : defaults.city ?? "batumi";
  const district = findDistrict(low, city);
  const firstLine =
    t
      .split("\n")
      .map((x) => x.replace(/[#*_]+/g, "").replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, "").trim())
      .find((x) => x.length > 3) ?? "";
  const title = firstLine.slice(0, 90);
  const looksLikeListing = !!(price || rooms != null || area || deal);
  return { deal, kind, rooms, area, floor, price, currency, city, district, title, looksLikeListing };
}

/** Заголовок, если в тексте его нет: «Аренда · 2 спальни · 65 м² · Новый бульвар». */
export function autoTitle(l: Pick<Listing, "deal" | "kind" | "rooms" | "area" | "district">, lang: Locale): string {
  return [DEALS[l.deal][lang], l.kind === "apartment" ? roomsLabel(l.rooms, lang) : KINDS[l.kind][lang], l.area ? `${l.area} м²` : "", l.district ?? ""].filter(Boolean).join(" · ");
}
