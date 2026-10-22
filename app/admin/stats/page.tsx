import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getStats } from "@/lib/stats-db";
import { adminListMasters } from "@/lib/db";
import { siteSummary } from "@/lib/site-stats";
import { joinFunnel } from "@/lib/join-starts";

export const dynamic = "force-dynamic";

const ROWS = [
  { key: "visitors", label: "Посетители профилей", hint: "сколько разных людей за день открывали профили специалистов (итог — сумма по дням)", color: "#1f6b4f" },
  { key: "views", label: "Просмотры профилей", hint: "один человек — один просмотр профиля в день", color: "#6aa88b" },
  { key: "contacts", label: "Открыли контакты", hint: "нажали «Показать контакты» или кнопку Telegram", color: "#e0a526" },
  { key: "requests", label: "Заявки клиентов", hint: "", color: "#229ED9" },
  { key: "signups", label: "Новые специалисты", hint: "заполнили анкету", color: "#8134af" },
] as const;

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const period = Math.min(90, Math.max(7, Number((await searchParams).d) || 30));
  const [{ days, top }, masters, site, jf] = await Promise.all([getStats(period), adminListMasters(), siteSummary(period), joinFunnel(period)]);
  const srcMax = Math.max(1, ...site.sources.map((s) => s.n));
  const name = new Map(masters.map((m) => [m.id, m]));
  const sum = (k: (typeof ROWS)[number]["key"]) => days.reduce((s, d) => s + d[k], 0);
  const last7 = (k: (typeof ROWS)[number]["key"]) => days.slice(-7).reduce((s, d) => s + d[k], 0);
  const prev7 = (k: (typeof ROWS)[number]["key"]) => days.slice(-14, -7).reduce((s, d) => s + d[k], 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/admin" className="text-[14px] text-muted hover:text-ink">
          ← Назад
        </Link>
        <div className="flex gap-1 rounded-full bg-white p-1 text-[13px]">
          {[7, 30, 90].map((d) => (
            <Link key={d} href={`/admin/stats?d=${d}`} className={`rounded-full px-3 py-1.5 ${d === period ? "bg-ink text-white" : ""}`}>
              {d} дней
            </Link>
          ))}
        </div>
      </div>
      <h1 className="text-[22px] font-bold">Статистика</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {ROWS.map((r) => {
          const a = last7(r.key);
          const b = prev7(r.key);
          const diff = b ? Math.round(((a - b) / b) * 100) : null;
          return (
            <div key={r.key} className="rounded-2xl bg-white p-4">
              <p className="text-[12px] text-muted">{r.label}</p>
              <p className="mt-1 text-[26px] font-bold">{sum(r.key)}</p>
              <p className="text-[12px] text-muted">
                за 7 дней: {a}
                {diff != null && <span className={diff >= 0 ? "text-brand" : "text-danger"}> ({diff >= 0 ? "+" : ""}{diff}%)</span>}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4">
          <p className="font-semibold">Посетители сайта: {site.visitors}</p>
          <p className="text-[12px] text-muted">разные люди за {period} дней · откуда пришли</p>
          <div className="mt-3 space-y-1.5 text-[13px]">
            {site.sources.slice(0, 12).map((s) => (
              <div key={s.source} className="flex items-center gap-2">
                <span className="w-28 shrink-0 truncate">{s.source}</span>
                <span className="h-2.5 rounded-full bg-brand" style={{ width: `${(s.n / srcMax) * 60}%`, minWidth: 4 }} />
                <span className="text-muted">{s.n}</span>
              </div>
            ))}
            {!site.sources.length && <p className="text-muted">Пока нет данных — счёт начался с этого обновления.</p>}
          </div>
          <p className="mt-3 text-[12px] text-muted">
            Чтобы видеть, откуда люди пришли по вашей ссылке, добавляйте к ней метку: <b>nomerok.ge/ru?from=stories</b> (или from=yesbatumi, from=threads…).
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="font-semibold">Регистрация через бота</p>
          <p className="text-[12px] text-muted">за {period} дней: где люди останавливаются</p>
          <div className="mt-3 space-y-1.5 text-[14px]">
            <p>📱 Поделились номером: <b>{jf.started}</b></p>
            <p>👀 Открыли анкету: <b>{jf.opened}</b></p>
            <p>✅ Отправили анкету: <b>{jf.done}</b></p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4">
        <p className="font-semibold">Что искали в каталоге</p>
        <p className="text-[12px] text-muted">красным — ничего не нашли: этих специалистов стоит позвать в первую очередь</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[13px]">
          {site.searches.slice(0, 60).map((s) => (
            <span key={s.q} className={`rounded-full px-2.5 py-1 ${s.found ? "bg-cream" : "bg-[#fde8e8] text-danger"}`}>
              {s.q}
              {s.n > 1 && <b> ×{s.n}</b>}
            </span>
          ))}
          {!site.searches.length && <p className="text-muted">Пока пусто.</p>}
        </div>
      </div>

      {ROWS.map((r) => {
        const max = Math.max(1, ...days.map((d) => d[r.key]));
        return (
          <div key={r.key} className="rounded-2xl bg-white p-4">
            <p className="font-semibold">{r.label}</p>
            {r.hint && <p className="text-[12px] text-muted">{r.hint}</p>}
            <div className="mt-3 flex h-28 items-end gap-[2px]">
              {days.map((d) => (
                <div key={d.day} className="group relative flex-1" style={{ height: "100%" }} title={`${d.day}: ${d[r.key]}`}>
                  <div className="absolute bottom-0 w-full rounded-t-[3px]" style={{ height: `${(d[r.key] / max) * 100}%`, minHeight: d[r.key] ? 3 : 0, background: r.color }} />
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-muted">
              <span>{days[0]?.day.slice(5).split("-").reverse().join(".")}</span>
              <span>макс. {max} в день</span>
              <span>{days.at(-1)?.day.slice(5).split("-").reverse().join(".")}</span>
            </div>
          </div>
        );
      })}

      <div className="rounded-2xl bg-white p-4">
        <p className="font-semibold">Самые просматриваемые профили</p>
        <table className="mt-2 w-full text-[14px]">
          <thead className="text-left text-[12px] text-muted">
            <tr>
              <th className="py-1">Специалист</th>
              <th className="py-1 text-right">Просмотры</th>
              <th className="py-1 text-right">Контакты</th>
            </tr>
          </thead>
          <tbody>
            {top.map((t) => (
              <tr key={t.master_id} className="border-t border-line">
                <td className="py-1.5">
                  <Link href={`/admin/masters/${t.master_id}`} className="hover:underline">
                    {name.get(t.master_id)?.name ?? "—"}
                  </Link>
                </td>
                <td className="py-1.5 text-right">{t.views}</td>
                <td className="py-1.5 text-right">{t.contacts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[13px] text-muted">
        Здесь — действия на сайте из нашей базы. Общая посещаемость всех страниц (главная, откуда пришли, страны, телефоны/компьютеры) — в Vercel: vercel.com → проект nomerok → вкладка <b>Analytics</b>.
      </p>
    </div>
  );
}
