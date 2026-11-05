import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { computeGaps } from "@/lib/gaps";
import { categoryLabel, categoryPlural } from "@/lib/categories";
import { cityLabel } from "@/lib/cities";

export const dynamic = "force-dynamic";

const DOT = { red: "🔴", orange: "🟠", green: "🟢" } as const;
const WHAT = {
  red: "Заявки есть, а получать их некому. Найдите 2–3 специалистов и пригласите.",
  orange: "Получателей мало или кто-то остался без отклика. Пригласите ещё 1–2.",
  green: "Хватает.",
} as const;

export default async function AdminGaps() {
  if (!(await isAdmin())) redirect("/admin/login");
  const { rows, thinBatumi, notFound } = await computeGaps();
  const th = "px-3 py-2 text-left text-[12px] font-semibold uppercase tracking-wide text-muted";
  const td = "px-3 py-2.5 text-[14px]";
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/admin" className="text-[14px] text-muted">
        ← Админка
      </Link>
      <h1 className="mt-2 text-[26px] font-bold">🕳 Пробелы: где не хватает специалистов</h1>
      <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-muted">
        Зовите специалистов туда, где их уже ждут клиенты. «Получают заявки» — анкеты этого направления и города с подключённым Telegram, не в отпуске. Ссылка для приглашения: <b>nomerok.ge/ru/join</b>.
      </p>

      <h2 className="mt-8 text-[20px] font-bold">Заявки за 30 дней по направлениям</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-[14px] text-muted">Заявок пока нет.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-line bg-cream">
              <tr>
                <th className={th}>Направление</th>
                <th className={th}>Город</th>
                <th className={th}>Заявок</th>
                <th className={th}>Без отклика</th>
                <th className={th}>Получают заявки</th>
                <th className={th}>В каталоге</th>
                <th className={th}>Что сделать</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.cat + r.city}>
                  <td className={`${td} font-semibold`}>
                    {DOT[r.level]} {categoryLabel(r.cat, "ru")}
                  </td>
                  <td className={td}>{cityLabel(r.city, "ru")}</td>
                  <td className={td}>{r.requests}</td>
                  <td className={`${td} ${r.noResponse ? "font-semibold text-danger" : ""}`}>{r.noResponse}</td>
                  <td className={`${td} ${r.receivers === 0 ? "font-semibold text-danger" : ""}`}>{r.receivers}</td>
                  <td className={td}>{r.catalog}</td>
                  <td className={`${td} text-[13px] text-muted`}>{WHAT[r.level]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-10 text-[20px] font-bold">Искали в каталоге и ничего не нашли (30 дней)</h2>
      {notFound.length === 0 ? (
        <p className="mt-2 text-[14px] text-muted">Таких поисков нет.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {notFound.map((s) => (
            <span key={s.q} className="rounded-full border border-line bg-white px-3 py-1 text-[14px]">
              {s.q} <span className="text-muted">· {s.n}</span>
            </span>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-[20px] font-bold">Батуми: направления, где меньше 2 анкет</h2>
      <p className="mt-1 text-[14px] text-muted">Заявок может ещё не быть, но клиент, открыв такой раздел, увидит пустоту.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {thinBatumi.map((x) => (
          <span key={x.cat} className={`rounded-full border px-3 py-1 text-[14px] ${x.catalog === 0 ? "border-danger/40 bg-[#fdf1f0]" : "border-line bg-white"}`}>
            {categoryPlural(x.cat, "ru")} <span className="text-muted">· {x.catalog}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
