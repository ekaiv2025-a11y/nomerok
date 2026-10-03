"use server";

import { cookies } from "next/headers";
import { cityOf } from "@/lib/cities";
import { normalizeLinks } from "@/lib/links";
import { readLinkFields } from "@/components/SocialLinks";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminCookieValue, checkPassword, requireAdmin } from "@/lib/admin-auth";
import {
  adminGetMaster,
  adminDeleteMaster,
  adminDeleteRequest,
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
  const back = String(formData.get("back") || "");
  redirect(back.startsWith("/admin") ? back : "/admin?tab=masters");
}

export async function setRequestStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as RequestStatus;
  if (!REQUEST_STATUSES.includes(status)) return;
  await adminSetRequestStatus(id, status);
  revalidatePath("/admin");
}

/** Подтвердить номер вручную (если бот не смог: номер в Telegram другой). Сначала позвоните специалисту. */
export async function verifyPhoneManually(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const on = String(formData.get("on")) === "1";
  await adminUpdateMaster(id, { phone_verified_at: on ? new Date().toISOString() : null });
  refreshPublic(await adminGetMasterSlug(id));
  redirect(`/admin/masters/${id}?saved=1`);
}

/** Написать специалисту от имени бота (ответ придёт вам как «Сообщение боту»). */
export async function messageMaster(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const text = String(formData.get("text") ?? "").trim().slice(0, 3500);
  const m = await adminGetMaster(id);
  if (!m || !text) redirect(`/admin/masters/${id}`);
  if (!m.tg_chat_id) redirect(`/admin/masters/${id}?error=${encodeURIComponent("У специалиста не подключён Telegram-бот — напишите ему по номеру или в Telegram")}`);
  const { sendTo, escapeHtml } = await import("@/lib/telegram");
  const ok = await sendTo(m.tg_chat_id, `💬 <b>Сообщение от NomerOk</b>\n\n${escapeHtml(text)}\n\n<i>Ответьте сюда — мы увидим.</i>`).catch(() => null);
  redirect(`/admin/masters/${id}?${ok ? "sent=1" : `error=${encodeURIComponent("Не удалось отправить: возможно, специалист остановил бота")}`}`);
}

/** Написать клиенту (автору заявки) через бота — если он подключил Telegram. */
export async function messageClient(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const text = String(formData.get("text") ?? "").trim().slice(0, 3500);
  const { adminListRequests } = await import("@/lib/db");
  const r = (await adminListRequests()).find((x) => x.id === id);
  if (!r || !text) redirect("/admin?tab=requests");
  if (!r.client_tg_chat_id) redirect(`/admin?tab=requests&msg=${encodeURIComponent("❌ Клиент не подключил Telegram-бот")}`);
  const { sendTo, escapeHtml } = await import("@/lib/telegram");
  const html = escapeHtml(text).replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>');
  const ok = await sendTo(r.client_tg_chat_id, `💬 <b>Сообщение от NomerOk</b>\n\n${html}\n\n<i>Ответьте сюда — мы увидим.</i>`).catch(() => null);
  redirect(`/admin?tab=requests&msg=${encodeURIComponent(ok ? `✓ Сообщение отправлено: ${r.name || "клиенту"}` : "❌ Не удалось отправить: возможно, человек остановил бота")}`);
}

export async function askMasterFixPhone(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const m = await adminGetMaster(id);
  if (!m) redirect("/admin");
  const { askFixPhone } = await import("@/lib/bot");
  const ok = await askFixPhone(m);
  redirect(`/admin/masters/${id}?${ok ? "sent=1" : `error=${encodeURIComponent("Не удалось отправить: бот у специалиста не подключён")}`}`);
}

export async function sendBroadcast(formData: FormData) {
  await requireAdmin();
  const text = String(formData.get("text") ?? "").trim().slice(0, 3800);
  if (!text) redirect("/admin/broadcast");
  const { escapeHtml } = await import("@/lib/telegram");
  const { broadcastToMasters } = await import("@/lib/bot");
  // **жирный** → <b>жирный</b>
  const html = escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  const r = await broadcastToMasters(html, { onlyPublished: formData.get("all") !== "on", cabinet: formData.get("cabinet") === "on", subscribe: formData.get("subscribe") === "on" });
  redirect(`/admin/broadcast?sent=${r.sent}&failed=${r.failed}`);
}

/** Разослать заявку специалистам вручную (если её задержала проверка на рекламу). */
export async function distributeNow(formData: FormData) {
  await requireAdmin();
  const { getRequest } = await import("@/lib/db");
  const { distributeRequest } = await import("@/lib/bot");
  const r = await getRequest(String(formData.get("id")));
  if (r) await distributeRequest(r).catch(() => 0);
  revalidatePath("/admin");
}

/** Сменить раздел заявки (клиент выбрал «Другое» или ошибся) и разослать специалистам нового раздела. */
export async function changeRequestCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const category = String(formData.get("category"));
  if (!(CATEGORY_IDS as readonly string[]).includes(category)) return;
  const { getRequest, updateRequest } = await import("@/lib/db");
  const { distributeRequest } = await import("@/lib/bot");
  await updateRequest(id, { category });
  const r = await getRequest(id);
  if (r && formData.get("send") === "on" && r.status !== "done") await distributeRequest(r).catch(() => 0);
  revalidatePath("/admin");
}

export async function deleteRequest(formData: FormData) {
  await requireAdmin();
  await adminDeleteRequest(String(formData.get("id")));
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
    city: cityOf(formData.get("city")),
    links: normalizeLinks(readLinkFields(formData)),
  };
}

export async function saveMaster(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { errors, data, city, links } = parseMasterForm(formData);
  const base = id ? `/admin/masters/${id}` : "/admin/masters/new";
  if (errors.length) redirect(`${base}?error=${encodeURIComponent("Проверьте: " + errors.join(", "))}`);

  if (id) {
    await adminUpdateMaster(id, { ...data, city, links });
    refreshPublic(await adminGetMasterSlug(id));
    redirect(`${base}?saved=1`);
  } else {
    const status = String(formData.get("status")) === "published" ? "published" : "pending";
    const m = await createMaster({ ...data, status, consent_at: formData.get("consent") === "on" ? new Date().toISOString() : null });
    await adminUpdateMaster(m.id, { city, links }).catch(() => {});
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

export async function addDemo() {
  await requireAdmin();
  const { adminAddDemoMasters } = await import("@/lib/db");
  const n = await adminAddDemoMasters();
  refreshPublic(null);
  redirect(`/admin?tab=masters&demo=added${n}`);
}

export async function removeDemo() {
  await requireAdmin();
  const { adminRemoveDemoMasters } = await import("@/lib/db");
  const n = await adminRemoveDemoMasters();
  refreshPublic(null);
  redirect(`/admin?tab=masters&demo=removed${n}`);
}

/* ---------- отзывы и жалобы ---------- */

export async function setReviewStatus(formData: FormData) {
  await requireAdmin();
  const { adminSetReviewStatus, getReview } = await import("@/lib/reviews-db");
  const { notifyReviewPublished } = await import("@/lib/bot");
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (status !== "published" && status !== "rejected" && status !== "pending") return;
  const before = await getReview(id);
  await adminSetReviewStatus(id, status);
  if (before && before.status !== "published" && status === "published") {
    await notifyReviewPublished({ ...before, status }).catch((e) => console.error("[review notify]", e));
  }
  refreshPublic(before ? await adminGetMasterSlug(before.master_id) : null);
  redirect("/admin?tab=reviews");
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const { adminDeleteReview, getReview } = await import("@/lib/reviews-db");
  const id = String(formData.get("id"));
  const before = await getReview(id);
  await adminDeleteReview(id);
  refreshPublic(before ? await adminGetMasterSlug(before.master_id) : null);
  redirect("/admin?tab=reviews");
}

export async function setComplaintStatus(formData: FormData) {
  await requireAdmin();
  const { adminSetComplaintStatus } = await import("@/lib/reviews-db");
  const status = String(formData.get("status"));
  if (!["new", "in_review", "resolved", "rejected"].includes(status)) return;
  await adminSetComplaintStatus(String(formData.get("id")), status as "new" | "in_review" | "resolved" | "rejected");
  redirect("/admin?tab=complaints");
}

export async function runFollowupsNow() {
  await requireAdmin();
  const { runFollowups } = await import("@/lib/bot");
  const r = await runFollowups().catch(() => null);
  redirect(
    `/admin?tab=bot&fu=${r ? [r.noResponse, r.asked, r.reviewInvites, r.pausesEnded, r.directMissed, r.inactiveWarned, r.archived].join("-") : "fail"}`,
  );
}

export async function adminUnarchive(formData: FormData) {
  await requireAdmin();
  const { unarchiveMaster } = await import("@/lib/bot");
  const m = await adminGetMaster(String(formData.get("id")));
  if (m) {
    await unarchiveMaster(m);
    refreshPublic(m.slug);
  }
  redirect("/admin?tab=masters");
}

/* ---------- документы специалистов ---------- */

export async function setDocumentStatus(formData: FormData) {
  await requireAdmin();
  const masterId = String(formData.get("masterId"));
  const docId = String(formData.get("docId"));
  const status = String(formData.get("status"));
  const back = String(formData.get("back") || "/admin?tab=docs");
  if (!["verified", "rejected", "pending"].includes(status)) return;
  const m = await adminGetMaster(masterId);
  if (!m) return;
  const doc = (m.documents ?? []).find((d) => d.id === docId);
  if (!doc) return;
  const docs = (m.documents ?? []).map((d) => (d.id === docId ? { ...d, status: status as "verified" | "rejected" | "pending" } : d));
  await adminUpdateMaster(m.id, { documents: docs });
  if (m.tg_chat_id && doc.status !== status && status === "rejected") {
    const { sendTo } = await import("@/lib/telegram");
    const { botDict } = await import("@/lib/i18n/bot");
    const b = botDict(m.lang);
    await sendTo(m.tg_chat_id, b.docRejected(doc.title)).catch(() => null);
  }
  refreshPublic(m.slug);
  redirect(back);
}

/** Переносит ссылки из текстов анкет в «Соцсети и сайт» (у одного специалиста или у всех). */
export async function applyLinks(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || undefined;
  const { applyLinkMoves } = await import("@/lib/link-migration");
  const n = await applyLinkMoves(id);
  revalidatePath("/", "layout");
  redirect(`/admin/links?done=${n}`);
}
