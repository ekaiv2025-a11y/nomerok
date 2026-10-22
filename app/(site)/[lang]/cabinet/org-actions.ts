"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentSpecialistId } from "@/lib/spec-auth";
import { addMember, removeMember } from "@/lib/org-db";
import { getPlace } from "@/lib/places-db";
import { adminGetMaster } from "@/lib/db";
import { askOrgApproval } from "@/lib/bot";
import { escapeHtml as esc, sendTo } from "@/lib/telegram";

/** Специалист: «я работаю в этой организации» → владелец подтверждает в Telegram. */
export async function requestOrg(fd: FormData) {
  const lang = String(fd.get("lang") ?? "ru").slice(0, 2);
  const id = await currentSpecialistId();
  if (!id) redirect(`/${lang}/cabinet`);
  const m = await adminGetMaster(id);
  const p = await getPlace(String(fd.get("place") ?? "").slice(0, 40));
  if (!m || !p || !p.owner_verified_at) redirect(`/${lang}/cabinet?tab=profile&orgmsg=nf#orgs`);
  const ok = await addMember(p.id, m.id, "pending", "self");
  if (!ok) redirect(`/${lang}/cabinet?tab=profile&orgmsg=max#orgs`);
  await askOrgApproval(p.id, m);
  redirect(`/${lang}/cabinet?tab=profile&orgmsg=sent#orgs`);
}

export async function leaveOrg(fd: FormData) {
  const lang = String(fd.get("lang") ?? "ru").slice(0, 2);
  const id = await currentSpecialistId();
  if (!id) redirect(`/${lang}/cabinet`);
  const p = await getPlace(String(fd.get("place") ?? "").slice(0, 40));
  if (!p) return;
  await removeMember(p.id, id);
  const m = await adminGetMaster(id);
  if (p.owner_chat_id && m) await sendTo(p.owner_chat_id, `ℹ️ ${esc(m.name)} вышел(ла) из команды «${esc(p.name)}».`).catch(() => null);
  revalidatePath("/[lang]/cabinet", "page");
}
