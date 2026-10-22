import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAdmin } from "@/lib/admin-auth";
import { adminListings, deleteListing, updateListing } from "@/lib/realty-db";
import { adminListMasters } from "@/lib/db";
import { DEALS, priceLabel } from "@/lib/realty";

export const dynamic = "force-dynamic";

async function act(fd: FormData) {
  "use server";
  await requireAdmin();
  const id = String(fd.get("id"));
  const a = String(fd.get("act"));
  if (a === "hide") await updateListing(id, { status: "hidden" });
  else if (a === "show") await updateListing(id, { status: "published", reports: 0 });
  else if (a === "delete") await deleteListing(id);
  revalidatePath("/admin/realty");
}

export default async function AdminRealty({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const s = (await searchParams).s;
  const [list, masters] = await Promise.all([adminListings(s || undefined), adminListMasters()]);
  const name = new Map(masters.map((m) => [m.id, m]));
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/admin" className="text-[14px] text-muted">← Админка</Link>
      <h1 className="mt-2 text-[26px] font-bold">🏠 Недвижимость: {list.length}</h1>
      <div className="mt-3 flex flex-wrap gap-2 text-[14px]">
        {[["", "Все"], ["published", "Опубликованы"], ["hidden", "Скрыты (жалобы)"], ["draft", "Черновики"], ["archived", "Архив"]].map(([k, l]) => (
          <Link key={k} href={`/admin/realty${k ? `?s=${k}` : ""}`} className={`rounded-full px-3 py-1 ${(s ?? "") === k ? "bg-ink text-white" : "bg-cream"}`}>{l}</Link>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {list.map((l) => (
          <div key={l.id} className="flex items-center gap-3 rounded-xl border border-line bg-white p-2 text-[14px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {l.photos[0] ? <img src={l.photos[0]} alt="" className="h-14 w-20 rounded-lg object-cover" /> : <span className="h-14 w-20 rounded-lg bg-cream" />}
            <div className="min-w-0 flex-1">
              <Link href={`/ru/realty/${l.id}`} className="font-semibold hover:text-brand">{l.title}</Link>
              <p className="text-[12px] text-muted">
                {priceLabel(l, "ru")} · {DEALS[l.deal].ru} · {l.status} · жалоб: {l.reports} · {name.get(l.master_id)?.name ?? "?"} · {l.source}
              </p>
            </div>
            <form action={act} className="flex gap-1">
              <input type="hidden" name="id" value={l.id} />
              {l.status === "published" ? <button name="act" value="hide" className="rounded-full border px-3 py-1 text-[12px]">Скрыть</button> : <button name="act" value="show" className="rounded-full border px-3 py-1 text-[12px]">Опубликовать</button>}
              <button name="act" value="delete" className="rounded-full border px-3 py-1 text-[12px] text-danger">Удалить</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
