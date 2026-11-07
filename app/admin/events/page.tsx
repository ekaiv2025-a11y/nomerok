import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAdmin } from "@/lib/admin-auth";
import { adminEvents, setEventStatus } from "@/lib/events-db";
import { eventWhen, kindOf, type CityEvent } from "@/lib/events";
import { cityLabel } from "@/lib/cities";

export const dynamic = "force-dynamic";

async function act(fd: FormData) {
  "use server";
  await requireAdmin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  if (status !== "published" && status !== "rejected") return;
  await setEventStatus(id, status);
  revalidatePath("/admin/events");
  revalidatePath("/ru/afisha");
}

function Row({ e, pending }: { e: CityEvent; pending?: boolean }) {
  const k = kindOf(e.kind);
  return (
    <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-line bg-white p-4">
      {e.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={e.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
      ) : (
        <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-cream text-[32px]">{k.emoji}</span>
      )}
      <div className="min-w-0 grow">
        <p className="text-[12.5px] font-semibold text-brand">
          {eventWhen(e, "ru")} · {cityLabel(e.city, "ru")} · {k.label.ru}
        </p>
        <p className="text-[16px] font-semibold">{e.title}</p>
        <p className="text-[13px] text-muted">{[e.venue, e.address, e.price].filter(Boolean).join(" · ")}</p>
        {e.description && <p className="mt-1 line-clamp-3 text-[13.5px]">{e.description}</p>}
        {e.contact && <p className="mt-1 text-[13px]">📇 Контакт: {e.contact}</p>}
        {e.url && (
          <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-brand underline">
            {e.url}
          </a>
        )}
      </div>
      <div className="flex gap-2">
        {pending && (
          <form action={act}>
            <input type="hidden" name="id" value={e.id} />
            <input type="hidden" name="status" value="published" />
            <button className="btn-primary h-9 px-4 text-[13px]">✅ Опубликовать</button>
          </form>
        )}
        <form action={act}>
          <input type="hidden" name="id" value={e.id} />
          <input type="hidden" name="status" value="rejected" />
          <button className="btn-ghost h-9 px-4 text-[13px]">{pending ? "Отклонить" : "Снять"}</button>
        </form>
      </div>
    </div>
  );
}

export default async function AdminEvents() {
  if (!(await isAdmin())) redirect("/admin/login");
  const { pending, published } = await adminEvents();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin" className="text-[14px] text-muted">
        ← Админка
      </Link>
      <h1 className="mt-2 text-[26px] font-bold">🎟 Афиша</h1>
      <p className="mt-1 text-[14px] text-muted">
        Прошедшие события уходят из афиши сами. <Link href="/ru/afisha" className="text-brand underline">Открыть афишу</Link>
      </p>
      <h2 className="mt-6 text-[19px] font-bold">На проверке · {pending.length}</h2>
      <div className="mt-3 space-y-3">{pending.length ? pending.map((e) => <Row key={e.id} e={e} pending />) : <p className="text-[14px] text-muted">Нет новых.</p>}</div>
      <h2 className="mt-8 text-[19px] font-bold">Опубликованы, впереди · {published.length}</h2>
      <div className="mt-3 space-y-3">
        {published.map((e) => (
          <Row key={e.id} e={e} />
        ))}
      </div>
    </div>
  );
}
