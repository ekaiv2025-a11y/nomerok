import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { PLACE_CATS, placeCat } from "@/lib/places";
import { PLACES_PAGE, adminPlaceStats, listPlaces } from "@/lib/places-db";
import { formatPhone } from "@/lib/phone";
import { importPlacesAction, togglePlaceAction } from "./actions";

export const dynamic = "force-dynamic";

type SP = { q?: string; cat?: string; status?: string; page?: string; msg?: string };

export default async function AdminPlaces({ searchParams }: { searchParams: Promise<SP> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const status = sp.status === "hidden" ? "hidden" : sp.status === "all" ? "" : "published";
  const [stats, res] = await Promise.all([adminPlaceStats(), listPlaces({ q: sp.q, cat: sp.cat || undefined, page, admin: { status } })]);
  const pages = Math.ceil(res.total / PLACES_PAGE);
  const qs = (p: number) => `/admin/places?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(sp.cat ? { cat: sp.cat } : {}), ...(sp.status ? { status: sp.status } : {}), page: String(p) })}`;
  return (
    <div>
      <Link href="/admin" className="text-[14px] text-muted">← Админка</Link>
      <h1 className="mt-3 text-2xl font-bold">📍 Места</h1>
      <p className="mt-1 text-[13px] text-muted">
        Всего {stats.total} · на сайте {stats.published} · с описанием {stats.withDesc} · подтверждены владельцем {stats.owners}
      </p>
      {sp.msg && <p className="mt-3 rounded-xl bg-white p-3 text-[14px] font-semibold">{sp.msg}</p>}

      <form action={importPlacesAction} className="mt-3 rounded-2xl bg-white p-4 text-[13px]">
        <b>Импорт базы Батуми</b> — из файла data/places-batumi.json (OpenStreetMap, Overture, ручная сверка). Новые места добавятся, старые обновятся. Места, которые вы правили вручную, не трогаются; статус «скрыто/на сайте» не меняется.
        <div>
          <button className="btn-primary mt-2 h-9 px-4 text-[13px]">⬇️ Импортировать / обновить</button>
        </div>
      </form>

      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <input name="q" defaultValue={sp.q} placeholder="Название, улица…" className="field h-11 min-w-0 grow basis-60" />
        <select name="cat" defaultValue={sp.cat ?? ""} className="field h-11 w-auto py-0">
          <option value="">Все разделы</option>
          {PLACE_CATS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.label.ru}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className="field h-11 w-auto py-0">
          <option value="">На сайте</option>
          <option value="hidden">Скрытые</option>
          <option value="all">Все</option>
        </select>
        <button className="btn-ghost h-11 px-5">Найти</button>
      </form>

      <p className="mt-3 text-[13px] text-muted">Найдено: {res.total}</p>
      <div className="mt-2 divide-y divide-line rounded-2xl bg-white">
        {res.items.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-2 p-3 text-[14px]">
            <span className="text-[20px]">{placeCat(p.cat).emoji}</span>
            <Link href={`/admin/places/${p.id}`} className="min-w-0 grow basis-60">
              <span translate="no" className="notranslate block truncate font-semibold hover:text-brand">
                {p.name} {p.owner_verified_at && <span className="text-brand">✓ владелец</span>}
              </span>
              <span className="block truncate text-[12px] text-muted">
                {p.sub || placeCat(p.cat).label.ru} · {p.addr || "без адреса"} · {p.phones?.[0] ? formatPhone(p.phones[0]) : "без телефона"}
                {p.desc_ru ? " · 📝 описание" : ""}
                {p.claim_at && !p.owner_verified_at ? " · ⏳ заявка владельца" : ""}
              </span>
            </Link>
            <form action={togglePlaceAction}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="back" value={qs(page)} />
              <input type="hidden" name="status" value={p.status === "published" ? "hidden" : "published"} />
              <button className="h-8 rounded-full border border-line px-3 text-[12px] hover:bg-cream">{p.status === "published" ? "Скрыть" : "Показать"}</button>
            </form>
          </div>
        ))}
      </div>
      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-3 text-[14px]">
          {page > 1 && <Link href={qs(page - 1)} className="btn-ghost h-9 px-4">← Назад</Link>}
          <span className="text-muted">{page} / {pages}</span>
          {page < pages && <Link href={qs(page + 1)} className="btn-ghost h-9 px-4">Дальше →</Link>}
        </nav>
      )}
    </div>
  );
}
