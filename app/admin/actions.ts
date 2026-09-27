"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminCookieValue, checkPassword, requireAdmin } from "@/lib/admin-auth";
import {
  adminGetMaster,
  adminDeleteMaster,
  adminGetMasterSlug,
  adminSetMasterStatus,
  adminSetRequestStatus,
  adminUpdateMaster,
  createMaster,
} from "@/lib/db";
import { CATEGORY_IDS, LANGUAGES, PRICE_UNITS } from "@/lib/categories";
import { normalizePhone, normalizeTelegram } from "@/lib/phone";
import { rateLimit } from "@/lib/rate-limit";
import { notifyMasterStatus, setupBot } from "@/lib/bot";
import { webhookSecret } from "@/lib/telegram";
import { headers } from "next/headers";
import { clientIp } from "@/lib/request-info";
import type { MasterStatus, RequestStatus } from "@/lib/types";

export async function login(formData: FormData) {
  if (!rateLimit("login:" + (await clientIp()), 10, 15 * 60 * 1000)) redirect("/admin/login?error=wait");
  const pwd = String(formData.get("password") ?? "");
  if (!checkPassword(pwd)) redirect("/admin/login?error=1");
  (await cookies()).set(ADMIN_COOKIE, adminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

const MASTER_STATUSES: MasterStatus[] = ["pending", "published", "hidden", "rejected"];
const REQUEST_STATUSES: RequestStatus[] = ["new", "in_work", "done", "spam"];

function refreshPublic(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/master/${slug}`);
}

export async function setMasterStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as MasterStatus;
  if (!MASTER_STATUSES.includes(status)) return;
  const before = await adminGetMaster(id);
  await adminSetMasterStatus(id, status);
  // Сообщаем специалисту в Telegram об изменении статуса
  if (before && before.status !== status) await notifyMasterStatus({ ...before, status }, status).catch((e) => console.error("[notify]", e));
  refreshPublic(await adminGetMasterSlug(id));
  revalidatePath("/admin");
  const back = String(formData.get("back") || "");
  if (back.startsWith("/admin")) redirect(back);
}

export async function deleteMaster(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const slug = await adminGetMasterSlug(id);
  await adminDeleteMaster(id);
  refreshPublic(slug);
  redirect("/admin?tab=masters");
}

export async function setRequestStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as RequestStatus;
  if (!REQUEST_STATUSES.includes(status)) return;
  await adminSetRequestStatus(id, status);
  revalidatePath("/admin");
}

function parseMasterForm(formData: FormData) {
  const s = (k: string) => String(formData.get(k) ?? "").trim();
  const n = (k: string) => {
    const v = s(k);
    if (!v) return null;
    const x = Number(v);
    return Number.isFinite(x) && x >= 0 ? Math.round(x) : null;
  };
  const phone = normalizePhone(s("phone"));
  const category = s("category");
  const unit = s("price_unit");
  const errors: string[] = [];
  if (s("name").length < 2) errors.push("имя");
  if (!phone) errors.push("телефон");
  if (!(CATEGORY_IDS as readonly string[]).includes(category)) errors.push("направление");
  const tgRaw = s("telegram");
  const telegram = normalizeTelegram(tgRaw);
  if (tgRaw && !telegram) errors.push("ник Telegram");
  const photo = s("photo_url");
  if (photo && !/^https:\/\//.test(photo)) errors.push("ссылка на фото (должна начинаться с https://)");

  return {
    errors,
    data: {
      name: s("name"),
      category,
      services: s("services"),
      about: s("about"),
      credentials: s("credentials"),
      experience_years: n("experience_years"),
      price_from: n("price_from"),
      price_unit: (PRICE_UNITS as readonly string[]).includes(unit) ? unit : "час",
      languages: formData.getAll("languages").map(String).filter((l) => (LANGUAGES as readonly string[]).includes(l)),
      phone: phone ?? "",
      telegram,
      whatsapp: formData.get("whatsapp") === "on",
      photo_url: photo || null,
      admin_note: s("admin_note"),
    },
  };
}

export async function saveMaster(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { errors, data } = parseMasterForm(formData);
  const base = id ? `/admin/masters/${id}` : "/admin/masters/new";
  if (errors.length) redirect(`${base}?error=${encodeURIComponent("Проверьте: " + errors.join(", "))}`);

  if (id) {
    await adminUpdateMaster(id, data);
    refreshPublic(await adminGetMasterSlug(id));
    redirect(`${base}?saved=1`);
  } else {
    const status = String(formData.get("status")) === "published" ? "published" : "pending";
    const m = await createMaster({ ...data, status, consent_at: formData.get("consent") === "on" ? new Date().toISOString() : null });
    refreshPublic(m.slug);
    redirect(`/admin/masters/${m.id}?saved=1`);
  }
}

/** Подключает Telegram-бота к сайту (вебхук + команды). */
export async function connectBot() {
  await requireAdmin();
  const secret = webhookSecret();
  if (!secret) redirect("/admin?tab=bot&bot=notoken");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || "https";
  const res = await setupBot(`${proto}://${host}`, secret);
  redirect(`/admin?tab=bot&bot=${res.ok ? "ok" : "fail"}`);
}
