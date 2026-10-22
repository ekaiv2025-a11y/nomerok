import "server-only";
import { randomBytes } from "crypto";
import { adminGetMaster, adminListMasters, dbMode, listPublishedMasters, readLocal, supabase, writeLocal } from "./db";
import { getPlace, updatePlace } from "./places-db";
import type { Place } from "./places";
import type { Master, PublicMaster } from "./types";
import { transliterate } from "./slug";

/*
 * Организации (клиники, салоны, учебные центры) и их команды.
 * Организация — это «место» с подтверждённым владельцем (owner_chat_id).
 * Анкету специалиста заполняет только он сам; организация лишь принимает его в команду или убирает.
 */
export type OrgMember = { place_id: string; master_id: string; status: "pending" | "active"; via: "invite" | "self"; created_at: string };
type L = { org_members?: OrgMember[]; places?: Place[] };

const MAX_ORGS_PER_MASTER = 3;

async function localMembers(): Promise<OrgMember[]> {
  if (dbMode() === "none") return [];
  return ((await readLocal()) as unknown as L).org_members ?? [];
}

export async function membersOf(placeId: string): Promise<OrgMember[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("org_members").select("*").eq("place_id", placeId).order("created_at");
    return r.error ? [] : (r.data as OrgMember[]);
  }
  return (await localMembers()).filter((m) => m.place_id === placeId);
}

export async function membershipsOf(masterId: string): Promise<OrgMember[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("org_members").select("*").eq("master_id", masterId).order("created_at");
    return r.error ? [] : (r.data as OrgMember[]);
  }
  return (await localMembers()).filter((m) => m.master_id === masterId);
}

/** Добавить в команду (или подтвердить). Возвращает false, если у специалиста уже максимум организаций. */
export async function addMember(placeId: string, masterId: string, status: OrgMember["status"], via: OrgMember["via"]): Promise<boolean> {
  const mine = await membershipsOf(masterId);
  if (!mine.some((m) => m.place_id === placeId) && mine.length >= MAX_ORGS_PER_MASTER) return false;
  const row: OrgMember = { place_id: placeId, master_id: masterId, status, via, created_at: new Date().toISOString() };
  const sb = supabase();
  if (sb) {
    const prev = mine.find((m) => m.place_id === placeId);
    if (prev) {
      // уже в команде — не понижаем active до pending
      if (prev.status === "active" || status === prev.status) return true;
      await sb.from("org_members").update({ status }).eq("place_id", placeId).eq("master_id", masterId);
    } else await sb.from("org_members").insert(row);
    return true;
  }
  const d = (await readLocal()) as unknown as L;
  const list = d.org_members ?? [];
  const i = list.findIndex((m) => m.place_id === placeId && m.master_id === masterId);
  if (i >= 0) {
    if (list[i].status !== "active") list[i].status = status;
  } else list.push(row);
  d.org_members = list;
  await writeLocal(d as never);
  return true;
}

export async function removeMember(placeId: string, masterId: string): Promise<void> {
  const sb = supabase();
  if (sb) {
    await sb.from("org_members").delete().eq("place_id", placeId).eq("master_id", masterId);
    return;
  }
  const d = (await readLocal()) as unknown as L;
  d.org_members = (d.org_members ?? []).filter((m) => !(m.place_id === placeId && m.master_id === masterId));
  await writeLocal(d as never);
}

/** Команда с анкетами: только опубликованные анкеты (для сайта) или все (для кабинета). */
export async function teamOf(placeId: string, opts: { all?: boolean } = {}): Promise<{ member: OrgMember; master: Master }[]> {
  const mem = await membersOf(placeId);
  if (!mem.length) return [];
  const ids = new Set(mem.map((m) => m.master_id));
  const masters = (await adminListMasters()).filter((m) => ids.has(m.id));
  return mem
    .map((member) => ({ member, master: masters.find((x) => x.id === member.master_id)! }))
    .filter((x) => x.master && (opts.all || (x.member.status === "active" && x.master.status === "published" && !x.master.archived_at)));
}

/** Команда для страницы организации — публичные анкеты. */
export async function publicTeamOf(placeId: string): Promise<PublicMaster[]> {
  const ids = new Set((await membersOf(placeId)).filter((m) => m.status === "active").map((m) => m.master_id));
  if (!ids.size) return [];
  return (await listPublishedMasters()).filter((m) => ids.has(m.id));
}

/** Где работает специалист (подтверждённые организации) — для его страницы. */
export async function orgsOfMaster(masterId: string, opts: { pending?: boolean } = {}): Promise<{ member: OrgMember; place: Place }[]> {
  const mem = (await membershipsOf(masterId)).filter((m) => opts.pending || m.status === "active");
  const out: { member: OrgMember; place: Place }[] = [];
  for (const m of mem) {
    const p = await getPlace(m.place_id).catch(() => null);
    if (p) out.push({ member: m, place: p });
  }
  return out;
}

/** Код приглашения в команду (создаётся при первом запросе). */
export async function inviteCode(p: Place, renew = false): Promise<string> {
  if (p.invite_code && !renew) return p.invite_code;
  const code = randomBytes(6).toString("base64url").replace(/[-_]/g, "x");
  await updatePlace(p.id, { invite_code: code });
  return code;
}

export async function placeByInvite(code: string): Promise<Place | null> {
  if (!/^[A-Za-z0-9]{6,16}$/.test(code)) return null;
  const sb = supabase();
  if (sb) {
    const r = await sb.from("places").select("*").eq("invite_code", code).maybeSingle();
    return r.error ? null : ((r.data as Place) ?? null);
  }
  if (dbMode() === "none") return null;
  return (((await readLocal()) as unknown as L).places ?? []).find((p) => p.invite_code === code) ?? null;
}

/** Новая организация, которой ещё нет в «Местах»: создаёт сам владелец. Скрыта, пока администратор не проверит. */
export async function createOwnerPlace(input: { name: string; cat: string; city: string; addr: string; phone: string; desc: string; site: string; chatId: number; ownerName: string }): Promise<Place> {
  const id = "ORG-" + randomBytes(5).toString("hex").toUpperCase();
  const base = transliterate(input.name).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "org";
  const now = new Date().toISOString();
  const place: Place = {
    id,
    slug: `${base}-${id.slice(4, 8).toLowerCase()}`,
    name: input.name,
    cat: input.cat,
    addr: input.addr || null,
    addr_ru: input.addr || null,
    phones: input.phone ? [input.phone] : [],
    site: input.site || null,
    desc_ru: input.desc || null,
    city: input.city,
    area: input.city,
    status: "hidden",
    src: "owner",
    edited: true,
    owner_chat_id: input.chatId,
    owner_name: input.ownerName.slice(0, 80),
    owner_verified_at: now,
    created_at: now,
    updated_at: now,
  };
  const sb = supabase();
  if (sb) {
    const r = await sb.from("places").insert(place);
    if (r.error) throw new Error(r.error.message);
    return place;
  }
  const d = (await readLocal()) as unknown as L;
  d.places = [...(d.places ?? []), place];
  await writeLocal(d as never);
  return place;
}

/** Получатели заявки организации: команда (если включено) — анкеты, которые могут получать заявки. */
export async function orgRequestTargets(p: Place): Promise<Master[]> {
  if (p.team_requests === false) return [];
  return (await teamOf(p.id)).map((x) => x.master).filter((m) => m.tg_chat_id);
}

export { adminGetMaster };

/** Поиск организаций с подтверждённым владельцем (для «Я работаю в…»). */
export async function searchOrgs(q: string): Promise<Place[]> {
  const s = q.trim().replace(/[%,()]/g, " ").slice(0, 60);
  if (s.length < 2) return [];
  const sb = supabase();
  if (sb) {
    const r = await sb.from("places").select("*").not("owner_verified_at", "is", null).or(`name.ilike.%${s}%,name_en.ilike.%${s}%,name_ka.ilike.%${s}%`).limit(10);
    return r.error ? [] : (r.data as Place[]);
  }
  if (dbMode() === "none") return [];
  const low = s.toLowerCase();
  return ((((await readLocal()) as unknown as L).places ?? []).filter((p) => p.owner_verified_at && [p.name, p.name_en, p.name_ka].some((x) => (x ?? "").toLowerCase().includes(low)))).slice(0, 10);
}
