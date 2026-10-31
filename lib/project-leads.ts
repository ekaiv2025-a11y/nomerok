import "server-only";
import { randomUUID } from "crypto";
import { dbMode, readLocal, supabase, writeLocal } from "./db";

/* Заявки по новостройкам: видит только владелец сайта (админка → «Новостройки: заявки»). */
export type ProjectLead = {
  id: string;
  created_at: string;
  project: string | null;
  mode: "this" | "other";
  name: string;
  contact: string;
  city: string | null;
  budget: string | null;
  rooms: string | null;
  goal: string | null;
  comment: string | null;
  status: "new" | "sent" | "closed";
  visitor: string | null;
};
type L = { project_leads?: ProjectLead[] };

export async function saveProjectLead(x: Omit<ProjectLead, "id" | "created_at" | "status">): Promise<ProjectLead> {
  const row: ProjectLead = { ...x, id: randomUUID(), created_at: new Date().toISOString(), status: "new" };
  const sb = supabase();
  if (sb) {
    const r = await sb.from("project_leads").insert(row);
    if (r.error) throw new Error(r.error.message);
    return row;
  }
  if (dbMode() === "none") throw new Error("База не настроена");
  const d = (await readLocal()) as unknown as L;
  (d.project_leads ??= []).unshift(row);
  await writeLocal(d as never);
  return row;
}

export async function listProjectLeads(limit = 300): Promise<ProjectLead[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("project_leads").select("*").order("created_at", { ascending: false }).limit(limit);
    if (r.error) throw new Error(r.error.message);
    return (r.data ?? []) as ProjectLead[];
  }
  if (dbMode() === "none") return [];
  return (((await readLocal()) as unknown as L).project_leads ?? []).slice(0, limit);
}

export async function setProjectLeadStatus(id: string, status: ProjectLead["status"]) {
  const sb = supabase();
  if (sb) {
    await sb.from("project_leads").update({ status }).eq("id", id);
    return;
  }
  const d = (await readLocal()) as unknown as L;
  const l = (d.project_leads ?? []).find((x) => x.id === id);
  if (l) l.status = status;
  await writeLocal(d as never);
}
