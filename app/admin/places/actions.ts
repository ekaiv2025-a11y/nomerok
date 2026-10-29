"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { getPlace, importOsmCity, importPlaces, updatePlace } from "@/lib/places-db";
import { OSM_GROUPS, type OsmGroup } from "@/lib/osm-import";
import { cityLabel, isCity } from "@/lib/cities";
import { PLACE_CATS, type Place } from "@/lib/places";
import { normalizePhone } from "@/lib/phone";

export async function importPlacesAction() {
  await requireAdmin();
  let msg: string;
  try {
    const data = (await import("@/data/places-batumi.json")).default as unknown as Parameters<typeof importPlaces>[0];
    const r = await importPlaces(data);
    msg = `✓ Импорт: добавлено ${r.added}, обновлено ${r.updated}, без изменений ${r.skipped}`;
  } catch (e) {
    msg = `⚠️ ${e instanceof Error ? e.message : "Ошибка импорта"}`;
  }
  revalidatePath("/admin/places");
  redirect(`/admin/places?msg=${encodeURIComponent(msg)}`);
}

/** Полезные контакты города из OpenStreetMap: медицина, госуслуги и нотариусы, образование. */
export async function importOsmAction(fd: FormData) {
  await requireAdmin();
  const city = String(fd.get("city") ?? "");
  const groups = fd.getAll("g").map(String).filter((g): g is OsmGroup => g in OSM_GROUPS);
  let msg: string;
  if (!isCity(city) || !groups.length) msg = "⚠️ Выберите город и хотя бы одну группу";
  else {
    try {
      const r = await importOsmCity(city, groups);
      msg = `✓ ${cityLabel(city, "ru")}: найдено в OpenStreetMap ${r.found} · новых ${r.added} · дополнено ${r.updated} (из них совпали с уже имеющимися ${r.merged}) · без изменений ${r.skipped}`;
    } catch (e) {
      msg = `⚠️ ${e instanceof Error ? e.message : "Ошибка загрузки"}`;
    }
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
  try {
    const ph = JSON.parse(String(fd.get("photos") ?? "[]"));
    if (Array.isArray(ph)) patch.photos = ph.filter((u) => typeof u === "string" && /^(https:\/\/|data:image\/)/.test(u)).slice(0, 12);
  } catch {}
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

/** Тексты разделов «Мест» (JSON от ассистента). */
export async function catTextsAction(fd: FormData) {
  await requireAdmin();
  const file = fd.get("file");
  let msg: string;
  if (!(file instanceof File) || !file.size) msg = "⚠️ Выберите JSON-файл с текстами";
  else {
    try {
      const { importCatTexts } = await import("@/lib/place-cat-texts");
      const r = await importCatTexts(JSON.parse(await file.text()));
      msg = `✓ Текстов разделов сохранено: ${r.saved}${r.errors.length ? ` · пропущено ${r.errors.length}: ${r.errors.slice(0, 3).join("; ")}` : ""}`;
    } catch (e) {
      msg = `⚠️ ${e instanceof SyntaxError ? "Файл — не JSON. Попросите ассистента прислать именно JSON по формату из задания" : e instanceof Error ? e.message : "Ошибка"}`;
    }
  }
  revalidatePath("/admin/places");
  redirect(`/admin/places?msg=${encodeURIComponent(msg)}`);
}

export async function placeReviewStatusAction(fd: FormData) {
  await requireAdmin();
  const { setPlaceReviewStatus } = await import("@/lib/place-reviews-db");
  const status = fd.get("status") === "published" ? "published" : "rejected";
  const r = await setPlaceReviewStatus(String(fd.get("id")), status);
  if (r && status === "published") {
    const p = await getPlace(r.place_id);
    const { sendTo } = await import("@/lib/telegram");
    if (p) await sendTo(r.author_chat_id, `⭐ Ваш отзыв о «${p.name}» опубликован. Спасибо!`).catch(() => null);
    if (p) revalidatePath(`/ru/places/${p.slug}`);
  }
  redirect(`/admin/places?msg=${encodeURIComponent(status === "published" ? "✓ Отзыв опубликован" : "Отзыв отклонён")}`);
}

export async function geocodePlacesAction() {
  await requireAdmin();
  const { geocodeMissing } = await import("@/lib/places-db");
  let msg: string;
  try {
    const r = await geocodeMissing(40);
    msg = `📍 Координаты: найдено ${r.found}, не нашли ${r.failed}. Осталось без точки: ${r.left}${r.left ? " — нажмите ещё раз" : ""}`;
  } catch (e) {
    msg = `⚠️ ${e instanceof Error ? e.message : "Ошибка"}`;
  }
  redirect(`/admin/places?msg=${encodeURIComponent(msg)}`);
}
