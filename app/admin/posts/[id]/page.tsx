import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getPost, parsePostBody } from "@/lib/posts-db";
import { RUBRICS, type Rubric } from "@/lib/articles";
import { CATEGORIES } from "@/lib/categories";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deletePostAction, savePostAction } from "../actions";
import { AdminPostPhotos } from "@/components/AdminPostPhotos";

export const dynamic = "force-dynamic";

const HELP = `Как оформлять текст:
• пустая строка — новый абзац
• ## Заголовок — подзаголовок
• - пункт — список (или 1. пункт — нумерованный)
• ! текст — важная подсказка (жёлтая плашка)
• @места: адрес1, адрес2 — карточки мест для подборки (адрес — конец ссылки nomerok.ge/ru/places/…)`;

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const sp = await searchParams;
  const p = id === "new" ? null : await getPost(id);
  if (id !== "new" && !p) notFound();
  const blocks = p ? parsePostBody(p.body) : [];
  const label = "block text-[13px] font-semibold";
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/posts" className="text-[14px] text-muted">← Журнал</Link>
      <h1 className="mt-3 text-2xl font-bold">{p ? "Редактировать запись" : "Новая запись"}</h1>
      {sp.ok === "pub" && p && (
        <p className="mt-3 rounded-xl bg-brand-soft p-3 text-[14px] font-semibold text-brand-dark">
          ✓ Опубликовано —{" "}
          <a href={`/ru/guide/${p.slug}`} target="_blank" className="underline">
            открыть на сайте ↗
          </a>
        </p>
      )}
      {sp.ok === "draft" && <p className="mt-3 rounded-xl bg-white p-3 text-[14px] font-semibold">✓ Черновик сохранён — на сайте его не видно</p>}
      {sp.err && <p className="mt-3 rounded-xl bg-white p-3 text-[14px] font-semibold text-danger">⚠️ {sp.err}</p>}

      <form action={savePostAction} className="mt-4 space-y-4 rounded-2xl bg-white p-5 text-[14px]">
        {p && <input type="hidden" name="id" value={p.id} />}
        <label className="block">
          <span className={label}>Заголовок *</span>
          <input name="title" required defaultValue={p?.title} className="field mt-1 w-full" placeholder="В Батуми 15 октября отключат воду в Старом городе" />
        </label>
        <label className="block">
          <span className={label}>Коротко (1–2 предложения, видно в ленте и в начале)</span>
          <textarea name="lead" rows={2} defaultValue={p?.lead} className="field mt-1 w-full py-2" />
        </label>
        <label className="block">
          <span className={label}>Текст</span>
          <textarea name="body" rows={14} defaultValue={p?.body} className="field mt-1 w-full py-2 font-mono text-[13px]" placeholder={HELP} />
          <span className="mt-1 block whitespace-pre-line text-[12px] text-muted">{HELP}</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={label}>Рубрика</span>
            <select name="rubric" defaultValue={p?.rubric ?? "news"} className="field mt-1 w-full">
              {(Object.keys(RUBRICS) as Rubric[]).map((k) => (
                <option key={k} value={k}>
                  {RUBRICS[k].emoji} {RUBRICS[k].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={label}>Эмодзи (если нет фото)</span>
            <input name="emoji" defaultValue={p?.emoji ?? "📰"} className="field mt-1 w-full" />
          </label>
          <label className="block">
            <span className={label}>Кнопка на раздел</span>
            <select name="cat" defaultValue={p?.cats?.[0] ?? ""} className="field mt-1 w-full">
              <option value="">— без кнопки —</option>
              {CATEGORIES.filter((c) => c.id !== "other").map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label.ru}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Источник — название</span>
            <input name="source_name" defaultValue={p?.source_name ?? ""} className="field mt-1 w-full" placeholder="Мэрия Батуми" />
          </label>
          <label className="block">
            <span className={label}>Источник — ссылка</span>
            <input name="source_url" defaultValue={p?.source_url ?? ""} className="field mt-1 w-full" placeholder="https://…" />
          </label>
        </div>
        <div>
          <span className={label}>Фото-обложка (необязательно, до 4 МБ)</span>
          {p?.cover_url && (
            <div className="mt-1 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.cover_url} alt="" className="h-20 w-32 rounded-lg object-cover" />
              <label className="text-[13px] text-muted">
                <input type="checkbox" name="cover_remove" /> убрать фото
              </label>
            </div>
          )}
          <input type="file" name="cover" accept="image/jpeg,image/png,image/webp" className="mt-1 block text-[13px]" />
        </div>
        <div>
          <span className={label}>Галерея — ещё фото (необязательно)</span>
          <AdminPostPhotos initial={p?.photos ?? []} />
        </div>
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          {p?.status === "published" ? (
            <>
              <button className="btn-primary h-10 px-5">💾 Сохранить изменения</button>
              <button name="unpublish" value="1" className="btn-ghost h-10 px-4 text-[13px]">Снять с публикации</button>
            </>
          ) : (
            <>
              <button name="publish" value="1" className="btn-primary h-10 px-5">🚀 Опубликовать</button>
              <button className="btn-ghost h-10 px-4">Сохранить черновик</button>
            </>
          )}
        </div>
      </form>

      {p && blocks.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">Как будет выглядеть текст</p>
          <div className="mt-2 space-y-3 text-[15px] leading-relaxed">
            {blocks.map((b, i) =>
              "h2" in b ? <h2 key={i} className="text-[19px] font-bold">{b.h2}</h2>
              : "p" in b ? <p key={i}>{b.p}</p>
              : "tip" in b ? <p key={i} className="rounded-xl bg-[#fff8e6] p-3">💡 {b.tip}</p>
              : "places" in b ? <p key={i} className="rounded-xl bg-cream p-3 text-[13px]">📍 Места: {b.places.join(", ")}</p>
              : "list" in b ? (b.ordered ? <ol key={i} className="list-decimal pl-6">{b.list.map((x, j) => <li key={j}>{x}</li>)}</ol> : <ul key={i} className="list-disc pl-6">{b.list.map((x, j) => <li key={j}>{x}</li>)}</ul>)
              : null,
            )}
          </div>
        </div>
      )}

      {p && (
        <form action={deletePostAction} className="mt-6">
          <input type="hidden" name="id" value={p.id} />
          <ConfirmButton message="Удалить запись навсегда?" className="text-[13px] text-danger underline">Удалить запись</ConfirmButton>
        </form>
      )}
    </div>
  );
}
