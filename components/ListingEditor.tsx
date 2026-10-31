"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Save, Search, Sparkles, Star, Trash2 } from "lucide-react";
import { resizeImage } from "@/lib/image-resize";
import {
  AMENITIES,
  BUILDINGS,
  CONDITIONS,
  CUR_SIGN,
  DEALS,
  DISTRICTS,
  HEATINGS,
  KINDS,
  MAX_PHOTOS,
  PARKINGS,
  QUALITY_PARTS,
  autoTitle,
  fillTemplate,
  listingQuality,
  TEMPLATE_TOKENS,
  TOKEN_RE,
  parseListingText,
  pricePerM2,
  type Listing,
} from "@/lib/realty";
import { CITIES, cityLabel } from "@/lib/cities";
import { Map } from "./map/Map";
import { DropZone } from "./DropZone";
import type { Locale } from "@/lib/i18n";

const T = {
  ru: {
    back: "К моим объявлениям",
    tplStart: "📋 Начать с шаблона",
    tplHint: "Шаблон заполняет текст, район, удобства и подпись. Остаётся добавить фото и цену.",
    tplActive: (n: string) => `Шаблон «${n}». Слова в фигурных скобках — {цена}, {этаж} — заменятся значениями из полей ниже.`,
    preview: "Так увидят клиенты (значения из полей подставлены):",
    tokens: "Вставить в текст:",
    tplSave: "Сохранить как шаблон",
    tplShort: "Шаблон",
    tplName: "Название шаблона",
    tplNamePh: "Например: Аренда — Новый бульвар",
    tplSaved: (n: string) => `✓ Шаблон «${n}» сохранён`,
    tplLimit: "Можно хранить до 10 шаблонов — удалите ненужный в списке объявлений.",
    tplOk: "Сохранить",
    tplCancel: "Отмена",
    unfilled: (x: string) => `Заполните поля, которые есть в тексте: ${x}`,
    newTitle: "Новое объявление",
    editTitle: "Редактирование объявления",
    quality: (p: number) => `Объявление заполнено на ${p}%`,
    qualityHint: "Чем полнее объявление, тем выше оно в списке и тем чаще звонят. Не хватает:",
    qualityFull: "Отлично — объявление заполнено полностью.",
    s1: "1. Текст объявления",
    s1hint: "Вставьте готовый текст (например, из своего Telegram-канала) и нажмите «Заполнить из текста» — мы сами расставим цену, комнаты, этаж, ремонт, удобства и район. Потом проверьте поля ниже.",
    descPh: "Например: Сдаётся 2 спальни на Новом бульваре, 15/30 этаж, 78 м², свежий ремонт, вид на море, мебель и техника. 900$ в месяц, депозит 900.",
    fill: "Заполнить из текста",
    filled: (n: number) => `Заполнили полей: ${n}. Проверьте их ниже.`,
    s2: "2. Фото",
    s2hint: "Первое фото — обложка. Лучше 5–12 фото при дневном свете: комнаты, кухня, санузел, вид, дом снаружи.",
    addPhotos: "+ Добавить фото",
    uploading: (a: number, b: number) => `Загружаем ${a} из ${b}…`,
    cover: "обложка",
    makeCover: "Сделать обложкой",
    s3: "3. Сделка и тип",
    s4: "4. Где находится",
    city: "Город",
    district: "Район",
    address: "Адрес",
    addressPh: "ул. Руставели, 12",
    find: "Найти на карте",
    notFound: "Адрес не нашли — поставьте точку на карте вручную.",
    pin: "Нажмите на карту, чтобы поставить точку. Точный номер дома клиентам не показываем — только район и точку.",
    s5: "5. Параметры",
    bedrooms: "Спальни",
    studio: "Студия",
    roomsTotal: "Комнат всего",
    area: "Площадь, м²",
    floor: "Этаж",
    floorsTotal: "Этажей в доме",
    bathrooms: "Санузлы",
    s6: "6. Дом и состояние",
    building: "Дом",
    condition: "Состояние",
    heating: "Отопление",
    parking: "Парковка",
    s7: "7. Удобства",
    s8: "8. Цена",
    price: "Цена",
    perMonth: "в месяц",
    perNight: "за сутки",
    deposit: "Депозит",
    minMonths: "Минимальный срок, мес.",
    s9: "9. Заголовок и видео",
    title: "Заголовок",
    autoTitle: "Составить автоматически",
    video: "Видео (YouTube, Instagram, TikTok)",
    publish: "Опубликовать",
    save: "Сохранить изменения",
    draft: "Черновик",
    needPhoto: "Добавьте хотя бы одно фото",
    any: "—",
  },
  en: {
    back: "Back to my listings",
    tplStart: "📋 Start from a template",
    tplHint: "A template fills the text, district, amenities and signature. Just add photos and the price.",
    tplActive: (n: string) => `Template “${n}”. Words in braces — {цена}, {этаж} — are replaced with the field values below.`,
    preview: "What clients will see (field values filled in):",
    tokens: "Insert into text:",
    tplSave: "Save as template",
    tplShort: "Template",
    tplName: "Template name",
    tplNamePh: "E.g.: Rent — New Boulevard",
    tplSaved: (n: string) => `✓ Template “${n}” saved`,
    tplLimit: "You can keep up to 10 templates — delete one in the listings list.",
    tplOk: "Save",
    tplCancel: "Cancel",
    unfilled: (x: string) => `Fill in the fields used in the text: ${x}`,
    newTitle: "New listing",
    editTitle: "Edit listing",
    quality: (p: number) => `Listing ${p}% complete`,
    qualityHint: "The more complete the listing, the higher it is in the list and the more calls you get. Missing:",
    qualityFull: "Great — the listing is complete.",
    s1: "1. Listing text",
    s1hint: "Paste your ready text (e.g. from Telegram) and press “Fill from text” — we'll fill in price, rooms, floor, condition, amenities and district. Then check the fields below.",
    descPh: "E.g.: 2-bedroom for rent on New Boulevard, floor 15/30, 78 m², newly renovated, sea view, furniture and appliances. $900/month, deposit 900.",
    fill: "Fill from text",
    filled: (n: number) => `Filled ${n} fields. Please check them below.`,
    s2: "2. Photos",
    s2hint: "The first photo is the cover. 5–12 daylight photos work best: rooms, kitchen, bathroom, view, building outside.",
    addPhotos: "+ Add photos",
    uploading: (a: number, b: number) => `Uploading ${a} of ${b}…`,
    cover: "cover",
    makeCover: "Make cover",
    s3: "3. Deal and type",
    s4: "4. Location",
    city: "City",
    district: "District",
    address: "Address",
    addressPh: "12 Rustaveli St.",
    find: "Find on map",
    notFound: "Address not found — place the pin manually.",
    pin: "Tap the map to place the pin. We don't show the exact house number — only the district and the pin.",
    s5: "5. Details",
    bedrooms: "Bedrooms",
    studio: "Studio",
    roomsTotal: "Total rooms",
    area: "Area, m²",
    floor: "Floor",
    floorsTotal: "Floors in building",
    bathrooms: "Bathrooms",
    s6: "6. Building and condition",
    building: "Building",
    condition: "Condition",
    heating: "Heating",
    parking: "Parking",
    s7: "7. Amenities",
    s8: "8. Price",
    price: "Price",
    perMonth: "per month",
    perNight: "per night",
    deposit: "Deposit",
    minMonths: "Minimum term, months",
    s9: "9. Title and video",
    title: "Title",
    autoTitle: "Generate",
    video: "Video (YouTube, Instagram, TikTok)",
    publish: "Publish",
    save: "Save changes",
    draft: "Save draft",
    needPhoto: "Add at least one photo",
    any: "—",
  },
  ka: {
    back: "ჩემს განცხადებებზე",
    tplStart: "📋 შაბლონით დაწყება",
    tplHint: "შაბლონი ავსებს ტექსტს, რაიონს, კომფორტს და ხელმოწერას. დარჩება ფოტო და ფასი.",
    tplActive: (n: string) => `შაბლონი «${n}»: ველების მნიშვნელობები ტექსტში თავად ჩაისმება.`,
    preview: "ასე დაინახავენ კლიენტები:",
    tokens: "ტექსტში ჩასმა:",
    tplSave: "შაბლონად შენახვა",
    tplShort: "შაბლონი",
    tplName: "შაბლონის სახელი",
    tplNamePh: "მაგ.: ქირა — ახალი ბულვარი",
    tplSaved: (n: string) => `✓ შაბლონი «${n}» შენახულია`,
    tplLimit: "შეიძლება 10 შაბლონამდე — წაშალეთ ზედმეტი სიაში.",
    tplOk: "შენახვა",
    tplCancel: "გაუქმება",
    unfilled: (x: string) => `შეავსეთ ტექსტში გამოყენებული ველები: ${x}`,
    newTitle: "ახალი განცხადება",
    editTitle: "განცხადების რედაქტირება",
    quality: (p: number) => `განცხადება შევსებულია ${p}%-ით`,
    qualityHint: "რაც უფრო სრულია განცხადება, მით უფრო მაღლაა სიაში. აკლია:",
    qualityFull: "შესანიშნავია — განცხადება სრულადაა შევსებული.",
    s1: "1. განცხადების ტექსტი",
    s1hint: "ჩასვით მზა ტექსტი და დააჭირეთ «ტექსტიდან შევსებას» — ჩვენ შევავსებთ ფასს, ოთახებს, სართულს, მდგომარეობას, კომფორტს და რაიონს.",
    descPh: "მაგ.: ქირავდება 2 საძინებელი ახალ ბულვარზე, 15/30 სართული, 78 მ², ახალი რემონტი, ზღვის ხედი. 900$ თვეში.",
    fill: "ტექსტიდან შევსება",
    filled: (n: number) => `შევსებულია ${n} ველი. შეამოწმეთ ქვემოთ.`,
    s2: "2. ფოტოები",
    s2hint: "პირველი ფოტო — ყდა. საუკეთესოა 5–12 ფოტო დღის შუქზე.",
    addPhotos: "+ ფოტოს დამატება",
    uploading: (a: number, b: number) => `იტვირთება ${a} / ${b}…`,
    cover: "ყდა",
    makeCover: "ყდად დაყენება",
    s3: "3. გარიგება და ტიპი",
    s4: "4. მდებარეობა",
    city: "ქალაქი",
    district: "რაიონი",
    address: "მისამართი",
    addressPh: "რუსთაველის ქ. 12",
    find: "რუკაზე პოვნა",
    notFound: "მისამართი ვერ მოიძებნა — დასვით წერტილი ხელით.",
    pin: "დააჭირეთ რუკას წერტილის დასასმელად. ზუსტ ნომერს არ ვაჩვენებთ.",
    s5: "5. პარამეტრები",
    bedrooms: "საძინებელი",
    studio: "სტუდიო",
    roomsTotal: "ოთახები სულ",
    area: "ფართი, მ²",
    floor: "სართული",
    floorsTotal: "სართულიანობა",
    bathrooms: "სველი წერტილები",
    s6: "6. შენობა და მდგომარეობა",
    building: "შენობა",
    condition: "მდგომარეობა",
    heating: "გათბობა",
    parking: "პარკინგი",
    s7: "7. კომფორტი",
    s8: "8. ფასი",
    price: "ფასი",
    perMonth: "თვეში",
    perNight: "დღეში",
    deposit: "დეპოზიტი",
    minMonths: "მინიმალური ვადა, თვე",
    s9: "9. სათაური და ვიდეო",
    title: "სათაური",
    autoTitle: "ავტომატურად",
    video: "ვიდეო (YouTube, Instagram, TikTok)",
    publish: "გამოქვეყნება",
    save: "ცვლილებების შენახვა",
    draft: "მონახაზის შენახვა",
    needPhoto: "დაამატეთ ერთი ფოტო მაინც",
    any: "—",
  },
} as const;

type F = {
  title: string;
  deal: Listing["deal"];
  kind: Listing["kind"];
  rooms: string;
  rooms_total: string;
  area: string;
  floor_n: string;
  floors_total: string;
  bathrooms: string;
  building: string;
  condition: string;
  heating: string;
  parking: string;
  amenities: string[];
  price: string;
  currency: Listing["currency"];
  deposit: string;
  min_months: string;
  city: string;
  district: string;
  address: string;
  lat: number | null;
  lng: number | null;
  description: string;
  video: string;
};

const s = (v: number | null | undefined) => (v == null ? "" : String(v));

function fromListing(l: Listing | null | undefined, city: string): F {
  // старые объявления: этаж был текстом «7/25»
  const fm = l?.floor?.match(/^(\d{1,3})(?:\s*\/\s*(\d{1,3}))?/);
  return {
    title: l?.title ?? "",
    deal: l?.deal ?? "rent",
    kind: l?.kind ?? "apartment",
    rooms: s(l?.rooms),
    rooms_total: s(l?.rooms_total),
    area: s(l?.area),
    floor_n: l?.floor_n != null ? String(l.floor_n) : fm?.[1] ?? "",
    floors_total: l?.floors_total != null ? String(l.floors_total) : fm?.[2] ?? "",
    bathrooms: s(l?.bathrooms),
    building: l?.building ?? "",
    condition: l?.condition ?? "",
    heating: l?.heating ?? "",
    parking: l?.parking ?? "",
    amenities: l?.amenities ?? [],
    price: s(l?.price),
    currency: l?.currency ?? "USD",
    deposit: s(l?.deposit),
    min_months: s(l?.min_months),
    city: l?.city ?? city,
    district: l?.district ?? "",
    address: l?.address ?? "",
    lat: l?.lat ?? null,
    lng: l?.lng ?? null,
    description: l?.description ?? "",
    video: l?.video ?? "",
  };
}

/** Кнопки-варианты вместо выпадающих списков: быстрее на телефоне. */
function Chips<K extends string>({ value, onChange, items, allowEmpty = true }: { value: string; onChange: (v: K | "") => void; items: [K, string][]; allowEmpty?: boolean }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {items.map(([k, label]) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(value === k && allowEmpty ? "" : k)}
          className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${value === k ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-line bg-white p-4 sm:p-5">
      <h3 className="text-[17px] font-bold">{title}</h3>
      {hint && <p className="mt-1 text-[13px] leading-relaxed text-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

const SECTION_OF: Record<string, string> = { photos5: "le-photos", price: "le-price", area: "le-params", rooms: "le-params", floor: "le-params", district: "le-where", map: "le-where", condition: "le-house", building: "le-house", amenities: "le-amen", desc: "le-text", extra: "le-house" };

/** Форма объявления в кабинете риелтора — подробные параметры, карта, удобства, заполненность. */
export type EditorTemplate = { id: string; name: string; data: Record<string, unknown> };

export function ListingEditor({
  lang,
  initial,
  defaultCity,
  templates = [],
  startTemplate = null,
}: {
  lang: Locale;
  initial?: Listing | null;
  defaultCity: string;
  templates?: EditorTemplate[];
  /** «Новое по шаблону» из списка шаблонов */
  startTemplate?: string | null;
}) {
  const t = T[lang];
  const router = useRouter();
  const [f, setF] = useState<F>(() => fromListing(initial, defaultCity));
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [upload, setUpload] = useState<[number, number] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [filledMsg, setFilledMsg] = useState("");
  // Шаблон: в тексте и заголовке могут быть подстановки ({цена}, {этаж}…) — клиенты увидят уже подставленные значения
  const [tplName0, setTplName0] = useState<string | null>(null);
  const [tplOpen, setTplOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplMsg, setTplMsg] = useState("");
  const [myTpl, setMyTpl] = useState(templates);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const cityCenter = (id: string) => (CITIES.find((c) => c.id === id)?.center as unknown as [number, number] | undefined) ?? null;
  const [focus, setFocus] = useState<[number, number] | null>(() => (initial?.lat != null ? null : cityCenter(initial?.city ?? defaultCity)));
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof F>(k: K, v: F[K]) => setF((x) => ({ ...x, [k]: v }));
  const inp = (k: keyof F) => ({ value: String(f[k] ?? ""), onChange: (e: { target: { value: string } }) => set(k, e.target.value as never) });

  const asListing = useMemo(
    () =>
      ({
        ...f,
        rooms: f.rooms === "" ? null : Number(f.rooms),
        area: Number(f.area) || null,
        price: Number(f.price) || null,
        floor_n: f.floor_n === "" ? null : Number(f.floor_n),
        bathrooms: f.bathrooms === "" ? null : Number(f.bathrooms),
        heating: f.heating || null,
        parking: f.parking || null,
        building: f.building || null,
        condition: f.condition || null,
        photos,
      }) as unknown as Partial<Listing>,
    [f, photos],
  );
  const q = listingQuality(asListing);
  const perM2 = pricePerM2({ price: Number(f.price) || null, area: Number(f.area) || null, currency: f.currency, deal: f.deal });

  const finalDesc = fillTemplate(f.description, f, lang);
  const finalTitle = fillTemplate(f.title, f, lang);
  const hasTokens = /\{[а-яё]+\}/i.test(f.description + f.title);

  function applyTemplate(t0: EditorTemplate) {
    const d = t0.data as Partial<Record<keyof F, unknown>>;
    setF((x) => {
      const next = { ...x };
      for (const [k, v] of Object.entries(d)) {
        if (!(k in next) || v == null) continue;
        if (k === "amenities") next.amenities = Array.isArray(v) ? (v as string[]) : [];
        else if (k === "lat" || k === "lng") (next as Record<string, unknown>)[k] = typeof v === "number" ? v : null;
        else (next as Record<string, unknown>)[k] = String(v);
      }
      return next;
    });
    setTplName0(t0.name);
    if (typeof d.lat === "number" && typeof d.lng === "number") setFocus([d.lat, d.lng]);
  }

  const started = useRef(false);
  useEffect(() => {
    if (started.current || !startTemplate || initial) return;
    started.current = true;
    const x = templates.find((y) => y.id === startTemplate);
    if (x) applyTemplate(x);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function insertToken(tok: string) {
    const el = descRef.current;
    const pos = el ? el.selectionStart : f.description.length;
    const text = f.description.slice(0, pos) + tok + f.description.slice(pos);
    set("description", text);
    // курсор — сразу после вставленного, чтобы печатать дальше
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos + tok.length, pos + tok.length);
    });
  }

  async function saveAsTemplate() {
    const name = tplName.trim();
    if (name.length < 2) return;
    // в шаблон — исходный текст с подстановками (если шаблон уже был) и типовые поля; фото — нет
    const data = { ...f };
    const r = await fetch("/api/realty/template", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, data }) })
      .then((x) => x.json())
      .catch(() => null);
    if (r?.ok) {
      setMyTpl((l) => [...l, r.template]);
      setTplMsg(t.tplSaved(name));
      setTplOpen(false);
      setTplName("");
    } else setTplMsg(r?.error === "limit" ? t.tplLimit : "Error");
  }

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setErr("");
    const files = Array.from(list).slice(0, MAX_PHOTOS - photos.length);
    const out = [...photos];
    for (const [i, file] of files.entries()) {
      setUpload([i + 1, files.length]);
      const fd = new FormData();
      fd.append("photo", await resizeImage(file));
      const r = await fetch("/api/realty/photo", { method: "POST", body: fd }).then((x) => x.json()).catch(() => null);
      if (r?.ok) {
        out.push(r.url);
        setPhotos([...out]);
      } else setErr(r?.error ?? "Error");
    }
    setUpload(null);
    if (fileRef.current) fileRef.current.value = "";
  }
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= photos.length) return;
    const p = [...photos];
    [p[i], p[j]] = [p[j], p[i]];
    setPhotos(p);
  };

  function fillFromText() {
    const p = parseListingText(f.description, { city: f.city });
    const next: F = { ...f };
    let n = 0;
    const put = <K extends keyof F>(k: K, v: F[K] | null | undefined, empty = true) => {
      if (v == null || v === "" || (empty && f[k] !== "" && f[k] != null && !(Array.isArray(f[k]) && !(f[k] as unknown[]).length))) return;
      next[k] = v;
      n++;
    };
    put("title", p.title);
    if (p.deal) put("deal", p.deal, false);
    put("kind", p.kind, false);
    put("rooms", p.rooms != null ? String(p.rooms) : null);
    put("area", p.area ? String(p.area) : null);
    put("floor_n", p.floor_n != null ? String(p.floor_n) : null);
    put("floors_total", p.floors_total ? String(p.floors_total) : null);
    put("bathrooms", p.bathrooms != null ? String(p.bathrooms) : null);
    put("building", p.building);
    put("condition", p.condition);
    put("heating", p.heating);
    put("parking", p.parking);
    if (p.amenities.length) {
      next.amenities = [...new Set([...f.amenities, ...p.amenities])];
      n++;
    }
    if (p.price) {
      next.price = String(p.price);
      next.currency = p.currency;
      n++;
    }
    put("deposit", p.deposit ? String(p.deposit) : null);
    put("city", p.city, false);
    put("district", p.district);
    setF(next);
    setFilledMsg(t.filled(n));
  }

  async function findAddress() {
    if (!f.address.trim()) return;
    setSearching(true);
    setNotFound(false);
    const full = `${f.address}, ${cityLabel(f.city, "ru")}`;
    const j = await fetch(`/api/geocode?lang=${lang}&q=${encodeURIComponent(full)}`)
      .then((r) => r.json())
      .catch(() => ({}));
    setSearching(false);
    if (j.ok) {
      setF((x) => ({ ...x, lat: j.lat, lng: j.lng }));
      setFocus([j.lat, j.lng]);
    } else setNotFound(true);
  }

  async function save(publish: boolean) {
    const left = [...new Set([...finalDesc.matchAll(TOKEN_RE), ...finalTitle.matchAll(TOKEN_RE)].map((m) => m[0]))];
    if (publish && left.length) return setErr(t.unfilled(left.join(", ")));
    if (publish && !photos.length) {
      document.getElementById("le-photos")?.scrollIntoView({ behavior: "smooth" });
      return setErr(t.needPhoto);
    }
    setBusy(true);
    setErr("");
    const r = await fetch("/api/realty/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, description: finalDesc, title: finalTitle, photos, id: initial?.id, publish }) })
      .then((x) => x.json())
      .catch(() => null);
    setBusy(false);
    if (!r?.ok) return setErr(r?.error ?? "Error");
    router.push(`/${lang}/cabinet?tab=realty&saved=1`);
    router.refresh();
  }

  const fc = "field mt-1.5 h-11 w-full";
  const districts = DISTRICTS[f.city] ?? [];
  const isLand = f.kind === "land";
  const L = <K extends string>(d: Record<K, Record<Locale, string>>) => Object.entries(d).map(([k, v]) => [k, (v as Record<Locale, string>)[lang]]) as [K, string][];
  const qColor = q.percent >= 85 ? "bg-brand" : q.percent >= 55 ? "bg-accent" : "bg-[#e07a5f]";

  return (
    <div className="space-y-4">
      <a href={`/${lang}/cabinet?tab=realty`} className="inline-flex items-center gap-1 text-[14px] text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {t.back}
      </a>
      <h2 className="text-[22px] font-bold">{initial ? t.editTitle : t.newTitle}</h2>
      {myTpl.length > 0 && (
        <div className="rounded-2xl border-2 border-[#f0d58a] bg-[#fffaf0] p-4">
          <p className="text-[15px] font-bold">{t.tplStart}</p>
          <p className="mt-0.5 text-[13px] text-[#5a4410]">{t.tplHint}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {myTpl.map((x) => (
              <button key={x.id} type="button" onClick={() => applyTemplate(x)} className={`rounded-full border px-3.5 py-1.5 text-[14px] font-semibold ${tplName0 === x.name ? "border-brand bg-brand text-white" : "border-[#f0d58a] bg-white hover:border-accent"}`}>
                {x.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Заполненность — липкая полоска сверху */}
      <div className="sticky top-[118px] z-20 rounded-2xl border border-line bg-white/95 p-3.5 shadow-sm backdrop-blur md:top-[124px]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[14px] font-semibold">{t.quality(q.percent)}</p>
          <span className="text-[13px] text-muted">{q.percent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream">
          <div className={`h-full rounded-full transition-all ${qColor}`} style={{ width: `${q.percent}%` }} />
        </div>
        {q.missing.length ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px]">
            <span className="text-muted">{t.qualityHint}</span>
            {q.missing.slice(0, 4).map((k) => (
              <a key={k} href={`#${SECTION_OF[k] ?? "le-text"}`} className="rounded-full bg-[#fdf3dc] px-2 py-0.5 font-medium text-[#6b4f12] hover:underline">
                {QUALITY_PARTS.find((p) => p.k === k)?.tip[lang]}
              </a>
            ))}
            {q.missing.length > 4 && <span className="text-muted">+{q.missing.length - 4}</span>}
          </div>
        ) : (
          <p className="mt-1.5 text-[12px] font-medium text-brand">{t.qualityFull}</p>
        )}
      </div>

      <Section id="le-text" title={t.s1} hint={t.s1hint}>
        {tplName0 && <p className="mb-2 rounded-xl bg-brand-soft px-3 py-2 text-[13px] text-brand-dark">{t.tplActive(tplName0)}</p>}
        <textarea
          ref={descRef}
          value={f.description}
          onChange={(e) => set("description", e.target.value)}
          rows={7}
          maxLength={4000}
          placeholder={t.descPh}
          className="field w-full py-2"
        />
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="text-[12px] text-muted">{t.tokens}</span>
          {TEMPLATE_TOKENS.map((x) => (
            <button key={x.t} type="button" onClick={() => insertToken(x.t)} className="rounded-full border border-line bg-white px-2 py-0.5 text-[12px] hover:border-brand" title={x.t}>
              {x.label[lang]}
            </button>
          ))}
        </div>
        {hasTokens && (
          <div className="mt-3 rounded-xl border border-dashed border-brand/40 bg-cream p-3">
            <p className="text-[12px] font-semibold text-muted">{t.preview}</p>
            {finalTitle && <p className="mt-1 text-[14px] font-bold">{finalTitle}</p>}
            <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed">{finalDesc}</p>
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" onClick={fillFromText} disabled={!f.description.trim()} className="btn h-10 gap-1.5 rounded-full bg-accent px-4 text-[14px] font-semibold text-ink hover:bg-[#cf9620] disabled:opacity-50">
            <Sparkles className="h-4 w-4" /> {t.fill}
          </button>
          {filledMsg && <span className="text-[13px] font-medium text-brand">✓ {filledMsg}</span>}
        </div>
      </Section>

      <Section id="le-photos" title={`${t.s2} · ${photos.length}/${MAX_PHOTOS}`} hint={t.s2hint}>
        <DropZone onFiles={(f) => addFiles(f)} label={lang === "ka" ? "გაუშვით — ავტვირთავთ" : lang === "en" ? "Drop to upload" : "Отпустите — загрузим фото"}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {photos.map((u, i) => (
            <div key={u} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">★ {t.cover}</span>}
              <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1">
                <span className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-full bg-white/90 p-1 disabled:opacity-30" aria-label="←">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} className="rounded-full bg-white/90 p-1 disabled:opacity-30" aria-label="→">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </span>
                <span className="flex gap-1">
                  {i > 0 && (
                    <button type="button" onClick={() => setPhotos([u, ...photos.filter((x) => x !== u)])} className="rounded-full bg-white/90 p-1" title={t.makeCover} aria-label={t.makeCover}>
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button type="button" onClick={() => setPhotos(photos.filter((x) => x !== u))} className="rounded-full bg-white/90 p-1" aria-label="delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button type="button" disabled={!!upload} onClick={() => fileRef.current?.click()} className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-[13px] text-muted hover:border-brand">
              {upload ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t.uploading(upload[0], upload[1])}
                </>
              ) : (
                t.addPhotos
              )}
            </button>
          )}
        </div>
        </DropZone>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
      </Section>

      <Section id="le-deal" title={t.s3}>
        <Chips value={f.deal} onChange={(v) => v && set("deal", v)} items={L(DEALS)} allowEmpty={false} />
        <Chips value={f.kind} onChange={(v) => v && set("kind", v)} items={L(KINDS)} allowEmpty={false} />
      </Section>

      <Section id="le-where" title={t.s4}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[14px] font-medium">
            {t.city}
            <select
              value={f.city}
              onChange={(e) => {
                const c = e.target.value;
                setF((x) => ({ ...x, city: c, district: "" }));
                if (f.lat == null) setFocus(cityCenter(c));
              }}
              className={fc}
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label[lang]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[14px] font-medium">
            {t.district}
            {districts.length ? (
              <select {...inp("district")} className={fc}>
                <option value="">{t.any}</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            ) : (
              <input {...inp("district")} maxLength={60} className={fc} />
            )}
          </label>
        </div>
        <label className="mt-3 block text-[14px] font-medium">
          {t.address}
          <span className="mt-1.5 flex gap-2">
            <input
              {...inp("address")}
              maxLength={200}
              placeholder={t.addressPh}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  findAddress();
                }
              }}
              className="field h-11 min-w-0 flex-1"
            />
            <button type="button" onClick={findAddress} disabled={searching} className="btn-ghost h-11 shrink-0 px-3 text-[13px]">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} <span className="hidden sm:inline">{t.find}</span>
            </button>
          </span>
        </label>
        {notFound && <p className="mt-1 text-[13px] text-[#8a6a1f]">{t.notFound}</p>}
        <p className="mt-3 text-[13px] text-muted">{t.pin}</p>
        <div className="mt-2">
          <Map height={280} scrollZoom editable={{ value: f.lat != null && f.lng != null ? [f.lat, f.lng] : null, onChange: (lat, lng) => setF((x) => ({ ...x, lat, lng })), focus }} />
        </div>
      </Section>

      {!isLand && (
        <Section id="le-params" title={t.s5}>
          <p className="text-[14px] font-medium">{t.bedrooms}</p>
          <Chips value={f.rooms} onChange={(v) => set("rooms", v)} items={[["0", t.studio], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5+"]]} />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="block text-[14px] font-medium">
              {t.area}
              <input {...inp("area")} inputMode="decimal" className={fc} />
            </label>
            <label className="block text-[14px] font-medium">
              {t.roomsTotal}
              <input {...inp("rooms_total")} inputMode="numeric" className={fc} />
            </label>
            {f.kind !== "house" && (
              <>
                <label className="block text-[14px] font-medium">
                  {t.floor}
                  <input {...inp("floor_n")} inputMode="numeric" className={fc} />
                </label>
                <label className="block text-[14px] font-medium">
                  {t.floorsTotal}
                  <input {...inp("floors_total")} inputMode="numeric" className={fc} />
                </label>
              </>
            )}
          </div>
          <p className="mt-3 text-[14px] font-medium">{t.bathrooms}</p>
          <Chips value={f.bathrooms} onChange={(v) => set("bathrooms", v)} items={[["1", "1"], ["2", "2"], ["3", "3"], ["4", "4+"]]} />
        </Section>
      )}
      {isLand && (
        <Section id="le-params" title={t.s5}>
          <label className="block max-w-[200px] text-[14px] font-medium">
            {t.area}
            <input {...inp("area")} inputMode="decimal" className={fc} />
          </label>
        </Section>
      )}

      {!isLand && (
        <Section id="le-house" title={t.s6}>
          <p className="text-[14px] font-medium">{t.building}</p>
          <Chips value={f.building} onChange={(v) => set("building", v)} items={L(BUILDINGS)} />
          <p className="mt-3 text-[14px] font-medium">{t.condition}</p>
          <Chips value={f.condition} onChange={(v) => set("condition", v)} items={L(CONDITIONS)} />
          <p className="mt-3 text-[14px] font-medium">{t.heating}</p>
          <Chips value={f.heating} onChange={(v) => set("heating", v)} items={L(HEATINGS)} />
          <p className="mt-3 text-[14px] font-medium">{t.parking}</p>
          <Chips value={f.parking} onChange={(v) => set("parking", v)} items={L(PARKINGS)} />
        </Section>
      )}

      {!isLand && (
        <Section id="le-amen" title={`${t.s7} · ${f.amenities.length}`}>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(AMENITIES)
              .filter(([k]) => f.deal !== "sale" || (k !== "pets_ok" && k !== "kids_ok"))
              .map(([k, v]) => {
                const on = f.amenities.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => set("amenities", on ? f.amenities.filter((x) => x !== k) : [...f.amenities, k])}
                    className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${on ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white hover:border-brand"}`}
                  >
                    {v.e} {v[lang]}
                    {on ? " ✓" : ""}
                  </button>
                );
              })}
          </div>
        </Section>
      )}

      <Section id="le-price" title={t.s8}>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-[14px] font-medium">
            {t.price}
            <span className="mt-1.5 flex gap-1">
              <input {...inp("price")} inputMode="numeric" className="field h-11 w-40" />
              <span className="flex overflow-hidden rounded-xl border border-line">
                {(["USD", "GEL", "EUR"] as const).map((c) => (
                  <button key={c} type="button" onClick={() => set("currency", c)} className={`h-11 w-11 text-[15px] font-semibold ${f.currency === c ? "bg-brand text-white" : "bg-white"}`}>
                    {CUR_SIGN[c]}
                  </button>
                ))}
              </span>
            </span>
          </label>
          <span className="pb-3 text-[13px] text-muted">{f.deal === "rent" ? t.perMonth : f.deal === "daily" ? t.perNight : perM2 ?? ""}</span>
        </div>
        {f.deal === "rent" && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-md">
            <label className="block text-[14px] font-medium">
              {t.deposit}
              <input {...inp("deposit")} inputMode="numeric" className={fc} />
            </label>
            <label className="block text-[14px] font-medium">
              {t.minMonths}
              <input {...inp("min_months")} inputMode="numeric" className={fc} />
            </label>
          </div>
        )}
      </Section>

      <Section id="le-title" title={t.s9}>
        <label className="block text-[14px] font-medium">
          {t.title}
          <span className="mt-1.5 flex gap-2">
            <input {...inp("title")} maxLength={120} className="field h-11 min-w-0 flex-1" />
            <button
              type="button"
              onClick={() => set("title", autoTitle({ deal: f.deal, kind: f.kind, rooms: f.rooms === "" ? null : Number(f.rooms), area: Number(f.area) || null, district: f.district || null }, lang))}
              className="btn-ghost h-11 shrink-0 px-3 text-[13px]"
            >
              <Sparkles className="h-4 w-4" /> <span className="hidden sm:inline">{t.autoTitle}</span>
            </button>
          </span>
        </label>
        <label className="mt-3 block text-[14px] font-medium">
          {t.video}
          <input {...inp("video")} inputMode="url" placeholder="https://youtube.com/…" className={fc} />
        </label>
      </Section>

      {err && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{err}</p>}
      <div className="sticky bottom-3 z-20 ml-12 flex flex-wrap items-center gap-1.5 rounded-2xl border border-line bg-white/95 p-1.5 shadow-sm backdrop-blur sm:ml-0 sm:gap-2 sm:p-2.5">
        <button type="button" disabled={busy || !!upload} onClick={() => save(true)} className="btn-primary h-10 whitespace-nowrap px-2.5 text-[13px] sm:h-11 sm:px-6 sm:text-[14px]">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} {initial?.status === "published" ? t.save : t.publish}
        </button>
        {initial?.status !== "published" && (
          <button type="button" disabled={busy || !!upload} onClick={() => save(false)} className="btn-ghost h-10 whitespace-nowrap px-2.5 text-[13px] sm:h-11 sm:px-5 sm:text-[14px]">
            {t.draft}
          </button>
        )}
        <button type="button" onClick={() => setTplOpen((v) => !v)} className="btn-ghost h-10 whitespace-nowrap px-2.5 text-[13px] sm:h-11 sm:px-4 sm:text-[14px]" title={t.tplSave}>
          <Save className="hidden h-4 w-4 sm:block" /> <span className="hidden sm:inline">{t.tplSave}</span>
          <span className="sm:hidden">{t.tplShort}</span>
        </button>
        {tplOpen && (
          <div className="flex w-full flex-wrap items-center gap-2 border-t border-line pt-2">
            <input value={tplName} onChange={(e) => setTplName(e.target.value)} maxLength={60} placeholder={t.tplNamePh} aria-label={t.tplName} className="field h-10 min-w-0 flex-1" />
            <button type="button" onClick={saveAsTemplate} disabled={tplName.trim().length < 2} className="btn-primary h-10 px-4 text-[14px]">
              {t.tplOk}
            </button>
            <button type="button" onClick={() => setTplOpen(false)} className="text-[13px] text-muted underline">
              {t.tplCancel}
            </button>
          </div>
        )}
        {tplMsg && <p className="w-full text-[13px] font-medium text-brand">{tplMsg}</p>}
      </div>
    </div>
  );
}
