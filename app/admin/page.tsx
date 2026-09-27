import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { adminContactViewsThisMonth, adminListMasters, adminListRequests, adminListResponses, dbMode } from "@/lib/db";
import { tg, telegramToken } from "@/lib/telegram";
import { categoryLabel } from "@/lib/categories";
import { formatPhone, whatsappLink } from "@/lib/phone";
import type { Master, RequestStatus } from "@/lib/types";
import { addDemo, connectBot, logout, removeDemo, setMasterStatus, setRequestStatus } from "./actions";
import { isDemoSlug } from "@/lib/demo";

export const dynamic = "force-dynamic";

const REQ_LABEL: Record<RequestStatus, string> = { new: "Новая", sent: "Разослана", taken: "Есть отклик", in_work: "В работе", done: "Готово", spam: "Спам" };
const MASTER_LABEL: Record<Master["status"], string> = { pending: "На проверке", published: "Опубликован", hidden: "Скрыт", rejected: "Отклонён" };

function when(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", { timeZone: "Asia/Tbilisi", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; bot?: string; demo?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (dbMode() === "none") {
    return <p className="rounded-2xl bg-white p-6">База не подключена. Добавьте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в Vercel.</p>;
  }
  const { tab = "requests", bot: botResult, demo: demoResult } = await searchParams;
  const [masters, requests, views, responses] = await Promise.all([
    adminListMasters(),
    adminListRequests(),
    adminContactViewsThisMonth(),
    adminListResponses().catch(() => []),
  ]);
  const respByReq = new Map<string, string[]>();
  for (const x of responses) respByReq.set(x.request_id, [...(respByReq.get(x.request_id) ?? []), x.master_id]);
  const byId = new Map(masters.map((m) => [m.id, m]));
  const pending = masters.filter((m) => m.status === "pending");
  const others = masters.filter((m) => m.status !== "pending");
  const newReq = requests.filter((r) => r.status === "new").length;
  const webhook = tab === "bot" && telegramToken() ? await tg<{ url: string; last_error_message?: string; pending_update_count: number }>("getWebhookInfo") : null;

  const tabs = [
    { id: "requests", label: `Заявки клиентов${newReq ? ` · ${newReq} новых` : ""}` },
    { id: "pending", label: `Анкеты${pending.length ? ` · ${pending.length}` : ""}` },
    { id: "masters", label: `Специалисты · ${others.length}` },
    { id: "bot", label: "Telegram-бот" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={`/admin?tab=${t.id}`}
              className={`rounded-full px-4 py-2 text-[14px] font-medium ${tab === t.id ? "bg-ink text-white" : "bg-white hover:bg-line"}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-2">
          <Link href="/admin/masters/new" className="btn-primary h-10 text-[14px]">+ Добавить специалиста</Link>
          <form action={logout}><button className="btn-ghost h-10 text-[14px]">Выйти</button></form>
        </div>
      </div>

      {tab === "requests" && (
        <div className="mt-5 space-y-3">
          {requests.length === 0 && <Empty text="Заявок пока нет. Как только клиент отправит форму, она появится здесь и придёт вам в Telegram." />}
          {requests.map((r) => {
            const m = r.master_id ? byId.get(r.master_id) : null;
            return (
              <div key={r.id} className={`rounded-2xl bg-white p-4 ${r.status === "new" ? "ring-2 ring-accent" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
                  <span>{when(r.created_at)} · <b className="text-ink">{categoryLabel(r.category)}</b>{m ? <> · специалисту <Link className="underline" href={`/admin/masters/${m.id}`}>{m.name}</Link></> : null}</span>
                  <span className="rounded-full bg-cream px-2.5 py-0.5">{REQ_LABEL[r.status]}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-[15px]">{r.description}</p>
                {r.when_text && <p className="mt-1 text-[14px] text-muted">Когда: {r.when_text}</p>}
                <p className="mt-2 text-[13px] text-muted">
                  📨 Разослано специалистам: {r.sent_count ?? 0}
                  {(respByReq.get(r.id) ?? []).length > 0 && (
                    <> · ✋ Откликнулись: {(respByReq.get(r.id) ?? []).map((id) => byId.get(id)?.name ?? "—").join(", ")}</>
                  )}
                  {r.client_tg_chat_id ? " · 🔔 клиент подключил Telegram" : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-semibold">{r.name || "Без имени"}</span>
                  <a className="btn-ghost h-9 px-3 text-[13px]" href={`tel:${r.phone}`}>{formatPhone(r.phone)}</a>
                  <a className="btn-ghost h-9 px-3 text-[13px]" href={whatsappLink(r.phone)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                  <span className="grow" />
                  {(["in_work", "done", "spam"] as RequestStatus[]).filter((s) => s !== r.status).map((s) => (
                    <form key={s} action={setRequestStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value={s} />
                      <button className="h-9 rounded-full border border-line px-3 text-[13px] hover:bg-cream">{REQ_LABEL[s]}</button>
                    </form>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "pending" && (
        <div className="mt-5 space-y-3">
          {pending.length === 0 && <Empty text="Новых анкет нет." />}
          {pending.map((m) => (
            <MasterRow key={m.id} m={m} views={views[m.id] ?? 0} back="/admin?tab=pending" />
          ))}
        </div>
      )}

      {tab === "bot" && (
        <div className="mt-5 space-y-4 rounded-2xl bg-white p-5">
          <h2 className="text-lg font-bold">Telegram-бот</h2>
          <p className="text-[14px] text-muted">
            Бот подтверждает номера специалистов, рассылает им заявки, сообщает об одобрении профиля и присылает клиентам отклики. Чтобы всё это работало, бот нужно один раз подключить к сайту.
          </p>
          {botResult === "ok" && <p className="rounded-xl bg-brand-soft p-3 text-[14px] text-brand-dark">Бот подключён ✓</p>}
          {botResult === "fail" && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">Не получилось подключить. Проверьте TELEGRAM_BOT_TOKEN на странице /api/health.</p>}
          {botResult === "notoken" && <p className="rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">Не задан TELEGRAM_BOT_TOKEN.</p>}
          <p className="text-[14px]">
            Статус:{" "}
            {webhook?.url ? (
              <b className="text-brand-dark">подключён</b>
            ) : (
              <b className="text-danger">не подключён</b>
            )}
            {webhook?.url && <span className="block text-[12px] text-muted">{webhook.url}</span>}
            {webhook?.last_error_message && <span className="block text-[12px] text-danger">Последняя ошибка: {webhook.last_error_message}</span>}
          </p>
          <form action={connectBot}>
            <button className="btn-primary h-10 text-[14px]">{webhook?.url ? "Переподключить бота" : "Подключить бота к сайту"}</button>
          </form>
          <p className="text-[12px] text-muted">Нажимайте эту кнопку на том адресе сайта, где он будет работать (например, после подключения домена nomerok.ge — зайдите в админку через него и нажмите ещё раз).</p>
        </div>
      )}

      {tab === "masters" && (
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-4 text-[14px]">
            <span className="grow">
              <b>Демо-профили</b> (с пометкой «Пример профиля», без настоящих телефонов): {masters.filter((x) => isDemoSlug(x.slug)).length}
              {demoResult?.startsWith("added") && <span className="ml-2 text-brand-dark">добавлено: {demoResult.slice(5)}</span>}
              {demoResult?.startsWith("removed") && <span className="ml-2 text-brand-dark">удалено: {demoResult.slice(7)}</span>}
            </span>
            <form action={addDemo}><button className="btn-ghost h-9 px-4 text-[13px]">Добавить примеры</button></form>
            <form action={removeDemo}><button className="btn-ghost h-9 px-4 text-[13px] text-danger">Удалить все примеры</button></form>
          </div>
          <p className="text-[13px] text-muted">«Открытий» — сколько разных посетителей открыли контакты специалиста в этом месяце. Пригодится для расчёта оплаты.</p>
          {others.length === 0 && <Empty text="Опубликованных специалистов пока нет. Опубликуйте анкету или добавьте специалиста вручную." />}
          {others.map((m) => (
            <MasterRow key={m.id} m={m} views={views[m.id] ?? 0} back="/admin?tab=masters" />
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl bg-white p-6 text-center text-[14px] text-muted">{text}</p>;
}

function MasterRow({ m, views, back }: { m: Master; views: number; back: string }) {
  const actions: { status: Master["status"]; label: string; primary?: boolean }[] =
    m.status === "published"
      ? [{ status: "hidden", label: "Скрыть" }]
      : [{ status: "published", label: "Опубликовать", primary: true }, ...(m.status === "pending" ? [{ status: "rejected" as const, label: "Отклонить" }] : [])];
  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link href={`/admin/masters/${m.id}`} className="text-[16px] font-semibold hover:underline">{m.name}</Link>
          <div className="text-[13px] text-muted">
            {categoryLabel(m.category)} · {formatPhone(m.phone)}{m.telegram ? ` · @${m.telegram}` : ""} · {when(m.created_at)}
          </div>
          <div className="mt-1 text-[12px]">
            {m.phone_verified_at ? (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand-dark">✓ номер подтверждён в Telegram</span>
            ) : m.tg_chat_id ? (
              <span className="rounded-full bg-[#fdf6e6] px-2 py-0.5 text-[#5a4a22]">Telegram подключён, номер не подтверждён</span>
            ) : (
              <span className="rounded-full bg-cream px-2 py-0.5 text-muted">Telegram не подключён</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="rounded-full bg-cream px-2.5 py-0.5">{MASTER_LABEL[m.status]}</span>
          <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-brand-dark">Открытий: {views}</span>
        </div>
      </div>
      <p className="mt-2 line-clamp-3 whitespace-pre-line text-[14px] text-[#3a3935]">{m.services}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((a) => (
          <form key={a.status} action={setMasterStatus}>
            <input type="hidden" name="id" value={m.id} />
            <input type="hidden" name="status" value={a.status} />
            <input type="hidden" name="back" value={back} />
            <button className={a.primary ? "btn-primary h-9 px-4 text-[13px]" : "btn-ghost h-9 px-4 text-[13px]"}>{a.label}</button>
          </form>
        ))}
        <Link href={`/admin/masters/${m.id}`} className="btn-ghost h-9 px-4 text-[13px]">Редактировать</Link>
        {m.status === "published" && (
          <Link href={`/ru/master/${m.slug}`} target="_blank" className="btn-ghost h-9 px-4 text-[13px]">На сайте ↗</Link>
        )}
      </div>
    </div>
  );
}
