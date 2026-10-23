import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { pendingBoosts } from "@/lib/boosts-db";
import { adminGetMaster } from "@/lib/db";
import { decideBoostAction } from "../actions";

export const dynamic = "force-dynamic";

/** Скриншоты сторис с карточкой NomerOk → поднять анкету на 7 дней. */
export default async function BoostsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const list = await pendingBoosts();
  const rows = await Promise.all(list.map(async (b) => ({ b, m: await adminGetMaster(b.master_id).catch(() => null) })));
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/admin" className="text-[14px] text-muted hover:text-ink">
        ← Назад
      </Link>
      <h1 className="text-[22px] font-bold">📈 Сторис на проверке</h1>
      <p className="text-[14px] text-muted">
        Специалист выложил свою карточку NomerOk в сторис и прислал скриншот. Если на скриншоте видна карточка (или его профиль NomerOk) в сторис — нажмите «Поднять»: анкета 7 дней будет выше в каталоге. Специалисту придёт сообщение.
      </p>
      {rows.length === 0 && <p className="rounded-2xl bg-white p-5 text-[14px] text-muted">Новых скриншотов нет.</p>}
      {rows.map(({ b, m }) => (
        <div key={b.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 sm:flex-row">
          <a href={b.image_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.image_url} alt="" className="h-72 w-40 rounded-xl bg-cream object-cover" />
          </a>
          <div className="flex-1">
            <p className="text-[16px] font-bold">{m ? <Link href={`/admin/masters/${m.id}`} className="hover:underline">{m.name}</Link> : "Анкета удалена"}</p>
            <p className="text-[13px] text-muted">{new Date(b.created_at).toLocaleString("ru-RU", { timeZone: "Asia/Tbilisi" })}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={decideBoostAction}>
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="ok" value="1" />
                <button className="btn-primary h-10 px-4 text-[14px]">✅ Поднять на 7 дней</button>
              </form>
              <form action={decideBoostAction}>
                <input type="hidden" name="id" value={b.id} />
                <input type="hidden" name="ok" value="0" />
                <button className="btn-ghost h-10 px-4 text-[14px]">❌ Не подходит</button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
