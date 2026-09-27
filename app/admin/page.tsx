import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { adminContactViewsThisMonth, adminListMasters, adminListRequests, adminListResponses, dbMode } from "@/lib/db";
import { tg, telegramToken } from "@/lib/telegram";
import { categoryLabel } from "@/lib/categories";
import { formatPhone, whatsappLink } from "@/lib/phone";
import type { Master, RequestStatus } from "@/lib/types";
import { adminUnarchive, connectBot, deleteReview, logout, removeDemo, runFollowupsNow, setComplaintStatus, setMasterStatus, setRequestStatus, setReviewStatus } from "./actions";
import { adminListComplaints, adminListReviews } from "@/lib/reviews-db";
import { getDict } from "@/lib/i18n";
import { signedUrls } from "@/lib/documents";
import { AdminDocs } from "@/components/AdminDocs";
import { DEMO_UNTIL, isDemoSlug } from "@/lib/demo";
import { isAwayNow } from "@/lib/availability";

export const dynamic = "force-dynamic";

const REQ_LABEL: Record<RequestStatus, string> = { new: "Новая", sent: "Разослана", taken: "Есть отклик", in_work: "В работе", done: "Готово", spam: "Спам" };
const MASTER_LABEL: Record<Master["status"], string> = { pending: "На проверке", published: "Опубликован", hidden: "Скрыт", rejected: "Отклонён" };

function when(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", { timeZone: "Asia/Tbilisi", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; bot?: string; demo?: string; fu?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (dbMode() === "none") {
    return <p className="rounded-2xl bg-white p-6">База не подключена. Добавьте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в Vercel.</p>;
  }
  const { tab = "requests", bot: botResult, fu } = await searchParams;
  const [masters, requests, views, responses] = await Promise.all([
    adminListMasters(),
    adminListRequests(),
    adminContactViewsThisMonth(),
    adminListResponses().catch(() => []),
  ]);
  // Если миграция 0003 ещё не выполнена — таблиц нет, показываем подсказку
  let needMigration = false;
  const [reviews, complaints] = await Promise.all([
    adminListReviews().catch(() => ((needMigration = true), [])),
    adminListComplaints().catch(() => ((needMigration = true), [])),
  ]);
  const pendingReviews = reviews.filter((r) => r.status === "pending").length;
  const docsToCheck = masters.flatMap((m) => (m.documents ?? []).filter((d) => d.status === "pending").map((d) => ({ m, d })));
  const docUrls = tab === "docs" ? await signedUrls(docsToCheck.map((x) => x.d.path)).catch(() => ({}) as Record<string, string>) : {};
  const newComplaints = complaints.filter((c) => c.status === "new").length;
  const REASONS = getDict("ru").complaint.reasons as Record<string, string>;
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
    { id: "reviews", label: `Отзывы${pendingReviews ? ` · ${pendingReviews} на проверке` : ""}` },
    { id: "docs", label: `Документы${docsToCheck.length ? ` · ${docsToCheck.length} на проверке` : ""}` },
    { id: "complaints", label: `Жалобы${newComplaints ? ` · ${newComplaints} новых` : ""}` },
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

      {needMigration && (
        <p className="mt-4 rounded-2xl bg-[#fdecea] p-4 text-[14px] text-danger">
          Отзывы и жалобы ещё не включены: выполните в Supabase файл <b>supabase/migrations/0003_reviews.sql</b> (SQL Editor → New query → вставить → Run).
        </p>
      )}

      {tab === "reviews" && (
        <div className="mt-5 space-y-3">
          {reviews.length === 0 && <Empty text="Отзывов пока нет. Клиенты оставляют их по ссылке из бота: сами со страницы специалиста или по приглашению после выполненной заявки." />}
          {reviews.map((r) => {
            const m = byId.get(r.master_id);
            return (
              <div key={r.id} className={`rounded-2xl bg-white p-4 ${r.status === "pending" ? "ring-2 ring-accent" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
                  <span>
                    {when(r.created_at)} · о {m ? <Link className="underline" href={`/admin/masters/${m.id}`}>{m.name}</Link> : "—"} · от <b className="text-ink">{r.author_name}</b>
                    {r.request_id ? " · клиент по заявке" : ""}
                  </span>
                  <span className="rounded-full bg-cream px-2.5 py-0.5">{r.status === "pending" ? "На проверке" : r.status === "published" ? "Опубликован" : "Отклонён"}</span>
                </div>
                <p className="mt-2 text-[18px] text-[#e5a50a]">{"★".repeat(r.rating)}<span className="text-[#dcd8cc]">{"★".repeat(5 - r.rating)}</span></p>
                <p className="mt-1 whitespace-pre-line text-[15px]">{r.text}</p>
                {r.photos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.photos.map((p) => (
                      <a key={p} href={p} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p} alt="" className="h-20 w-20 rounded-xl object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                {r.reply && <p className="mt-2 rounded-xl bg-cream p-2.5 text-[13px]"><b>Ответ специалиста:</b> {r.reply}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status !== "published" && (
                    <form action={setReviewStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="published" />
                      <button className="btn-primary h-9 px-4 text-[13px]">Опубликовать</button>
                    </form>
                  )}
                  {r.status !== "rejected" && (
                    <form action={setReviewStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button className="btn-ghost h-9 px-4 text-[13px]">{r.status === "published" ? "Снять с сайта" : "Отклонить"}</button>
                    </form>
                  )}
                  <form action={deleteReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="h-9 px-3 text-[13px] text-danger hover:underline">Удалить</button>
                  </form>
                </div>
              </div>
            );
          })}
          <p className="text-[12px] text-muted">Публикуйте честные отзывы, в том числе негативные. Отклоняйте только оскорбления, рекламу, чужие личные данные и отзывы не по делу.</p>
        </div>
      )}

      {tab === "docs" && (
        <div className="mt-5 space-y-4">
          {docsToCheck.length === 0 && <Empty text="Новых документов нет. Проверенные и отклонённые видны на странице специалиста." />}
          {[...new Set(docsToCheck.map((x) => x.m.id))].map((id) => {
            const m = byId.get(id)!;
            return (
              <div key={id} className="rounded-2xl bg-white p-4">
                <p className="mb-2 text-[15px]">
                  <Link href={`/admin/masters/${m.id}`} className="font-semibold underline">{m.name}</Link>{" "}
                  <span className="text-muted">· {categoryLabel(m.category)}</span>
                </p>
                <AdminDocs masterId={m.id} docs={docsToCheck.filter((x) => x.m.id === id).map((x) => x.d)} urls={docUrls} back="/admin?tab=docs" />
              </div>
            );
          })}
          <p className="text-[12px] text-muted">Проверьте, что документ читается и имя совпадает со специалистом. Если документ показывается клиентам, а на нём виден номер паспорта или другие личные данные, лучше отклонить и попросить загрузить с закрытыми данными.</p>
        </div>
      )}

      {tab === "complaints" && (
        <div className="mt-5 space-y-3">
          {complaints.length === 0 && <Empty text="Жалоб нет." />}
          {complaints.map((c) => {
            const m = c.master_id ? byId.get(c.master_id) : null;
            const label = { new: "Новая", in_review: "В работе", resolved: "Решена", rejected: "Отклонена" }[c.status];
            return (
              <div key={c.id} className={`rounded-2xl bg-white p-4 ${c.status === "new" ? "ring-2 ring-danger/60" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
                  <span>
                    {when(c.created_at)} · <b className="text-ink">{REASONS[c.reason] ?? c.reason}</b> · на{" "}
                    {m ? <Link className="underline" href={`/admin/masters/${m.id}`}>{m.name}</Link> : c.master_name || "не указано"}
                  </span>
                  <span className="rounded-full bg-cream px-2.5 py-0.5">{label}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-[15px]">{c.text}</p>
                <p className="mt-2 text-[14px]">Контакт: <b>{c.contact}</b></p>
                {c.photos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.photos.map((p) => (
                      <a key={p} href={p} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p} alt="" className="h-20 w-20 rounded-xl object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["in_review", "resolved", "rejected"] as const).filter((s) => s !== c.status).map((s) => (
                    <form key={s} action={setComplaintStatus}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="status" value={s} />
                      <button className="h-9 rounded-full border border-line px-3 text-[13px] hover:bg-cream">
                        {{ in_review: "В работу", resolved: "Решено", rejected: "Отклонить" }[s]}
                      </button>
                    </form>
                  ))}
                  {m && m.status === "published" && (
                    <form action={setMasterStatus}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="status" value="hidden" />
                      <input type="hidden" name="back" value="/admin?tab=complaints" />
                      <button className="h-9 rounded-full border border-danger/40 px-3 text-[13px] text-danger hover:bg-[#fdecea]">Скрыть профиль</button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
          <p className="text-[12px] text-muted">Специалист жалобу не видит. Свяжитесь с клиентом и со специалистом, выслушайте обе стороны. Скрытый профиль можно вернуть во вкладке «Специалисты».</p>
        </div>
      )}

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
                  {r.outcome === "agreed" && <> · 🤝 договорились{r.outcome_master_id && byId.get(r.outcome_master_id) ? ` с ${byId.get(r.outcome_master_id)!.name}` : ""}</>}
                  {r.outcome === "none" && <b className="text-danger"> · 😕 клиенту никто не помог</b>}
                  {r.outcome === "closed" && " · 🔒 клиент закрыл заявку"}
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
          <div className="border-t border-line pt-4">
            <h3 className="font-semibold">Напоминания клиентам</h3>
            <p className="mt-1 text-[14px] text-muted">
              Каждый день в 11:00 бот: пишет клиентам, если заявку за сутки никто не взял; спрашивает «Удалось договориться?» через сутки после отклика; просит отзыв через 2 дня после договорённости. Специалистам: личную заявку без ответа сутки передаёт другим (после 3 таких подряд — архив); кто месяц не был активен — предупреждает, ещё через 7 дней — архив; снимает закончившиеся паузы.
            </p>
            {fu && fu !== "fail" && (
              <p className="mt-2 rounded-xl bg-brand-soft p-3 text-[14px] text-brand-dark">
                «Никто не взял» — {fu.split("-")[0]}, «удалось договориться?» — {fu.split("-")[1]}, просьб об отзыве — {fu.split("-")[2]}, пауз
                закончилось — {fu.split("-")[3] ?? 0}, личных заявок передано другим — {fu.split("-")[4] ?? 0}, предупреждений «давно не заходили» —{" "}
                {fu.split("-")[5] ?? 0}, в архив — {fu.split("-")[6] ?? 0}
              </p>
            )}
            {fu === "fail" && <p className="mt-2 rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">Не получилось. Выполнена ли миграция 0003?</p>}
            <form action={runFollowupsNow} className="mt-3">
              <button className="btn-ghost h-10 text-[14px]">Отправить напоминания сейчас</button>
            </form>
          </div>
          <p className="text-[12px] text-muted">Нажимайте эту кнопку на том адресе сайта, где он будет работать (например, после подключения домена nomerok.ge — зайдите в админку через него и нажмите ещё раз).</p>
        </div>
      )}

      {tab === "masters" && (
        <div className="mt-5 space-y-3">
          <div className="rounded-2xl bg-white p-4 text-[14px]">
            <b>Примеры профилей</b> (8 шт., с пометкой «Пример профиля», без контактов) показываются на сайте автоматически,
            пока опубликовано меньше {DEMO_UNTIL} настоящих специалистов. Сейчас настоящих: {masters.filter((x) => x.status === "published" && !isDemoSlug(x.slug)).length}.
            {masters.some((x) => isDemoSlug(x.slug)) && (
              <form action={removeDemo} className="mt-2"><button className="btn-ghost h-9 px-4 text-[13px] text-danger">Удалить старые примеры из базы</button></form>
            )}
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
            {[m.category, ...(m.extra_categories ?? [])].map((c) => categoryLabel(c)).join(", ")} · {formatPhone(m.phone)}{m.telegram ? ` · @${m.telegram}` : ""} · {when(m.created_at)}
            {m.last_active_at ? ` · был(а) активен: ${when(m.last_active_at)}` : ""}
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
          {m.archived_at && <span className="rounded-full bg-[#fdecea] px-2.5 py-0.5 text-danger">📦 архив{m.archived_reason === "missed" ? " (не отвечал на заявки)" : m.archived_reason === "inactive" ? " (месяц без активности)" : ""}</span>}
          {isAwayNow(m) && <span className="rounded-full bg-[#fdf6e6] px-2.5 py-0.5 text-[#5a4a22]">⏸ пауза{m.away_until ? ` до ${m.away_until}` : ""}</span>}
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
        {m.archived_at && (
          <form action={adminUnarchive}>
            <input type="hidden" name="id" value={m.id} />
            <button className="btn-ghost h-9 px-4 text-[13px]">Вернуть из архива</button>
          </form>
        )}
        {m.status === "published" && (
          <Link href={`/ru/master/${m.slug}`} target="_blank" className="btn-ghost h-9 px-4 text-[13px]">На сайте ↗</Link>
        )}
      </div>
    </div>
  );
}
