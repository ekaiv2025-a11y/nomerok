import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { PLACE_CATS } from "@/lib/places";
import { getPlace } from "@/lib/places-db";
import { formatPhone } from "@/lib/phone";
import { savePlaceAction } from "../actions";
import { AdminPostPhotos } from "@/components/AdminPostPhotos";

export const dynamic = "force-dynamic";

export default async function EditPlace({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const sp = await searchParams;
  const p = await getPlace(decodeURIComponent(id));
  if (!p) notFound();
  const L = "block text-[13px] font-semibold";
  const F = "field mt-1 w-full";
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/places" className="text-[14px] text-muted">← Места</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <a href={`/ru/places/${p.slug}`} target="_blank" className="text-[14px] text-brand underline">Открыть на сайте ↗</a>
      </div>
      <p className="mt-1 text-[12px] text-muted">
        ID {p.id} · источник: {p.src || "—"} {p.checked ? `· проверено ${p.checked}` : ""} {p.edited ? "· правили вручную (импорт не перезапишет)" : ""}
      </p>
      {sp.ok && <p className="mt-3 rounded-xl bg-brand-soft p-3 text-[14px] font-semibold text-brand-dark">✓ Сохранено</p>}
      {sp.err && <p className="mt-3 rounded-xl bg-white p-3 text-[14px] font-semibold text-danger">⚠️ {sp.err}</p>}

      {(p.claim_at || p.owner_verified_at) && (
        <div className="mt-3 rounded-2xl border border-[#229ED9]/30 bg-[#eaf6fc] p-4 text-[14px]">
          {p.owner_verified_at ? (
            <p>✓ Владелец подтверждён {new Date(p.owner_verified_at).toLocaleDateString("ru-RU")} {p.owner_name ? `— ${p.owner_name}` : ""}</p>
          ) : (
            <p>⏳ Заявка владельца {new Date(p.claim_at!).toLocaleString("ru-RU")}: номер из Telegram не совпал с номером места. Проверьте вручную (позвоните по номеру места) и подтвердите кнопкой внизу.</p>
          )}
        </div>
      )}

      <form action={savePlaceAction} className="mt-4 space-y-4 rounded-2xl bg-white p-5 text-[14px]">
        <input type="hidden" name="id" value={p.id} />
        <div className="grid gap-3 sm:grid-cols-3">
          <label><span className={L}>Название</span><input name="name" defaultValue={p.name} className={F} required /></label>
          <label><span className={L}>Название EN</span><input name="name_en" defaultValue={p.name_en ?? ""} className={F} /></label>
          <label><span className={L}>Название KA</span><input name="name_ka" defaultValue={p.name_ka ?? ""} className={F} /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className={L}>Раздел</span>
            <select name="cat" defaultValue={p.cat} className={F}>
              {PLACE_CATS.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label.ru}</option>)}
            </select>
          </label>
          <label><span className={L}>Вид (ресторан, автосервис…)</span><input name="sub" defaultValue={p.sub ?? ""} className={F} /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label><span className={L}>Адрес по-русски (для RU-версии)</span><input name="addr_ru" defaultValue={p.addr_ru ?? ""} className={F} placeholder="Батуми, ул. Горгасали, 79" /></label>
          <label><span className={L}>Адрес из источника</span><input name="addr" defaultValue={p.addr ?? ""} className={F} /></label>
        </div>
        <label className="block"><span className={L}>Признаки для подборок (через запятую)</span><input name="tags" defaultValue={(p.tags ?? []).join(", ")} className={F} placeholder="грузинская кухня, терраса, вид на море" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label><span className={L}>Широта</span><input name="lat" defaultValue={p.lat ?? ""} className={F} /></label>
          <label><span className={L}>Долгота</span><input name="lng" defaultValue={p.lng ?? ""} className={F} /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label><span className={L}>Телефоны (каждый с новой строки)</span><textarea name="phones" rows={2} defaultValue={(p.phones ?? []).map(formatPhone).join("\n")} className={`${F} py-2`} /></label>
          <label><span className={L}>Часы работы</span><textarea name="hours" rows={2} defaultValue={p.hours ?? ""} className={`${F} py-2`} placeholder="Mo-Su 10:00-22:00" /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label><span className={L}>Сайт</span><input name="site" defaultValue={p.site ?? ""} className={F} /></label>
          <label><span className={L}>Instagram (ссылка)</span><input name="ig" defaultValue={p.ig ?? ""} className={F} /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label><span className={L}>Другие соцсети (ссылки, с новой строки)</span><textarea name="socials" rows={2} defaultValue={(p.socials ?? []).join("\n")} className={`${F} py-2`} /></label>
          <label><span className={L}>Email</span><input name="email" defaultValue={p.email ?? ""} className={F} /></label>
        </div>
        <label className="block"><span className={L}>Описание RU (своими словами)</span><textarea name="desc_ru" rows={4} defaultValue={p.desc_ru ?? ""} className={`${F} py-2`} /></label>
        <label className="block"><span className={L}>Description EN</span><textarea name="desc_en" rows={3} defaultValue={p.desc_en ?? ""} className={`${F} py-2`} /></label>
        <div>
          <span className={L}>Фото (первое — миниатюра в списках)</span>
          <AdminPostPhotos initial={p.photos ?? []} hint="Только свои фото, фото от владельца или с разрешения автора. Первое фото — обложка. Порядок — стрелками." />
        </div>
        <label className="block">
          <span className={L}>Показ на сайте</span>
          <select name="status" defaultValue={p.status} className={F}>
            <option value="published">На сайте</option>
            <option value="hidden">Скрыто</option>
          </select>
        </label>
        {p.links && p.links.length > 0 && (
          <p className="text-[12px] text-muted">Источники сверки: {p.links.map((u) => <a key={u} href={u} target="_blank" className="mr-2 underline">{u.replace(/^https?:\/\//, "").slice(0, 40)}</a>)}</p>
        )}
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <button className="btn-primary h-10 px-5">💾 Сохранить</button>
          {!p.owner_verified_at && p.claim_at && (
            <button name="owner_ok" value="1" className="btn-ghost h-10 px-4 text-[13px]">✓ Сохранить и подтвердить владельца</button>
          )}
          {p.owner_verified_at && (
            <button name="owner_reset" value="1" className="h-10 px-3 text-[13px] text-danger underline">Снять владельца</button>
          )}
        </div>
      </form>
    </div>
  );
}
