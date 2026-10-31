import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdmin, requireAdmin } from "@/lib/admin-auth";
import { listProjectLeads, setProjectLeadStatus, type ProjectLead } from "@/lib/project-leads";
import { projectBySlug, PROJECTS } from "@/lib/projects";
import { cityLabel } from "@/lib/cities";

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
  const leads = await listProjectLeads().catch(() => [] as ProjectLead[]);
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
    </div>
  );
}
