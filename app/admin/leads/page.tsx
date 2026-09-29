import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { LeadsFinder } from "@/components/LeadsFinder";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="space-y-4">
      <Link href="/admin?tab=masters" className="text-[14px] text-muted hover:text-ink">
        ← Назад
      </Link>
      <h1 className="text-[22px] font-bold">Поиск специалистов в чатах</h1>
      <details className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed" open>
        <summary className="cursor-pointer font-semibold">Как пользоваться</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Откройте <b>Telegram на компьютере</b> (Telegram Desktop) и зайдите в нужный чат — например, «Батуми услуги».</li>
          <li>Нажмите <b>⋮</b> (три точки справа вверху) → <b>«Экспорт истории чата»</b>.</li>
          <li>Снимите все галочки (фото, видео, файлы — не нужны). Формат — <b>«JSON»</b>. Период — например, последний месяц. Нажмите «Экспорт».</li>
          <li>Telegram сохранит папку с файлом <b>result.json</b>. Выберите его ниже (можно сразу несколько файлов из разных чатов).</li>
          <li>Откройте сообщение → нажмите на имя автора → напишите ему. Текст приглашения копируется кнопкой. После отправки нажмите <b>«Написал ✓»</b> — больше он в списке не появится.</li>
        </ol>
        <p className="mt-2 text-muted">
          Файл читается прямо в вашем браузере и никуда не загружается. Пишите вручную и не больше 20–30 человек в день — иначе Telegram может ограничить аккаунт.
        </p>
      </details>
      <LeadsFinder />
    </div>
  );
}
