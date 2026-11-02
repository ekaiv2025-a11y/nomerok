import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAdmin } from "@/lib/admin-auth";
import { listProjectLeads, setProjectLeadStatus, type ProjectLead } from "@/lib/project-leads";
import { projectBySlug, PROJECTS } from "@/lib/projects";
import { cityLabel } from "@/lib/cities";
import { allProjectMedia, saveProjectMedia } from "@/lib/project-media";
import { AdminPostPhotos } from "@/components/AdminPostPhotos";

async function savePhotos(fd: FormData) {
  "use server";
  await requireAdmin();
  const slug = String(fd.get("slug"));
  if (!projectBySlug(slug)) return;
  let photos: string[] = [];
  try {
    photos = (JSON.parse(String(fd.get("photos") ?? "[]")) as unknown[]).filter((x): x is string => typeof x === "string" && /^https:\/\//.test(x)).slice(0, 20);
  } catch {}
  const credit = String(fd.get("credit") ?? "").trim().slice(0, 120) || null;
  await saveProjectMedia(slug, photos, credit);
  revalidatePath("/admin/projects");
  revalidatePath("/ru/novostroyki");
  revalidatePath(`/ru/novostroyki/${slug}`);
}

export const dynamic = "force-dynamic";

async function act(fd: FormData) {
  "use server";
  await requireAdmin();
  const s = String(fd.get("status"));
  if (["new", "sent", "closed"].includes(s)) await setProjectLeadStatus(String(fd.get("id")), s as ProjectLead["status"]);
  revalidatePath("/admin/projects");
}

const ST = { new: "🆕 Новая", sent: "📤 Передана", closed: "✅ Закрыта" } as const;

export default async function AdminProjects() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [leads, media] = await Promise.all([listProjectLeads().catch(() => [] as ProjectLead[]), allProjectMedia().catch(() => new Map())]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin" className="text-[14px] text-muted">← Админка</Link>
      <h1 className="mt-2 text-[26px] font-bold">🏗 Новостройки: заявки ({leads.length})</h1>
      <p className="mt-1 text-[14px] text-muted">
        Описано ЖК: {PROJECTS.length} · <Link href="/ru/novostroyki" className="underline">раздел на сайте</Link>. Новые заявки приходят и в Telegram. Передали агентству — отметьте «Передана».
      </p>
      <div className="mt-5 space-y-3">
        {leads.length === 0 && <p className="rounded-2xl bg-white p-5 text-muted">Заявок пока нет.</p>}
        {leads.map((l) => {
          const p = l.project ? projectBySlug(l.project) : null;
          return (
            <div key={l.id} className={`rounded-2xl bg-white p-4 text-[14px] ${l.status === "new" ? "ring-2 ring-brand/40" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <b className="text-[16px]">{p ? `ЖК ${p.name}` : "Подобрать вариант"}{p && l.mode === "other" ? " + другие варианты" : ""}</b>
                <span className="text-muted">{new Date(l.created_at).toLocaleString("ru-RU", { timeZone: "Asia/Tbilisi" })}</span>
              </div>
              <p className="mt-1">
                {l.name} · <b>{l.contact}</b>
              </p>
              <p className="mt-1 text-muted">{[l.city && cityLabel(l.city, "ru"), l.budget, l.rooms, l.goal].filter(Boolean).join(" · ")}</p>
              {l.comment && <p className="mt-1 whitespace-pre-line">{l.comment}</p>}
              <form action={act} className="mt-2 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={l.id} />
                {(Object.keys(ST) as ProjectLead["status"][]).map((s) => (
                  <button key={s} name="status" value={s} className={`rounded-full border px-3 py-1 text-[13px] ${l.status === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}>
                    {ST[s]}
                  </button>
                ))}
              </form>
            </div>
          );
        })}
      </div>
      <h2 className="mt-10 text-[22px] font-bold">📷 Фото жилых комплексов</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">
        Загружайте только свои снимки или фото, на которые есть разрешение застройщика или агентства (рендеры и фото с чужих сайтов — нельзя). Первое фото — обложка в списке. В поле «Чьё фото» напишите, например: «застройщик Alliance Group» или «NomerOk». Перетащите фото в рамку или нажмите «Добавить».
      </p>
      <div className="mt-4 space-y-2">
        {PROJECTS.map((p) => {
          const m = media.get(p.slug);
          return (
            <details key={p.slug} className="rounded-2xl bg-white p-4">
              <summary className="cursor-pointer text-[15px] font-semibold">
                ЖК {p.name} <span className="font-normal text-muted">· {p.city ? cityLabel(p.city, "ru") : p.place} · {m?.photos.length ? `📷 ${m.photos.length}` : "без фото"}</span>
              </summary>
              <form action={savePhotos} className="mt-3 space-y-3">
                <input type="hidden" name="slug" value={p.slug} />
                <AdminPostPhotos initial={m?.photos ?? []} cover={false} />
                <input name="credit" defaultValue={m?.credit ?? ""} placeholder="Чьё фото: «застройщик …» или «NomerOk»" className="field h-10 w-full rounded-xl px-3 text-[14px]" />
                <button className="btn-primary h-10 px-5 text-[14px]">Сохранить</button>
              </form>
            </details>
          );
        })}
      </div>
    </div>
  );
}
