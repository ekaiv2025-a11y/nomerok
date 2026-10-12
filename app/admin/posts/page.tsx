import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { adminListPosts } from "@/lib/posts-db";
import { ARTICLES, RUBRICS, type Rubric } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function AdminPosts({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const sp = await searchParams;
  const posts = await adminListPosts().catch(() => []);
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-[14px] text-muted">← Админка</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">📰 Журнал</h1>
        <Link href="/admin/posts/new" className="btn-primary h-10 px-5 text-[14px]">+ Новая запись</Link>
      </div>
      <p className="mt-1 text-[13px] text-muted">Новости и заметки, которые вы публикуете сами. Появляются на сайте сразу после «Опубликовать».</p>
      {sp.deleted && <p className="mt-3 rounded-xl bg-white p-3 text-[14px] font-semibold">✓ Запись удалена</p>}
      <div className="mt-4 space-y-2">
        {posts.length === 0 && <p className="rounded-2xl bg-white p-4 text-[14px] text-muted">Пока нет записей. Нажмите «+ Новая запись».</p>}
        {posts.map((p) => (
          <Link key={p.id} href={`/admin/posts/${p.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 hover:shadow-sm">
            <span className="text-[24px]">{p.emoji}</span>
            <span className="min-w-0 grow">
              <span className="block truncate font-semibold">{p.title}</span>
              <span className="text-[12px] text-muted">
                {RUBRICS[p.rubric as Rubric]?.label ?? p.rubric} · {new Date(p.published_at ?? p.created_at).toLocaleDateString("ru-RU")}
              </span>
            </span>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${p.status === "published" ? "bg-brand-soft text-brand-dark" : "bg-cream text-muted"}`}>
              {p.status === "published" ? "Опубликовано" : "Черновик"}
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-[13px] text-muted">Ещё {ARTICLES.length} статей в журнале добавлены разработчиком — их меняют через Claude.</p>
    </div>
  );
}
