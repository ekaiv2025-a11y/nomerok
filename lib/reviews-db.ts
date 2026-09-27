import "server-only";
import { randomUUID } from "crypto";
import { check, dbMode, DbNotConfiguredError, readLocal, supabase, writeLocal } from "./db";
import type { ClientRequest, Complaint, ComplaintStatus, PublicReview, Review, ReviewStatus } from "./types";

/*
 * Отзывы, жалобы и выборка заявок для напоминаний.
 * Отзыв можно оставить только по ссылке из бота (человек подтверждён через Telegram),
 * один отзыв от одного Telegram-аккаунта на специалиста. Публикуем после проверки.
 */

const PUBLIC_REVIEW = "id,author_name,rating,text,photos,reply,reply_at,created_at";

function toPublicReview(r: Review): PublicReview {
  return {
    id: r.id,
    author_name: r.author_name,
    rating: r.rating,
    text: r.text,
    photos: r.photos ?? [],
    reply: r.reply ?? "",
    reply_at: r.reply_at,
    created_at: r.created_at,
  };
}

/* ---------- отзывы: публичная часть ---------- */

export async function reviewStats(): Promise<Map<string, { sum: number; n: number }>> {
  const sb = supabase();
  let rows: { master_id: string; rating: number }[];
  if (sb) rows = check(await sb.from("reviews").select("master_id,rating").eq("status", "published").limit(10000)) as typeof rows;
  else if (dbMode() === "none") throw new DbNotConfiguredError();
  else rows = (await readLocal()).reviews.filter((r) => r.status === "published");
  const map = new Map<string, { sum: number; n: number }>();
  for (const r of rows) {
    const cur = map.get(r.master_id) ?? { sum: 0, n: 0 };
    cur.sum += r.rating;
    cur.n += 1;
    map.set(r.master_id, cur);
  }
  return map;
}

export async function listPublishedReviews(masterId: string): Promise<PublicReview[]> {
  const sb = supabase();
  if (sb) {
    const rows = check(
      await sb.from("reviews").select(PUBLIC_REVIEW).eq("master_id", masterId).eq("status", "published").order("created_at", { ascending: false }),
    );
    return rows as unknown as PublicReview[];
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).reviews
    .filter((r) => r.master_id === masterId && r.status === "published")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(toPublicReview);
}

/* ---------- отзывы: создание и модерация ---------- */

export async function hasReviewFrom(masterId: string, chatId: number): Promise<boolean> {
  const sb = supabase();
  if (sb) {
    const { count } = await sb.from("reviews").select("id", { count: "exact", head: true }).eq("master_id", masterId).eq("author_chat_id", chatId);
    return (count ?? 0) > 0;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).reviews.some((r) => r.master_id === masterId && r.author_chat_id === chatId);
}

export async function createReview(input: Pick<Review, "master_id" | "request_id" | "author_name" | "author_chat_id" | "rating" | "text" | "photos">): Promise<Review> {
  const sb = supabase();
  if (sb) return check(await sb.from("reviews").insert({ ...input, status: "pending" }).select("*").single()) as Review;
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const r: Review = { ...input, id: randomUUID(), status: "pending", reply: "", reply_at: null, created_at: new Date().toISOString() };
  d.reviews.push(r);
  await writeLocal(d);
  return r;
}

export async function getReview(id: string): Promise<Review | null> {
  const sb = supabase();
  if (sb) return (check(await sb.from("reviews").select("*").eq("id", id).maybeSingle()) as Review) ?? null;
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).reviews.find((r) => r.id === id) ?? null;
}

export async function adminListReviews(): Promise<Review[]> {
  const sb = supabase();
  if (sb) return check(await sb.from("reviews").select("*").order("created_at", { ascending: false }).limit(500)) as Review[];
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return [...(await readLocal()).reviews].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Все отзывы специалиста для кабинета (опубликованные). */
export async function listMasterReviews(masterId: string): Promise<Review[]> {
  const sb = supabase();
  if (sb) {
    return check(
      await sb.from("reviews").select("*").eq("master_id", masterId).eq("status", "published").order("created_at", { ascending: false }),
    ) as Review[];
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).reviews.filter((r) => r.master_id === masterId && r.status === "published");
}

export async function updateReview(id: string, patch: Partial<Pick<Review, "status" | "reply" | "reply_at">>): Promise<void> {
  const sb = supabase();
  if (sb) {
    check(await sb.from("reviews").update(patch).eq("id", id));
    return;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const r = d.reviews.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
  await writeLocal(d);
}

export async function adminSetReviewStatus(id: string, status: ReviewStatus) {
  await updateReview(id, { status });
}

export async function adminDeleteReview(id: string) {
  const sb = supabase();
  if (sb) {
    check(await sb.from("reviews").delete().eq("id", id));
    return;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  d.reviews = d.reviews.filter((r) => r.id !== id);
  await writeLocal(d);
}

/* ---------- жалобы ---------- */

export async function createComplaint(input: Pick<Complaint, "master_id" | "master_name" | "reason" | "text" | "contact" | "photos">): Promise<Complaint> {
  const sb = supabase();
  if (sb) return check(await sb.from("complaints").insert({ ...input, status: "new" }).select("*").single()) as Complaint;
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const c: Complaint = { ...input, id: randomUUID(), status: "new", admin_note: "", created_at: new Date().toISOString() };
  d.complaints.push(c);
  await writeLocal(d);
  return c;
}

export async function adminListComplaints(): Promise<Complaint[]> {
  const sb = supabase();
  if (sb) return check(await sb.from("complaints").select("*").order("created_at", { ascending: false }).limit(500)) as Complaint[];
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return [...(await readLocal()).complaints].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function adminSetComplaintStatus(id: string, status: ComplaintStatus) {
  const sb = supabase();
  if (sb) {
    check(await sb.from("complaints").update({ status }).eq("id", id));
    return;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const d = await readLocal();
  const c = d.complaints.find((x) => x.id === id);
  if (c) c.status = status;
  await writeLocal(d);
}

/* ---------- картинки (фото к отзывам и жалобам) ---------- */

export async function uploadImage(folder: string, file: Blob, ext: string): Promise<string> {
  const sb = supabase();
  if (sb) {
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const up = await sb.storage.from("photos").upload(key, file, { contentType: file.type, upsert: false });
    if (up.error) throw new Error(up.error.message);
    return sb.storage.from("photos").getPublicUrl(key).data.publicUrl;
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  const buf = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buf.toString("base64")}`;
}

/* ---------- заявки для напоминаний ---------- */

/** Заявки за последние 30 дней, у которых клиент подключил Telegram. */
export async function listRequestsForFollowup(): Promise<ClientRequest[]> {
  const since = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
  const sb = supabase();
  if (sb) {
    return check(
      await sb.from("requests").select("*").gte("created_at", since).not("client_tg_chat_id", "is", null).order("created_at", { ascending: true }).limit(1000),
    ) as ClientRequest[];
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).requests.filter((r) => r.created_at >= since && r.client_tg_chat_id);
}

/** Личные заявки (конкретному специалисту) за последние 7 дней — проверить, ответил ли он. */
export async function listRequestsForDirectCheck(): Promise<ClientRequest[]> {
  const since = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
  const sb = supabase();
  if (sb) {
    return check(
      await sb.from("requests").select("*").gte("created_at", since).not("master_id", "is", null).is("direct_checked_at", null).eq("status", "sent").limit(500),
    ) as ClientRequest[];
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  return (await readLocal()).requests.filter((r) => r.created_at >= since && r.master_id && !r.direct_checked_at && r.status === "sent");
}
