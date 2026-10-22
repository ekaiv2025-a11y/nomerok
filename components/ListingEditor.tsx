"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";
import { resizeImage } from "@/lib/image-resize";
import { DEALS, DISTRICTS, KINDS, MAX_PHOTOS, parseListingText, type Listing } from "@/lib/realty";
import { CITIES } from "@/lib/cities";
import type { Locale } from "@/lib/i18n";

const T = {
  ru: { title: "Заголовок", titlePh: "Например: 2 спальни с видом на море, Новый бульвар", deal: "Сделка", kind: "Тип", rooms: "Спальни", studio: "Студия", area: "Площадь, м²", floor: "Этаж", price: "Цена", city: "Город", district: "Район", address: "Адрес (необязательно)", desc: "Описание", descPh: "Расскажите о квартире: ремонт, мебель, техника, вид, условия, депозит…", photos: "Фото", addPhotos: "+ Добавить фото", fill: "Заполнить из текста", fillHint: "Вставьте текст объявления в описание и нажмите — бот найдёт цену, комнаты, площадь и район.", publish: "Опубликовать", draft: "Сохранить черновик", saved: "Сохранено", needPhoto: "Добавьте хотя бы одно фото", first: "главное", cancel: "Отмена" },
  en: { title: "Title", titlePh: "E.g. 2-bedroom with sea view, New Boulevard", deal: "Deal", kind: "Type", rooms: "Bedrooms", studio: "Studio", area: "Area, m²", floor: "Floor", price: "Price", city: "City", district: "District", address: "Address (optional)", desc: "Description", descPh: "Describe the property: renovation, furniture, appliances, view, terms, deposit…", photos: "Photos", addPhotos: "+ Add photos", fill: "Fill from text", fillHint: "Paste your listing text into the description and press — we'll find price, rooms, area and district.", publish: "Publish", draft: "Save draft", saved: "Saved", needPhoto: "Add at least one photo", first: "main", cancel: "Cancel" },
  ka: { title: "სათაური", titlePh: "მაგ.: 2 საძინებელი ზღვის ხედით, ახალი ბულვარი", deal: "გარიგება", kind: "ტიპი", rooms: "საძინებელი", studio: "სტუდიო", area: "ფართი, მ²", floor: "სართული", price: "ფასი", city: "ქალაქი", district: "რაიონი", address: "მისამართი (არასავალდებულო)", desc: "აღწერა", descPh: "აღწერეთ ბინა: რემონტი, ავეჯი, ტექნიკა, ხედი, პირობები, დეპოზიტი…", photos: "ფოტოები", addPhotos: "+ ფოტოს დამატება", fill: "ტექსტიდან შევსება", fillHint: "ჩასვით განცხადების ტექსტი აღწერაში და დააჭირეთ — ვიპოვით ფასს, ოთახებს, ფართს და რაიონს.", publish: "გამოქვეყნება", draft: "მონახაზის შენახვა", saved: "შენახულია", needPhoto: "დაამატეთ ერთი ფოტო მაინც", first: "მთავარი", cancel: "გაუქმება" },
} as const;

type Form = { title: string; deal: string; kind: string; rooms: string; area: string; floor: string; price: string; currency: string; city: string; district: string; address: string; description: string };

/** Форма объявления в кабинете риелтора. */
export function ListingEditor({ lang, initial, defaultCity }: { lang: Locale; initial?: Listing | null; defaultCity: string }) {
  const t = T[lang];
  const router = useRouter();
  const [f, setF] = useState<Form>({
    title: initial?.title ?? "",
    deal: initial?.deal ?? "rent",
    kind: initial?.kind ?? "apartment",
    rooms: initial?.rooms != null ? String(initial.rooms) : "",
    area: initial?.area != null ? String(initial.area) : "",
    floor: initial?.floor ?? "",
    price: initial?.price != null ? String(initial.price) : "",
    currency: initial?.currency ?? "USD",
    city: initial?.city ?? defaultCity,
    district: initial?.district ?? "",
    address: initial?.address ?? "",
    description: initial?.description ?? "",
  });
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    setErr("");
    const out = [...photos];
    for (const file of Array.from(list).slice(0, MAX_PHOTOS - out.length)) {
      const fd = new FormData();
      fd.append("photo", await resizeImage(file));
      const r = await fetch("/api/realty/photo", { method: "POST", body: fd }).then((x) => x.json()).catch(() => null);
      if (r?.ok) out.push(r.url);
      else setErr(r?.error ?? "Error");
    }
    setPhotos(out);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function fillFromText() {
    const p = parseListingText(f.description, { city: f.city });
    setF({
      ...f,
      title: f.title || p.title,
      deal: p.deal ?? f.deal,
      kind: p.kind ?? f.kind,
      rooms: p.rooms != null ? String(p.rooms) : f.rooms,
      area: p.area ? String(p.area) : f.area,
      floor: p.floor ?? f.floor,
      price: p.price ? String(p.price) : f.price,
      currency: p.price ? p.currency : f.currency,
      city: p.city ?? f.city,
      district: p.district ?? f.district,
    });
  }

  async function save(publish: boolean) {
    if (publish && !photos.length) return setErr(t.needPhoto);
    setBusy(true);
    setErr("");
    const r = await fetch("/api/realty/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, photos, id: initial?.id, publish }) })
      .then((x) => x.json())
      .catch(() => null);
    setBusy(false);
    if (!r?.ok) return setErr(r?.error ?? "Error");
    router.push(`/${lang}/cabinet?tab=realty&saved=1`);
    router.refresh();
  }

  const fc = "field mt-1 h-11 w-full";
  const districts = DISTRICTS[f.city] ?? [];
  return (
    <div className="space-y-4 rounded-2xl border border-line p-5">
      <a href={`/${lang}/cabinet?tab=realty`} className="inline-flex items-center gap-1 text-[14px] text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {t.cancel}
      </a>

      <div>
        <p className="text-[14px] font-medium">{t.photos}</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((u, i) => (
            <div key={u} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">{t.first}</span>}
              <div className="absolute bottom-1 right-1 flex gap-1">
                {i > 0 && (
                  <button type="button" onClick={() => setPhotos([u, ...photos.filter((x) => x !== u)])} className="rounded-full bg-white/90 px-2 text-[11px]">
                    ★
                  </button>
                )}
                <button type="button" onClick={() => setPhotos(photos.filter((x) => x !== u))} className="rounded-full bg-white/90 p-1" aria-label="delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button type="button" onClick={() => fileRef.current?.click()} className="flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed border-line text-[13px] text-muted hover:border-brand">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.addPhotos}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
      </div>

      <label className="block text-[14px] font-medium">
        {t.desc}
        <textarea value={f.description} onChange={set("description")} rows={6} maxLength={4000} placeholder={t.descPh} className="field mt-1 w-full py-2" />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={fillFromText} className="btn-ghost h-9 px-3 text-[13px]">
          ✨ {t.fill}
        </button>
        <span className="text-[12px] text-muted">{t.fillHint}</span>
      </div>

      <label className="block text-[14px] font-medium">
        {t.title}
        <input value={f.title} onChange={set("title")} maxLength={120} placeholder={t.titlePh} className={fc} />
      </label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="block text-[14px] font-medium">
          {t.deal}
          <select value={f.deal} onChange={set("deal")} className={fc}>
            {Object.entries(DEALS).map(([k, v]) => (
              <option key={k} value={k}>
                {v[lang]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[14px] font-medium">
          {t.kind}
          <select value={f.kind} onChange={set("kind")} className={fc}>
            {Object.entries(KINDS).map(([k, v]) => (
              <option key={k} value={k}>
                {v[lang]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[14px] font-medium">
          {t.rooms}
          <select value={f.rooms} onChange={set("rooms")} className={fc}>
            <option value="">—</option>
            <option value="0">{t.studio}</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[14px] font-medium">
          {t.area}
          <input value={f.area} onChange={set("area")} inputMode="decimal" className={fc} />
        </label>
        <label className="block text-[14px] font-medium">
          {t.floor}
          <input value={f.floor} onChange={set("floor")} placeholder="12/30" className={fc} />
        </label>
        <label className="block text-[14px] font-medium">
          {t.price}
          <span className="mt-1 flex gap-1">
            <input value={f.price} onChange={set("price")} inputMode="numeric" className="field h-11 min-w-0 flex-1" />
            <select value={f.currency} onChange={set("currency")} className="field h-11 w-20">
              <option value="USD">$</option>
              <option value="GEL">₾</option>
              <option value="EUR">€</option>
            </select>
          </span>
        </label>
        <label className="block text-[14px] font-medium">
          {t.city}
          <select value={f.city} onChange={(e) => setF({ ...f, city: e.target.value, district: "" })} className={fc}>
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
            <select value={f.district} onChange={set("district")} className={fc}>
              <option value="">—</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          ) : (
            <input value={f.district} onChange={set("district")} className={fc} />
          )}
        </label>
        <label className="col-span-2 block text-[14px] font-medium sm:col-span-1">
          {t.address}
          <input value={f.address} onChange={set("address")} className={fc} />
        </label>
      </div>

      {err && <p className="text-[14px] text-danger">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => save(true)} className="btn-primary h-11 px-6">
          {t.publish}
        </button>
        <button type="button" disabled={busy} onClick={() => save(false)} className="btn-ghost h-11 px-5">
          {t.draft}
        </button>
      </div>
    </div>
  );
}
