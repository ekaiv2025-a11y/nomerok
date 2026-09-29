import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { planLinkMoves } from "@/lib/link-migration";
import { LINK_TEXT } from "@/components/SocialLinks";
import { applyLinks } from "../actions";
import type { LinkKind } from "@/lib/links";

export const dynamic = "force-dynamic";

const FIELD: Record<string, string> = { services: "Услуги", about: "О себе", credentials: "Образование" };

/** Админка: перенос ссылок из текста анкет в «Соцсети и сайт». */
export default async function LinksPage({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { done } = await searchParams;
  const moves = await planLinkMoves();
  const names = LINK_TEXT.ru.names;
  return (
    <div className="space-y-4">
      <Link href="/admin?tab=masters" className="text-[14px] text-muted hover:text-ink">
        ← Назад
      </Link>
      <h1 className="text-[22px] font-bold">Ссылки в текстах анкет</h1>
      <p className="text-[14px] text-muted">
        Ссылки на Telegram-каналы, Instagram, Facebook, TikTok, YouTube и сайты из описаний переносятся в блок «Соцсети и сайт» — в профиле они
        станут красивыми кнопками. Строка удаляется из текста, только если в ней кроме ссылки ничего нет. Ссылка на личный Telegram
        специалиста — это его контакт (кнопка «Telegram» уже есть), её просто убираем из текста.
      </p>
      {done && <p className="rounded-xl bg-brand-soft p-3 text-[14px] font-semibold text-brand-dark">Готово: обновлено профилей — {done}</p>}
      {moves.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-[15px]">Ссылок в текстах анкет не найдено 👍</p>
      ) : (
        <>
          <form action={applyLinks}>
            <button className="btn-primary h-11">Перенести у всех ({moves.length})</button>
          </form>
          {moves.map((m) => (
            <div key={m.id} className="rounded-2xl bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <a href={`/ru/master/${m.slug}`} target="_blank" className="font-semibold hover:text-brand">
                  {m.name}
                </a>
                <form action={applyLinks}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="btn-ghost h-9 px-4 text-[13px]">Перенести</button>
                </form>
              </div>
              {Object.keys(m.add).length > 0 && (
                <ul className="mt-2 space-y-1 text-[14px]">
                  {Object.entries(m.add).map(([k, v]) => (
                    <li key={k}>
                      ➕ <b>{names[k as LinkKind]}:</b> <span className="break-all text-brand">{v}</span>
                    </li>
                  ))}
                </ul>
              )}
              {m.texts.map((t) => (
                <div key={t.field} className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-[12px] font-semibold text-muted">{FIELD[t.field]} — было</p>
                    <p className="mt-1 whitespace-pre-line break-words rounded-xl bg-[#fdf0ef] p-3 text-[13px]">{t.before}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-muted">станет</p>
                    <p className="mt-1 whitespace-pre-line break-words rounded-xl bg-brand-soft p-3 text-[13px]">{t.after || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
