"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { getPlace, importPlaces, updatePlace } from "@/lib/places-db";
import { PLACE_CATS, type Place } from "@/lib/places";
import { normalizePhone } from "@/lib/phone";

export async function importPlacesAction() {
  await requireAdmin();
  let msg: string;
  try {
    const data = (await import("@/data/places-batumi.json")).default as unknown as Parameters<typeof importPlaces>[0];
    const r = await importPlaces(data);
    msg = `✓ Импорт: добавлено ${r.added}, обновлено ${r.updated}, не тронуто (правили вручную) ${r.skipped}`;
  } catch (e) {
    msg = `⚠️ ${e instanceof Error ? e.message : "Ошибка импорта"}`;
  }
  revalidatePath("/admin/places");
  redirect(`/admin/places?msg=${encodeURIComponent(msg)}`);
}

const list = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/[\n,;]+/)
    .map((x) => x.trim())
    .filter(Boolean);
const txt = (v: FormDataEntryValue | null, max = 400) => String(v ?? "").trim().slice(0, max) || null;
const url = (v: FormDataEntryValue | null) => {
  const s = txt(v, 300);
  return s && /^https?:\/\//i.test(s) ? s : s ? `https://${s}` : null;
};

export async function savePlaceAction(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const prev = await getPlace(id);
  if (!prev) redirect("/admin/places");
  const cat = String(fd.get("cat") ?? prev.cat);
  const lat = Number(fd.get("lat"));
  const lng = Number(fd.get("lng"));
  const patch: Partial<Place> = {
    name: txt(fd.get("name"), 160) ?? prev.name,
    name_en: txt(fd.get("name_en"), 160),
    name_ka: txt(fd.get("name_ka"), 160),
    cat: PLACE_CATS.some((c) => c.id === cat) ? cat : prev.cat,
    sub: txt(fd.get("sub"), 80),
    addr: txt(fd.get("addr"), 200),
    addr_ru: txt(fd.get("addr_ru"), 200),
    tags: list(fd.get("tags")).map((t) => t.toLowerCase()).slice(0, 20),
    lat: fd.get("lat") && Number.isFinite(lat) ? lat : null,
    lng: fd.get("lng") && Number.isFinite(lng) ? lng : null,
    phones: list(fd.get("phones")).map((p) => normalizePhone(p) ?? p).slice(0, 5),
    site: url(fd.get("site")),
    ig: url(fd.get("ig")),
    socials: list(fd.get("socials")).filter((u) => /^https?:\/\//.test(u)).slice(0, 6),
    email: txt(fd.get("email"), 120),
    hours: txt(fd.get("hours"), 200),
    desc_ru: txt(fd.get("desc_ru"), 2000),
    desc_en: txt(fd.get("desc_en"), 2000),
    status: fd.get("status") === "hidden" ? "hidden" : "published",
    checked: new Date().toISOString().slice(0, 10),
    edited: true,
  };
  if (fd.get("owner_ok") === "1") patch.owner_verified_at = new Date().toISOString();
  if (fd.get("owner_reset") === "1") Object.assign(patch, { owner_verified_at: null, owner_chat_id: null, owner_name: null });
  try {
    await updatePlace(id, patch);
  } catch (e) {
    redirect(`/admin/places/${id}?err=${encodeURIComponent(e instanceof Error ? e.message : "Ошибка")}`);
  }
  revalidatePath(`/ru/places/${prev.slug}`);
  redirect(`/admin/places/${id}?ok=1`);
}

export async function togglePlaceAction(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  await updatePlace(id, { status: fd.get("status") === "hidden" ? "hidden" : "published", edited: true });
  redirect(String(fd.get("back") || "/admin/places"));
}

export async function enrichPlacesAction(fd: FormData) {
  await requireAdmin();
  const file = fd.get("file");
  let msg: string;
  if (!(file instanceof File) || !file.size) msg = "⚠️ Выберите CSV-файл с результатом";
  else {
    try {
      const { applyEnrichment } = await import("@/lib/places-enrich");
      const r = await applyEnrichment(await file.text());
      msg = `✓ Обновлено мест: ${r.updated}${r.closed ? `, закрытых скрыто: ${r.closed}` : ""}${r.unknownIds.length ? `, не нашли id: ${r.unknownIds.slice(0, 5).join(", ")}${r.unknownIds.length > 5 ? "…" : ""}` : ""}${r.badRows ? `, строк без id: ${r.badRows}` : ""}`;
    } catch (e) {
      msg = `⚠️ ${e instanceof Error ? e.message : "Ошибка"}`;
    }
  }
  revalidatePath("/admin/places");
  redirect(`/admin/places?msg=${encodeURIComponent(msg)}`);
}
