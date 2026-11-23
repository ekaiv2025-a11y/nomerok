"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { resizeImage } from "@/lib/image-resize";
import { CITIES } from "@/lib/cities";
import { IMAGE_KIND, type ImageKind } from "@/lib/projects";
import type { DevPhoto, DevProgress, DevProject, DevUnit } from "@/lib/dev-projects";
import { DevUnitsEditor } from "./DevUnitsEditor";

/*
 * Кабинет застройщика: один ЖК — четыре вкладки.
 * «О комплексе» и фото сохраняются кнопкой «Сохранить»; квартиры — своей кнопкой во вкладке «Квартиры».
 */
type Tab = "about" | "photos" | "progress" | "units";
type Form = {
  name: string;
  developer: string;
  city: string;
  district: string;
  address: string;
  status: "presale" | "building" | "done";
  completion: string;
  floors: string;
  description: string;
  amenities: string;
  payment: string;
  contact_name: string;
  contact_phone: string;
  linked_slug: string;
};

async function upload(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("photo", await resizeImage(file, 2000, 0.85));
  const r = await fetch("/api/realty/photo", { method: "POST", body: fd }).then((x) => x.json()).catch(() => null);
  return r?.ok ? (r.url as string) : null;
}

export function DevEditor({
  initial,
  units,
  catalog,
  claim,
}: {
  initial: DevProject | null;
  units: DevUnit[];
  /** ЖК из нашего каталога — застройщик может дополнить свой */
  catalog: { slug: string; name: string; city: string; developer: string }[];
  claim?: string;
}) {
  const router = useRouter();
  const claimed = claim ? catalog.find((c) => c.slug === claim) : null;
  const [tab, setTab] = useState<Tab>("about");
  const [f, setF] = useState<Form>(() => ({
    name: initial?.name ?? claimed?.name ?? "",
    developer: initial?.developer ?? claimed?.developer ?? "",
    city: initial?.city ?? claimed?.city ?? "batumi",
    district: initial?.district ?? "",
    address: initial?.address ?? "",
    status: initial?.status ?? "building",
    completion: initial?.completion ?? "",
    floors: initial?.floors ?? "",
    description: initial?.description ?? "",
    amenities: (initial?.amenities ?? []).join("\n"),
    payment: (initial?.payment ?? []).join("\n"),
    contact_name: initial?.contact_name ?? "",
    contact_phone: initial?.contact_phone ?? "",
    linked_slug: initial?.linked_slug ?? claimed?.slug ?? "",
  }));
  const [photos, setPhotos] = useState<DevPhoto[]>(initial?.photos ?? []);
  const [progress, setProgress] = useState<DevProgress[]>(initial?.progress ?? []);
  const [busy, setBusy] = useState<"" | "save" | "submit">("");
  const [uploading, setUploading] = useState<string>("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const kindRef = useRef<ImageKind>("exterior");
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const status = initial?.mod_status ?? "draft";

  async function save(submit: boolean) {
    setErr("");
    setMsg("");
    if (!f.name.trim()) return (setTab("about"), setErr("Укажите название ЖК"));
    if (f.contact_phone.replace(/\D/g, "").length < 9) return (setTab("about"), setErr("Укажите телефон отдела продаж"));
    setBusy(submit ? "submit" : "save");
    const r = await fetch("/api/dev/project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, id: initial?.id, photos, progress, submit }),
    })
      .then((x) => x.json())
      .catch(() => null);
    setBusy("");
    if (!r?.ok) return setErr(r?.error ?? "Не получилось сохранить");
    setMsg(r.mod_status === "pending" ? "✅ Отправлено на проверку — обычно до дня. Пришлём сообщение, когда ЖК появится на сайте." : "✅ Сохранено");
    if (!initial) router.replace(`/ru/realty/dev/${r.id}`);
    else router.refresh();
  }

  async function addPhotos(list: FileList | null, kind: ImageKind) {
    if (!list?.length) return;
    const files = Array.from(list).slice(0, 40 - photos.length);
    const out = [...photos];
    for (const [i, file] of files.entries()) {
      setUploading(`${i + 1} / ${files.length}`);
      const url = await upload(file);
      if (url) {
        out.push({ url, kind });
        setPhotos([...out]);
      } else setErr("Не получилось загрузить фото (JPG, PNG или WEBP до 6 МБ)");
    }
    setUploading("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const fc = "field mt-1.5 h-11 w-full";
  const tabs: [Tab, string][] = [
    ["about", "О комплексе"],
    ["photos", `Фото · ${photos.length}`],
    ["progress", `Ход стройки · ${progress.length}`],
    ["units", `Квартиры · ${units.length}`],
  ];

  return (
    <div className="space-y-4">
      <a href="/ru/realty/dev" className="inline-flex items-center gap-1 text-[14px] text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Мои ЖК
      </a>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-[24px] font-bold leading-tight">{initial ? initial.name : "Новый ЖК"}</h1>
        {initial && (
          <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${status === "published" ? "bg-brand-soft text-brand-dark" : status === "pending" ? "bg-[#fdf3dc] text-[#6b4f12]" : "bg-cream text-muted"}`}>
            {status === "published" ? "✅ на сайте" : status === "pending" ? "⏳ на проверке" : status === "hidden" ? "скрыт" : "черновик"}
          </span>
        )}
        {initial && status === "published" && (
          <a href={`/ru/novostroyki/${initial.linked_slug ?? initial.slug}`} target="_blank" className="text-[14px] font-semibold text-brand hover:underline">
            Открыть на сайте ↗
          </a>
        )}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            type="button"
            disabled={k === "units" && !initial}
            title={k === "units" && !initial ? "Сначала сохраните ЖК" : undefined}
            onClick={() => setTab(k)}
            className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold disabled:opacity-40 ${tab === k ? "bg-brand text-white" : "bg-cream hover:bg-brand-soft"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "about" && (
        <section className="space-y-3 rounded-2xl border border-line bg-white p-5">
          {!initial && (
            <label className="block text-[14px] font-medium">
              Ваш ЖК уже есть в нашем каталоге?
              <select value={f.linked_slug} onChange={(e) => {
                const c = catalog.find((x) => x.slug === e.target.value);
                setF((x) => ({ ...x, linked_slug: e.target.value, ...(c ? { name: c.name, city: c.city, developer: x.developer || c.developer } : {}) }));
              }} className={fc}>
                <option value="">Нет — это новый ЖК</option>
                {catalog.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} · {c.developer}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[12px] font-normal text-muted">Если есть — вы дополните его страницу своими фото, квартирами и ходом стройки. Мы проверим, что вы представляете застройщика.</span>
            </label>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[14px] font-medium">
              Название ЖК *
              <input value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={80} className={fc} placeholder="Sea Tower" />
            </label>
            <label className="block text-[14px] font-medium">
              Застройщик
              <input value={f.developer} onChange={(e) => set("developer", e.target.value)} maxLength={80} className={fc} placeholder="Название компании" />
            </label>
            <label className="block text-[14px] font-medium">
              Город
              <select value={f.city} onChange={(e) => set("city", e.target.value)} className={fc}>
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label.ru}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[14px] font-medium">
              Район
              <input value={f.district} onChange={(e) => set("district", e.target.value)} maxLength={80} className={fc} placeholder="Новый бульвар" />
            </label>
            <label className="block text-[14px] font-medium sm:col-span-2">
              Адрес
              <input value={f.address} onChange={(e) => set("address", e.target.value)} maxLength={200} className={fc} placeholder="ул. Шерифа Химшиашвили, 7" />
            </label>
            <label className="block text-[14px] font-medium">
              Статус
              <select value={f.status} onChange={(e) => set("status", e.target.value as Form["status"])} className={fc}>
                <option value="presale">Старт продаж</option>
                <option value="building">Строится</option>
                <option value="done">Сдан</option>
              </select>
            </label>
            <label className="block text-[14px] font-medium">
              Срок сдачи
              <input value={f.completion} onChange={(e) => set("completion", e.target.value)} maxLength={80} className={fc} placeholder="IV квартал 2027" />
            </label>
            <label className="block text-[14px] font-medium">
              Этажность
              <input value={f.floors} onChange={(e) => set("floors", e.target.value)} maxLength={20} className={fc} placeholder="25 или 12–18" />
            </label>
          </div>
          <label className="block text-[14px] font-medium">
            Описание
            <textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={7} maxLength={6000} className="field mt-1.5 w-full py-2" placeholder="О комплексе, расположении, отделке, инфраструктуре. Абзацы разделяйте пустой строкой." />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[14px] font-medium">
              Что есть в комплексе (каждое с новой строки)
              <textarea value={f.amenities} onChange={(e) => set("amenities", e.target.value)} rows={5} className="field mt-1.5 w-full py-2" placeholder={"Бассейн\nПодземный паркинг\nФитнес-зал"} />
            </label>
            <label className="block text-[14px] font-medium">
              Условия покупки (каждое с новой строки)
              <textarea value={f.payment} onChange={(e) => set("payment", e.target.value)} rows={5} className="field mt-1.5 w-full py-2" placeholder={"Рассрочка до 36 месяцев\nПервый взнос от 20%"} />
            </label>
          </div>
          <div className="grid gap-3 rounded-xl bg-cream p-3 sm:grid-cols-2">
            <label className="block text-[14px] font-medium">
              Отдел продаж: имя или название
              <input value={f.contact_name} onChange={(e) => set("contact_name", e.target.value)} maxLength={80} className={fc} />
            </label>
            <label className="block text-[14px] font-medium">
              Телефон отдела продаж *
              <input value={f.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} type="tel" inputMode="tel" className={fc} placeholder="+995 5__ __ __ __" />
            </label>
            <p className="text-[12px] text-muted sm:col-span-2">Заявки покупателей со страницы ЖК приходят вам в Telegram (или на почту, если вы вошли через почту). Телефон нужен нам для проверки.</p>
          </div>
        </section>
      )}

      {tab === "photos" && (
        <section className="rounded-2xl border border-line bg-white p-5">
          <p className="text-[14px] text-muted">Рендеры, фото комплекса, интерьеры, вид из окон, планировки. Первое фото — обложка. Без водяных знаков чужих сайтов.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(IMAGE_KIND) as ImageKind[])
              .filter((k) => k !== "progress")
              .map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={!!uploading}
                  onClick={() => {
                    kindRef.current = k;
                    fileRef.current?.click();
                  }}
                  className="btn-ghost h-10 px-4 text-[14px]"
                >
                  + {IMAGE_KIND[k]}
                </button>
              ))}
            {uploading && (
              <span className="flex items-center gap-1.5 text-[13px] text-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> {uploading}
              </span>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => addPhotos(e.target.files, kindRef.current)} />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p, i) => (
              <div key={p.url} className="overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="space-y-1.5 p-2">
                  <select value={p.kind} onChange={(e) => setPhotos(photos.map((x, j) => (j === i ? { ...x, kind: e.target.value as ImageKind } : x)))} className="field h-9 w-full text-[13px]">
                    {(Object.keys(IMAGE_KIND) as ImageKind[]).map((k) => (
                      <option key={k} value={k}>
                        {IMAGE_KIND[k]}
                      </option>
                    ))}
                  </select>
                  <input value={p.caption ?? ""} onChange={(e) => setPhotos(photos.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} maxLength={120} placeholder="Подпись (необязательно)" className="field h-9 w-full text-[13px]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted">{i === 0 ? "обложка" : ""}</span>
                    <span className="flex gap-1">
                      <button type="button" aria-label="Левее" onClick={() => i > 0 && setPhotos(photos.map((x, j) => (j === i - 1 ? photos[i] : j === i ? photos[i - 1] : x)))} className="rounded-full p-1 hover:bg-cream">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Правее" onClick={() => i < photos.length - 1 && setPhotos(photos.map((x, j) => (j === i + 1 ? photos[i] : j === i ? photos[i + 1] : x)))} className="rounded-full p-1 hover:bg-cream">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Удалить" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="rounded-full p-1 text-danger hover:bg-cream">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "progress" && <ProgressEditor items={progress} onChange={setProgress} />}

      {tab === "units" && initial && <DevUnitsEditor projectId={initial.id} initial={units} />}

      {tab !== "units" && (
        <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white/95 p-2.5 shadow-sm backdrop-blur">
          <button type="button" disabled={!!busy || !!uploading} onClick={() => save(false)} className="btn-primary h-11 px-5 text-[14px]">
            {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" />} Сохранить
          </button>
          {status !== "published" && status !== "pending" && (
            <button type="button" disabled={!!busy || !!uploading} onClick={() => save(true)} className="btn h-11 rounded-full bg-accent px-5 text-[14px] font-semibold text-ink hover:bg-[#cf9620]">
              {busy === "submit" && <Loader2 className="h-4 w-4 animate-spin" />} Отправить на проверку
            </button>
          )}
          {msg && <span className="text-[13px] font-medium text-brand">{msg}</span>}
          {err && <span className="text-[13px] font-medium text-danger">{err}</span>}
        </div>
      )}
    </div>
  );
}

function ProgressEditor({ items, onChange }: { items: DevProgress[]; onChange: (v: DevProgress[]) => void }) {
  const [busy, setBusy] = useState<number | null>(null);
  const month = new Date().toLocaleDateString("ru-RU", { month: "long", year: "numeric" }).replace(" г.", "");
  return (
    <section className="space-y-3 rounded-2xl border border-line bg-white p-5">
      <p className="text-[14px] text-muted">Раз в месяц добавляйте запись: что сделано и свежие фото стройки. Покупатели видят, что стройка идёт, — это главное, чему они доверяют.</p>
      <button type="button" onClick={() => onChange([{ date: month, text: "", photos: [] }, ...items])} className="btn-primary h-10 px-4 text-[14px]">
        + Запись за {month}
      </button>
      {items.map((x, i) => (
        <div key={i} className="rounded-xl border border-line p-3">
          <div className="flex gap-2">
            <input value={x.date} onChange={(e) => onChange(items.map((y, j) => (j === i ? { ...y, date: e.target.value } : y)))} maxLength={40} className="field h-10 w-44" />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="ml-auto rounded-full p-2 text-danger hover:bg-cream" aria-label="Удалить">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <textarea value={x.text} onChange={(e) => onChange(items.map((y, j) => (j === i ? { ...y, text: e.target.value } : y)))} rows={2} maxLength={600} placeholder="Монолит на 18 этаже из 25, начато остекление" className="field mt-2 w-full py-2" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {x.photos.map((u) => (
              <span key={u} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-16 w-20 rounded-lg object-cover" />
                <button type="button" onClick={() => onChange(items.map((y, j) => (j === i ? { ...y, photos: y.photos.filter((p) => p !== u) } : y)))} className="absolute -right-1 -top-1 rounded-full bg-white px-1 text-[12px] shadow" aria-label="Убрать">
                  ×
                </button>
              </span>
            ))}
            <label className="btn-ghost h-10 cursor-pointer px-3 text-[13px]">
              {busy === i ? <Loader2 className="h-4 w-4 animate-spin" /> : "+ Фото стройки"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={async (e) => {
                  const list = Array.from(e.target.files ?? []).slice(0, 12 - x.photos.length);
                  setBusy(i);
                  const urls: string[] = [];
                  for (const f of list) {
                    const u = await upload(f);
                    if (u) urls.push(u);
                  }
                  setBusy(null);
                  onChange(items.map((y, j) => (j === i ? { ...y, photos: [...y.photos, ...urls] } : y)));
                }}
              />
            </label>
          </div>
        </div>
      ))}
    </section>
  );
}
