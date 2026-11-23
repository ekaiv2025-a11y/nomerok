import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentDev, ownsDev } from "@/lib/dev-auth";
import { createDevProject, getDevProject, slugTaken, unitsOf, updateDevProject, devProjectsOfOwner, devProjectsOfMaster } from "@/lib/dev-projects-db";
import { devSlug, type DevPhoto, type DevProgress, type DevProject } from "@/lib/dev-projects";
import { notifyDevPending } from "@/lib/dev-moderation";
import { normalizePhone } from "@/lib/phone";
import { CITY_IDS } from "@/lib/cities";
import { IMAGE_KIND, projectBySlug, type ImageKind, type ProjectStatus } from "@/lib/projects";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "") || null;
const lines = (v: unknown, n: number, max: number) =>
  (Array.isArray(v) ? v : typeof v === "string" ? v.split("\n") : []).map((x) => String(x).trim().slice(0, max)).filter(Boolean).slice(0, n);
const coord = (v: unknown, min: number, max: number) => {
  const n = Number(v);
  return v != null && v !== "" && Number.isFinite(n) && n > min && n < max ? Math.round(n * 1e6) / 1e6 : null;
};
const okUrl = (u: unknown): u is string => typeof u === "string" && /^https:\/\/\S+$/.test(u) && u.length < 600;

/** Создать или изменить ЖК в кабинете застройщика; submit — отправить на проверку. */
export async function POST(req: Request) {
  const who = await currentDev();
  if (!who) return NextResponse.json({ ok: false, error: "Войдите, чтобы добавить ЖК" }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ ok: false }, { status: 400 });
  const name = str(b.name, 80);
  if (!name) return NextResponse.json({ ok: false, error: "Укажите название ЖК" }, { status: 422 });
  const city = (CITY_IDS as readonly string[]).includes(b.city) ? b.city : "batumi";
  const photos: DevPhoto[] = (Array.isArray(b.photos) ? b.photos : [])
    .filter((p: { url?: unknown }) => okUrl(p?.url))
    .slice(0, 40)
    .map((p: { url: string; kind?: string; caption?: string }) => ({ url: p.url, kind: (p.kind && p.kind in IMAGE_KIND ? p.kind : "exterior") as ImageKind, caption: str(p.caption, 120) ?? undefined }));
  const progress: DevProgress[] = (Array.isArray(b.progress) ? b.progress : [])
    .map((x: { date?: unknown; text?: unknown; photos?: unknown }) => ({ date: str(x?.date, 40) ?? "", text: str(x?.text, 600) ?? "", photos: (Array.isArray(x?.photos) ? x.photos : []).filter(okUrl).slice(0, 12) }))
    .filter((x: DevProgress) => x.date && (x.text || x.photos.length))
    .slice(0, 40);
  const linked = typeof b.linked_slug === "string" && projectBySlug(b.linked_slug) ? b.linked_slug : null;
  const data = {
    name,
    developer: str(b.developer, 80) ?? "",
    city,
    district: str(b.district, 80),
    address: str(b.address, 200),
    lat: coord(b.lat, 41, 43.7),
    lng: coord(b.lng, 39.9, 46.8),
    status: (["presale", "building", "done"].includes(b.status) ? b.status : "building") as ProjectStatus,
    completion: str(b.completion, 80),
    floors: str(b.floors, 20),
    description: str(b.description, 6000),
    amenities: lines(b.amenities, 30, 120),
    payment: lines(b.payment, 15, 200),
    photos,
    progress,
    contact_name: str(b.contact_name, 80),
    contact_phone: normalizePhone(String(b.contact_phone ?? "")),
  };
  if (!data.contact_phone) return NextResponse.json({ ok: false, error: "Укажите телефон отдела продаж" }, { status: 422 });

  let d: DevProject | null = null;
  if (b.id) {
    d = await getDevProject(String(b.id));
    if (!d || !ownsDev(who, d)) return NextResponse.json({ ok: false }, { status: 404 });
    await updateDevProject(d.id, { ...data, linked_slug: d.mod_status === "published" ? d.linked_slug : linked });
    d = { ...d, ...data };
  } else {
    // не больше 20 ЖК на одного автора — защита от мусора
    const mine = who.kind === "realtor" ? await devProjectsOfMaster(who.m.id) : await devProjectsOfOwner(who.chatId);
    if (mine.length >= 20) return NextResponse.json({ ok: false, error: "Слишком много ЖК — напишите нам" }, { status: 429 });
    let slug = linked ?? devSlug(name, city);
    for (let i = 2; !linked && (await slugTaken(slug)); i++) slug = `${devSlug(name, city)}-${i}`;
    if (!linked && projectBySlug(slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    d = await createDevProject({
      ...data,
      slug,
      linked_slug: linked,
      owner_chat_id: who.kind === "owner" ? who.chatId : null,
      master_id: who.kind === "realtor" ? who.m.id : null,
      mod_status: "draft",
    });
  }
  if (b.submit && d.mod_status !== "published" && d.mod_status !== "pending") {
    await updateDevProject(d.id, { mod_status: "pending" });
    await notifyDevPending({ ...d, mod_status: "pending" }, (await unitsOf(d.id).catch(() => [])).length).catch(() => null);
    d.mod_status = "pending";
  }
  if (d.mod_status === "published") revalidatePath(`/ru/novostroyki/${d.linked_slug ?? d.slug}`);
  revalidatePath("/ru/novostroyki");
  return NextResponse.json({ ok: true, id: d.id, mod_status: d.mod_status });
}
