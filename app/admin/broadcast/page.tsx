import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { adminListMasters } from "@/lib/db";
import { sendBroadcast, sendCardBroadcast } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CARD_TEXT = `Здравствуйте! Это NomerOk 👋

Сделали для вас карточку для сторис — она на картинке. Выложите её в Instagram и добавьте стикер «Ссылка» с адресом вашего профиля:
{ссылка}

Клиенты откроют ваши контакты и отзывы в одно касание. Ту же ссылку можно поставить в шапку профиля Instagram.

Другие варианты (светлая, с фото, с QR-кодом) — в личном кабинете, вкладка «🚀 Продвижение».

Дмитрий, NomerOk.ge`;

const DEFAULT = `Здравствуйте! Это NomerOk 👋

Мы поменяли рассылку заявок: теперь заявки клиентов приходят **только тем, кто сам на них подписался**. Так вам не будут приходить лишние сообщения.

Хотите получать заявки своего направления? Нажмите «🔔 Получать заявки» ниже. Передумаете — команда /zayavki или переключатель в личном кабинете.

Личные сообщения от клиентов («Написать через сайт») приходят как раньше.

Ещё новое: в кабинете появилась **картинка для сторис** с QR-кодом на ваш профиль — выложите её в Instagram или Telegram.

Дмитрий, NomerOk`

export default async function BroadcastPage({ searchParams }: { searchParams: Promise<{ sent?: string; failed?: string; cs?: string; cf?: string; ct?: string; cfrom?: string; cnext?: string }> }) {
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
      <form id="cards" action={sendCardBroadcast} className="space-y-3 rounded-2xl border-2 border-accent/50 bg-white p-4">
        <h2 className="text-[17px] font-bold">🖼 Рассылка карточек для сторис</h2>
        <p className="text-[13px] text-muted">
          Каждому опубликованному специалисту с Telegram ({published}) бот пришлёт его карточку 1080×1920 (с фото — если оно есть, иначе зелёную), этот текст и кнопку «Личный кабинет» → «Продвижение». <b>{"{ссылка}"}</b> заменится на ссылку его профиля. Отправка порциями по 20.
        </p>
        {sp.cs && (
          <p className="rounded-xl bg-brand-soft p-3 text-[14px] font-semibold text-brand-dark">
            Отправлено {Number(sp.cfrom ?? 0) + 1}–{Number(sp.cfrom ?? 0) + Number(sp.cs) + Number(sp.cf ?? 0)} из {sp.ct}: доставлено {sp.cs}
            {Number(sp.cf) > 0 ? `, не доставлено ${sp.cf}` : ""}. {sp.cnext ? "Нажмите «Продолжить», чтобы отправить следующим." : "Готово — всем отправлено ✅"}
          </p>
        )}
        <textarea name="text" rows={13} defaultValue={CARD_TEXT} required maxLength={900} className="field w-full py-2 text-[14px]" />
        <input type="hidden" name="from" value={sp.cnext ?? "0"} />
        <p className="text-[12px] text-muted">Подпись к картинке в Telegram — до 1024 знаков. Сначала можно проверить на себе: откройте свой кабинет → «Продвижение».</p>
        {!(sp.cs && !sp.cnext) && (
          <ConfirmButton message={sp.cnext ? "Отправить следующим 20 специалистам?" : "Отправить карточки первым 20 специалистам?"} className="btn h-11 bg-accent px-5 font-semibold text-ink hover:bg-[#cf9620]">
            {sp.cnext ? `▶️ Продолжить (с ${Number(sp.cnext) + 1}-го)` : "🖼 Разослать карточки"}
          </ConfirmButton>
        )}
      </form>
      <h2 className="pt-2 text-[17px] font-bold">Обычное сообщение</h2>
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
