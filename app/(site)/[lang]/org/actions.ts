"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentOrgUser } from "@/lib/org-auth";
import { addMember, createOwnerPlace, inviteCode, removeMember } from "@/lib/org-db";
import { getPlace, updatePlace } from "@/lib/places-db";
import { PLACE_CATS } from "@/lib/places";
import { adminGetMaster } from "@/lib/db";
import { notifyAdmin, escapeHtml as esc, sendTo } from "@/lib/telegram";
import { normalizePhone } from "@/lib/phone";
import { CITY_IDS } from "@/lib/cities";
import { SITE_URL } from "@/lib/site";

const s = (fd: FormData, k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max);

async function ownPlace(fd: FormData) {
  const u = await currentOrgUser();
  if (!u) redirect("/ru/org");
  const p = await getPlace(s(fd, "place", 40));
  if (!p || p.owner_chat_id !== u.chatId || !p.owner_verified_at) throw new Error("Нет доступа к этой организации");
  return { u, p };
}

export async function saveOrgInfo(fd: FormData) {
  const { p } = await ownPlace(fd);
  const phones = s(fd, "phones", 200)
    .split(/[,;]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 4);
  const site = s(fd, "site", 200);
  const ig = s(fd, "ig", 120).replace(/^@/, "");
  await updatePlace(p.id, {
    desc_ru: s(fd, "desc", 1500) || null,
    hours: s(fd, "hours", 300) || null,
    addr_ru: s(fd, "addr", 200) || p.addr_ru || null,
    phones: phones.length ? phones : p.phones ?? [],
    site: site ? (/^https?:\/\//.test(site) ? site : `https://${site}`) : null,
    ig: ig ? (ig.startsWith("http") ? ig : `https://instagram.com/${ig}`) : null,
    team_requests: fd.get("team_requests") === "on",
    edited: true,
  });
  revalidatePath("/[lang]/org", "page");
}

export async function newInviteCode(fd: FormData) {
  const { p } = await ownPlace(fd);
  await inviteCode(p, true);
  revalidatePath("/[lang]/org", "page");
}

export async function teamAction(fd: FormData) {
  const { p } = await ownPlace(fd);
  const mid = s(fd, "master", 40);
  const act = s(fd, "act", 10);
  const m = await adminGetMaster(mid);
  if (!m) return;
  if (act === "approve") {
    await addMember(p.id, m.id, "active", "self");
    if (m.tg_chat_id) await sendTo(m.tg_chat_id, `✅ «${esc(p.name)}» подтвердили, что вы в команде.`).catch(() => null);
  } else if (act === "remove") {
    await removeMember(p.id, m.id);
    if (m.tg_chat_id) await sendTo(m.tg_chat_id, `ℹ️ Вас убрали из команды «${esc(p.name)}» на NomerOk. Ваша анкета остаётся на сайте как есть.`).catch(() => null);
  }
  revalidatePath("/[lang]/org", "page");
}

export async function createOrg(fd: FormData) {
  const u = await currentOrgUser();
  if (!u) redirect("/ru/org");
  const name = s(fd, "name", 120);
  const cat = s(fd, "cat", 30);
  const city = s(fd, "city", 20);
  const phone = normalizePhone(s(fd, "phone", 40)) ?? "";
  if (name.length < 2 || !PLACE_CATS.some((c) => c.id === cat) || !(CITY_IDS as readonly string[]).includes(city)) throw new Error("Заполните название, тип и город");
  const p = await createOwnerPlace({ name, cat, city, addr: s(fd, "addr", 200), phone, desc: s(fd, "desc", 1500), site: s(fd, "site", 200), chatId: u.chatId, ownerName: u.name });
  await notifyAdmin(`🏢 <b>Новая организация</b>: ${esc(name)} (${esc(cat)}, ${esc(city)})\nВладелец: ${esc(u.name || "—")}, тел. ${esc(phone || "—")}\nСейчас скрыта — проверьте и опубликуйте: ${SITE_URL}/admin/places/${p.id}`);
  redirect(`/${s(fd, "lang", 2) || "ru"}/org?p=${p.id}&created=1`);
}
