import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { adminListMasters } from "@/lib/db";
import { sendBroadcast } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT = `Здравствуйте! Это NomerOk 👋

Мы поменяли рассылку заявок: теперь заявки клиентов приходят **только тем, кто сам на них подписался**. Так вам не будут приходить лишние сообщения.

Хотите получать заявки своего направления? Нажмите «🔔 Получать заявки» ниже. Передумаете — команда /zayavki или переключатель в личном кабинете.

Личные сообщения от клиентов («Написать через сайт») приходят как раньше.

Ещё новое: в кабинете появилась **картинка для сторис** с QR-кодом на ваш профиль — выложите её в Instagram или Telegram.

Дмитрий, NomerOk`

export default async function BroadcastPage({ searchParams }: { searchParams: Promise<{ sent?: string; failed?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const sp = await searchParams;
  const all = await adminListMasters();
  const withBot = all.filter((m) => m.tg_chat_id && !m.archived_at && !m.slug.startsWith("demo-"));
  const published = withBot.filter((m) => m.status === "published").length;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/admin" className="text-[14px] text-muted hover:text-ink">
        ← Назад
      </Link>
      <h1 className="text-[22px] font-bold">Рассылка специалистам</h1>
      <p className="text-[14px] text-muted">
        Сообщение придёт от бота NomerOk всем, у кого подключён Telegram: опубликованным — {published}, всего с ботом — {withBot.length}. Ответы придут вам как «Сообщение боту».
      </p>
      {sp.sent && (
        <p className="rounded-xl bg-brand-soft p-3 text-[14px] font-semibold text-brand-dark">
          Отправлено: {sp.sent}
          {Number(sp.failed) > 0 ? ` · не доставлено: ${sp.failed} (остановили бота)` : ""}
        </p>
      )}
      <form action={sendBroadcast} className="space-y-3 rounded-2xl bg-white p-4">
        <textarea name="text" rows={16} defaultValue={DEFAULT} required className="field w-full py-2 text-[14px]" />
        <p className="text-[12px] text-muted">**текст** — жирным. Не рассылайте чаще раза в неделю, иначе люди отключают бота.</p>
        <label className="flex items-center gap-2 text-[14px]">
          <input type="checkbox" name="cabinet" defaultChecked className="h-4 w-4 accent-[#1f6b4f]" /> Добавить кнопку «Личный кабинет» (у каждого своя ссылка для входа)
        </label>
        <label className="flex items-center gap-2 text-[14px]">
          <input type="checkbox" name="subscribe" defaultChecked className="h-4 w-4 accent-[#1f6b4f]" /> Добавить кнопки «🔔 Получать заявки / 🔕 Не получать»
        </label>
        <label className="flex items-center gap-2 text-[14px]">
          <input type="checkbox" name="all" className="h-4 w-4 accent-[#1f6b4f]" /> Отправить и тем, чья анкета ещё не опубликована
        </label>
        <ConfirmButton message="Отправить сообщение всем специалистам?" className="btn-primary h-11 px-5">
          📣 Отправить
        </ConfirmButton>
      </form>
    </div>
  );
}
