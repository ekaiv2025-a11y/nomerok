import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { adminGetMaster } from "@/lib/db";
import { MasterEditForm } from "@/components/MasterEditForm";
import { botLink } from "@/lib/telegram";
import { profileSteps } from "@/lib/profile";
import { signedUrls } from "@/lib/documents";
import { AdminDocs } from "@/components/AdminDocs";
import { deleteMaster, setMasterStatus, verifyPhoneManually } from "../../actions";

export const dynamic = "force-dynamic";

const LABEL = { pending: "На проверке", published: "Опубликован", hidden: "Скрыт", rejected: "Отклонён" } as const;

export default async function EditMasterPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const sp = await searchParams;
  const m = await adminGetMaster(id);
  if (!m) notFound();
  const back = `/admin/masters/${m.id}`;
  const tgLink = await botLink(`m_${m.tg_link_token}`);
  const { percent } = profileSteps(m);
  const docs = Array.isArray(m.documents) ? m.documents : [];
  const docUrls = await signedUrls(docs.map((d) => d.path)).catch(() => ({}) as Record<string, string>);

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
      <div className="mt-3 rounded-2xl bg-white p-4 text-[14px]">
        <p>
          <b>Telegram:</b>{" "}
          {m.phone_verified_at
            ? `✓ номер подтверждён ${new Date(m.phone_verified_at).toLocaleDateString("ru-RU")}`
            : m.tg_chat_id
              ? "подключён, номер ещё не подтверждён"
              : "не подключён"}
          {m.tg_username ? ` · @${m.tg_username}` : ""} · профиль заполнен на {percent}%
        </p>
        <form action={verifyPhoneManually} className="mt-2">
          <input type="hidden" name="id" value={m.id} />
          <input type="hidden" name="on" value={m.phone_verified_at ? "0" : "1"} />
          {m.phone_verified_at ? (
            <button className="text-[13px] text-muted underline">Снять отметку «Номер подтверждён»</button>
          ) : (
            <>
              <button className="btn-ghost h-9 px-4 text-[13px]">✓ Подтвердить номер вручную</button>
              <span className="ml-2 text-[12px] text-muted">Если бот не смог (в Telegram другой номер). Сначала позвоните по номеру из анкеты.</span>
            </>
          )}
        </form>
        {!m.tg_chat_id && (
          <p className="mt-2 text-[13px] text-[#8a5a00]">⚠️ Telegram не подключён — заявки через бота он получать не будет, пока не откроет ссылку ниже.</p>
        )}
        {(!m.phone_verified_at || !m.tg_chat_id) && tgLink && (
          <p className="mt-2 text-muted">
            Ссылка для специалиста (отправьте ему, чтобы подтвердил номер и получал заявки):
            <br />
            <span className="select-all break-all font-mono text-[13px] text-ink">{tgLink}</span>
          </p>
        )}
      </div>
      {sp.saved && <p className="mt-3 rounded-xl bg-brand-soft p-3 text-[14px] text-brand-dark">Сохранено</p>}
      {sp.error && <p className="mt-3 rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{sp.error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {m.status !== "published" && <StatusBtn id={m.id} status="published" label="Опубликовать" primary back={back} />}
        {m.status === "published" && <StatusBtn id={m.id} status="hidden" label="Скрыть с сайта" back={back} />}
        {m.status === "pending" && <StatusBtn id={m.id} status="rejected" label="Отклонить" back={back} />}
        {m.status === "published" && <Link href={`/ru/master/${m.slug}`} target="_blank" className="btn-ghost h-10 text-[14px]">Открыть на сайте ↗</Link>}
      </div>

      {docs.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white p-4">
          <h2 className="mb-2 font-semibold">Документы ({docs.length})</h2>
          <AdminDocs masterId={m.id} docs={docs} urls={docUrls} back={`/admin/masters/${m.id}`} />
        </div>
      )}
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
