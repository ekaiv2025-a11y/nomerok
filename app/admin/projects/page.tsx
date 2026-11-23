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

async function devAct(fd: FormData) {
  "use server";
  await requireAdmin();
  const { getDevProject, updateDevProject, deleteDevProject } = await import("@/lib/dev-projects-db");
  const { tellDev } = await import("@/lib/dev-moderation");
  const d = await getDevProject(String(fd.get("id")));
  if (!d) return;
  const a = String(fd.get("act"));
  if (a === "publish") {
    await updateDevProject(d.id, { mod_status: "published" });
    if (d.mod_status === "pending") await tellDev(d, true).catch(() => null);
  } else if (a === "hide") await updateDevProject(d.id, { mod_status: "hidden" });
  else if (a === "reject") {
    await updateDevProject(d.id, { mod_status: "draft" });
    await tellDev(d, false).catch(() => null);
  } else if (a === "delete") await deleteDevProject(d.id);
  revalidatePath("/admin/projects");
  revalidatePath("/ru/novostroyki");
  revalidatePath(`/ru/novostroyki/${d.linked_slug ?? d.slug}`);
}

const ST = { new: "🆕 Новая", sent: "📤 Передана", closed: "✅ Закрыта" } as const;

export default async function AdminProjects() {
  if (!(await isAdmin())) redirect("/admin/login");
  const { adminDevProjects, unitsOf } = await import("@/lib/dev-projects-db");
  const [leads, media, devs] = await Promise.all([listProjectLeads().catch(() => [] as ProjectLead[]), allProjectMedia().catch(() => new Map()), adminDevProjects().catch(() => [])]);
  const devUnits = await Promise.all(devs.map((d) => unitsOf(d.id).then((u) => u.length).catch(() => 0)));
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin" className="text-[14px] text-muted">← Админка</Link>
      <h1 className="mt-2 text-[26px] font-bold">🏗 Новостройки: заявки ({leads.length})</h1>
      <section id="dev" className="mt-5 rounded-2xl border border-line bg-white p-4">
        <h2 className="text-[18px] font-bold">ЖК от застройщиков ({devs.length})</h2>
        <p className="text-[13px] text-muted">Добавлены в кабинете застройщика (/ru/realty/dev). Первая публикация — после вашей проверки: убедитесь по телефону, что это правда отдел продаж.</p>
        <div className="mt-3 space-y-2">
          {!devs.length && <p className="text-[14px] text-muted">Пока нет.</p>}
          {devs.map((d, i) => (
            <div key={d.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-line p-2 text-[14px]">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {d.name} <span className="font-normal text-muted">· {d.developer || "—"} · {cityLabel(d.city, "ru")}</span>
                </p>
                <p className="text-[12px] text-muted">
                  {d.mod_status} · квартир {devUnits[i]} · фото {d.photos.length} · {d.contact_name || "—"}, {d.contact_phone || "—"}
                  {d.linked_slug ? ` · дополняет ${d.linked_slug}` : " · новый ЖК"}
                </p>
              </div>
              {d.mod_status === "published" && (
                <a href={`/ru/novostroyki/${d.linked_slug ?? d.slug}`} target="_blank" className="text-[12px] text-brand underline">
                  на сайте
                </a>
              )}
              <form action={devAct} className="flex gap-1">
                <input type="hidden" name="id" value={d.id} />
                {d.mod_status !== "published" && <button name="act" value="publish" className="rounded-full bg-brand px-3 py-1 text-[12px] text-white">Опубликовать</button>}
                {d.mod_status === "pending" && <button name="act" value="reject" className="rounded-full border px-3 py-1 text-[12px]">Отклонить</button>}
                {d.mod_status === "published" && <button name="act" value="hide" className="rounded-full border px-3 py-1 text-[12px]">Скрыть</button>}
                <button name="act" value="delete" className="rounded-full border px-3 py-1 text-[12px] text-danger">Удалить</button>
              </form>
            </div>
          ))}
        </div>
      </section>
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
