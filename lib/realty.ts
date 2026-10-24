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
  // подробные параметры (обновление 0036)
  floor_n?: number | null;
  floors_total?: number | null;
  rooms_total?: number | null;
  bathrooms?: number | null;
  building?: Building | null;
  condition?: Condition | null;
  heating?: Heating | null;
  parking?: Parking | null;
  amenities?: string[];
  deposit?: number | null;
  min_months?: number | null;
  video?: string | null;
  views?: number;
  contacts?: number;
  quality?: number;
  rank_at?: string | null;
};

export type Building = "new" | "old" | "construction";
export type Condition = "new_renovation" | "renovated" | "old_renovation" | "white_frame" | "black_frame" | "green_frame" | "needs_renovation";
export type Heating = "central" | "gas" | "electric" | "none";
export type Parking = "underground" | "garage" | "yard" | "street" | "none";

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
export const BUILDINGS: Record<Building, L3> = {
  new: { ru: "Новостройка", en: "New building", ka: "ახალი აშენებული" },
  old: { ru: "Старый фонд", en: "Old building", ka: "ძველი აშენებული" },
  construction: { ru: "Строится", en: "Under construction", ka: "მშენებარე" },
};
export const CONDITIONS: Record<Condition, L3> = {
  new_renovation: { ru: "Свежий ремонт", en: "Newly renovated", ka: "ახალი გარემონტებული" },
  renovated: { ru: "С ремонтом", en: "Renovated", ka: "გარემონტებული" },
  old_renovation: { ru: "Старый ремонт", en: "Old renovation", ka: "ძველი რემონტი" },
  white_frame: { ru: "Белый каркас", en: "White frame", ka: "თეთრი კარკასი" },
  black_frame: { ru: "Чёрный каркас", en: "Black frame", ka: "შავი კარკასი" },
  green_frame: { ru: "Зелёный каркас", en: "Green frame", ka: "მწვანე კარკასი" },
  needs_renovation: { ru: "Нужен ремонт", en: "Needs renovation", ka: "სარემონტო" },
};
export const HEATINGS: Record<Heating, L3> = {
  central: { ru: "Центральное", en: "Central", ka: "ცენტრალური" },
  gas: { ru: "Газовый котёл", en: "Gas boiler", ka: "გაზის ქვაბი" },
  electric: { ru: "Электрическое", en: "Electric", ka: "ელექტრო" },
  none: { ru: "Нет", en: "None", ka: "არ არის" },
};
export const PARKINGS: Record<Parking, L3> = {
  underground: { ru: "Подземный паркинг", en: "Underground", ka: "მიწისქვეშა" },
  garage: { ru: "Гараж", en: "Garage", ka: "ავტოფარეხი" },
  yard: { ru: "Во дворе", en: "In the yard", ka: "ეზოში" },
  street: { ru: "На улице", en: "On the street", ka: "ქუჩაში" },
  none: { ru: "Нет", en: "None", ka: "არ არის" },
};
/** Удобства: эмодзи и подписи. Порядок — как показываем. */
export const AMENITIES: Record<string, { e: string } & L3> = {
  sea_view: { e: "🌊", ru: "Вид на море", en: "Sea view", ka: "ზღვის ხედი" },
  mountain_view: { e: "⛰", ru: "Вид на горы", en: "Mountain view", ka: "მთის ხედი" },
  city_view: { e: "🏙", ru: "Вид на город", en: "City view", ka: "ქალაქის ხედი" },
  balcony: { e: "🪴", ru: "Балкон", en: "Balcony", ka: "აივანი" },
  elevator: { e: "🛗", ru: "Лифт", en: "Elevator", ka: "ლიფტი" },
  furniture: { e: "🛋", ru: "Мебель", en: "Furniture", ka: "ავეჯი" },
  appliances: { e: "🧺", ru: "Техника", en: "Appliances", ka: "ტექნიკა" },
  ac: { e: "❄️", ru: "Кондиционер", en: "Air conditioning", ka: "კონდიციონერი" },
  internet: { e: "📶", ru: "Интернет", en: "Internet", ka: "ინტერნეტი" },
  washer: { e: "🫧", ru: "Стиральная машина", en: "Washing machine", ka: "სარეცხი მანქანა" },
  dishwasher: { e: "🍽", ru: "Посудомойка", en: "Dishwasher", ka: "ჭურჭლის სარეცხი" },
  oven: { e: "🔥", ru: "Духовка / плита", en: "Oven / stove", ka: "ღუმელი" },
  storage: { e: "📦", ru: "Кладовка", en: "Storage room", ka: "სათავსო" },
  pool: { e: "🏊", ru: "Бассейн", en: "Pool", ka: "აუზი" },
  gym: { e: "🏋️", ru: "Спортзал", en: "Gym", ka: "სპორტდარბაზი" },
  security: { e: "🛡", ru: "Охрана / консьерж", en: "Security / concierge", ka: "დაცვა" },
  fireplace: { e: "🪵", ru: "Камин", en: "Fireplace", ka: "ბუხარი" },
  garden: { e: "🌳", ru: "Сад / двор", en: "Garden / yard", ka: "ეზო / ბაღი" },
  pets_ok: { e: "🐾", ru: "Можно с животными", en: "Pets allowed", ka: "შინაური ცხოველებით" },
  kids_ok: { e: "🧸", ru: "Можно с детьми", en: "Kids welcome", ka: "ბავშვებით" },
};

/** Цена за м² (для продажи) — округлённо. */
export function pricePerM2(l: Pick<Listing, "price" | "area" | "currency" | "deal">): string | null {
  if (l.deal !== "sale" || !l.price || !l.area || l.area < 5) return null;
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(l.price / l.area))} ${CUR_SIGN[l.currency]}/м²`;
}

/** Этаж словами: «7 из 25» (новые поля) или как было записано («7/25»). */
export function floorLabel(l: Pick<Listing, "floor" | "floor_n" | "floors_total">, lang: Locale): string | null {
  if (l.floor_n != null) return l.floors_total ? `${l.floor_n} ${{ ru: "из", en: "of", ka: "/" }[lang]} ${l.floors_total}` : String(l.floor_n);
  return l.floor || null;
}

/**
 * Заполненность объявления 0–100 и чего не хватает (подсказки в редакторе).
 * Полные объявления выше в списке (rank_at — как будто опубликованы на сутки-двое позже).
 */
export const QUALITY_PARTS: { k: string; w: number; ok: (l: Partial<Listing>) => boolean; tip: L3 }[] = [
  { k: "photos5", w: 20, ok: (l) => (l.photos?.length ?? 0) >= 5, tip: { ru: "5+ фото (сейчас меньше)", en: "5+ photos", ka: "5+ ფოტო" } },
  { k: "price", w: 10, ok: (l) => !!l.price, tip: { ru: "Цена", en: "Price", ka: "ფასი" } },
  { k: "area", w: 8, ok: (l) => !!l.area, tip: { ru: "Площадь", en: "Area", ka: "ფართი" } },
  { k: "rooms", w: 6, ok: (l) => l.rooms != null || l.kind === "land" || l.kind === "commercial", tip: { ru: "Спальни", en: "Bedrooms", ka: "საძინებლები" } },
  { k: "floor", w: 5, ok: (l) => l.floor_n != null || !!l.floor || l.kind === "land" || l.kind === "house", tip: { ru: "Этаж", en: "Floor", ka: "სართული" } },
  { k: "district", w: 6, ok: (l) => !!l.district, tip: { ru: "Район", en: "District", ka: "რაიონი" } },
  { k: "map", w: 10, ok: (l) => l.lat != null && l.lng != null, tip: { ru: "Точка на карте", en: "Map pin", ka: "წერტილი რუკაზე" } },
  { k: "condition", w: 6, ok: (l) => !!l.condition || l.kind === "land", tip: { ru: "Состояние (ремонт)", en: "Condition", ka: "მდგომარეობა" } },
  { k: "building", w: 4, ok: (l) => !!l.building || l.kind === "land", tip: { ru: "Тип дома", en: "Building type", ka: "შენობის ტიპი" } },
  { k: "amenities", w: 10, ok: (l) => (l.amenities?.length ?? 0) >= 3 || l.kind === "land", tip: { ru: "3+ удобства (мебель, балкон…)", en: "3+ amenities", ka: "3+ კომფორტი" } },
  { k: "desc", w: 10, ok: (l) => (l.description ?? "").trim().length >= 150, tip: { ru: "Описание от 150 знаков", en: "Description 150+ chars", ka: "აღწერა 150+ სიმბოლო" } },
  { k: "extra", w: 5, ok: (l) => l.heating != null || l.parking != null || l.bathrooms != null || l.kind === "land", tip: { ru: "Отопление, парковка или санузлы", en: "Heating, parking or bathrooms", ka: "გათბობა, პარკინგი ან სველი წერტილები" } },
];
export function listingQuality(l: Partial<Listing>): { percent: number; missing: string[] } {
  let s = 0;
  const missing: string[] = [];
  for (const p of QUALITY_PARTS) {
    if (p.ok(l)) s += p.w;
    else missing.push(p.k);
  }
  return { percent: Math.min(100, s), missing };
}
/** Время для порядка в списке: момент публикации/продления + до 48 часов за заполненность. */
export function rankAt(baseIso: string, quality: number): string {
  return new Date(Date.parse(baseIso) + (Math.max(0, Math.min(100, quality)) / 100) * 48 * 3600_000).toISOString();
}

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
  // Подробности, если они есть в тексте
  const fpair = low.match(/(\d{1,2})\s*\/\s*(\d{1,2})\s*(?:-?\s*(?:й|ой|ий)?\s*)?(?:этаж|floor|სართულ)?/);
  const floor_n = fpair ? Number(fpair[1]) : floor && /^\d+$/.test(floor) ? Number(floor) : null;
  const floors_total = fpair ? Number(fpair[2]) : (low.match(/(\d{1,2})\s*-?\s*этажн/) ? Number(low.match(/(\d{1,2})\s*-?\s*этажн/)![1]) : null);
  const building: Building | null = /новостро|new building|ახალ(ი)? აშენებ/.test(low) ? "new" : /строящ|under construction|მშენებარე/.test(low) ? "construction" : /старый фонд|old building|ძველი აშენებ/.test(low) ? "old" : null;
  const condition: Condition | null = /белый каркас|white frame|თეთრი კარკას/.test(low) ? "white_frame" : /ч[её]рный каркас|black frame|შავი კარკას/.test(low) ? "black_frame" : /зел[её]ный каркас|green frame|მწვანე კარკას/.test(low) ? "green_frame" : /(свежий|новый|евро)\s*ремонт|newly renovated|ახალი რემონტ/.test(low) ? "new_renovation" : /(с ремонтом|отремонтир|renovated|გარემონტებ)/.test(low) ? "renovated" : null;
  const heating: Heating | null = /центральн\S* отоплен|central heating|ცენტრალური გათბობ/.test(low) ? "central" : /(газов\S* котел|газов\S* котёл|gas boiler|ქვაბი)/.test(low) ? "gas" : null;
  const parking: Parking | null = /подземн\S* (паркинг|парковк)|underground parking|მიწისქვეშა პარკ/.test(low) ? "underground" : /(паркинг|парковк|parking|პარკინგ)/.test(low) ? "yard" : null;
  const AM: [string, RegExp][] = [
    ["sea_view", /вид на море|sea view|ზღვის ხედ/], ["mountain_view", /вид на горы|mountain view|მთის ხედ/], ["city_view", /вид на город|city view/],
    ["balcony", /балкон|лодж|терраса|balcony|terrace|აივან/], ["elevator", /лифт|elevator|ლიფტ/], ["furniture", /мебел|furnished|furniture|ავეჯ/],
    ["appliances", /техник|appliances|ტექნიკ/], ["ac", /кондиционер|сплит|air ?con|კონდიციონ/], ["internet", /интернет|wi-?fi|internet|ინტერნეტ/],
    ["washer", /стиральн|washing machine|სარეცხი მანქანა/], ["dishwasher", /посудомо|dishwasher/], ["oven", /духовк|плит[аы]|oven|stove|ღუმელ/],
    ["storage", /кладов|storage/], ["pool", /бассейн|pool|აუზ/], ["gym", /спортзал|фитнес|\bgym\b/], ["security", /охран|консьерж|security|concierge|დაცვა/],
    ["fireplace", /камин|fireplace|ბუხარ/], ["garden", /\bсад\b|двор|garden|yard|ეზო/], ["pets_ok", /(можно )?с животн|pets? (allowed|ok)|ცხოველ/], ["kids_ok", /можно с детьми|kids welcome/],
  ];
  const amenities = AM.filter(([, re]) => re.test(low)).map(([k]) => k);
  const bm = low.match(/(\d)\s*(?:сан\.?\s*узл|санузл|bathroom|სველი წერტ)/);
  const bathrooms = bm ? Number(bm[1]) : null;
  const dm = t.match(/(?:депозит|залог|deposit)\D{0,12}(\d[\d ]{1,7})/i);
  const deposit = dm ? Number(dm[1].replace(/\s/g, "")) || null : null;
  return { deal, kind, rooms, area, floor, price, currency, city, district, title, looksLikeListing, floor_n, floors_total, building, condition, heating, parking, amenities, bathrooms, deposit };
}

/** Заголовок, если в тексте его нет: «Аренда · 2 спальни · 65 м² · Новый бульвар». */
export function autoTitle(l: Pick<Listing, "deal" | "kind" | "rooms" | "area" | "district">, lang: Locale): string {
  return [DEALS[l.deal][lang], l.kind === "apartment" ? roomsLabel(l.rooms, lang) : KINDS[l.kind][lang], l.area ? `${l.area} м²` : "", l.district ?? ""].filter(Boolean).join(" · ");
}
