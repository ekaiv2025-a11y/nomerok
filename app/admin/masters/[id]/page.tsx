import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { adminGetMaster } from "@/lib/db";
import { MasterEditForm } from "@/components/MasterEditForm";
import { deleteMaster, setMasterStatus } from "../../actions";

export const dynamic = "force-dynamic";

const LABEL = { pending: "На проверке", published: "Опубликован", hidden: "Скрыт", rejected: "Отклонён" } as const;

export default async function EditMasterPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const sp = await searchParams;
  const m = await adminGetMaster(id);
  if (!m) notFound();
  const back = `/admin/masters/${m.id}`;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin?tab=masters" className="text-[14px] text-muted">← Назад</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{m.name}</h1>
        <span className="rounded-full bg-white px-3 py-1 text-[14px]">{LABEL[m.status]}</span>
      </div>
      <p className="mt-1 text-[13px] text-muted">
        Согласие на публикацию: {m.consent_at ? new Date(m.consent_at).toLocaleDateString("ru-RU") : "не отмечено"}
      </p>
      {sp.saved && <p className="mt-3 rounded-xl bg-brand-soft p-3 text-[14px] text-brand-dark">Сохранено</p>}
      {sp.error && <p className="mt-3 rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{sp.error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {m.status !== "published" && <StatusBtn id={m.id} status="published" label="Опубликовать" primary back={back} />}
        {m.status === "published" && <StatusBtn id={m.id} status="hidden" label="Скрыть с сайта" back={back} />}
        {m.status === "pending" && <StatusBtn id={m.id} status="rejected" label="Отклонить" back={back} />}
        {m.status === "published" && <Link href={`/master/${m.slug}`} target="_blank" className="btn-ghost h-10 text-[14px]">Открыть на сайте ↗</Link>}
      </div>

      <div className="mt-4"><MasterEditForm m={m} /></div>

      <form action={deleteMaster} className="mt-6">
        <input type="hidden" name="id" value={m.id} />
        <button className="text-[14px] text-danger underline">Удалить специалиста навсегда</button>
      </form>
    </div>
  );
}

function StatusBtn({ id, status, label, primary, back }: { id: string; status: string; label: string; primary?: boolean; back: string }) {
  return (
    <form action={setMasterStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="back" value={back} />
      <button className={primary ? "btn-primary h-10 text-[14px]" : "btn-ghost h-10 text-[14px]"}>{label}</button>
    </form>
  );
}
