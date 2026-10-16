import "server-only";
import { randomUUID } from "crypto";
import { dbMode, readLocal, supabase, writeLocal } from "./db";

export type PlaceReview = {
  id: string;
  place_id: string;
  rating: number;
  text: string;
  author_name: string;
  author_chat_id: number;
  photos: string[];
  status: "pending" | "published" | "rejected";
  created_at: string;
};

type Local = { place_reviews?: PlaceReview[] };
async function local(): Promise<PlaceReview[]> {
  if (dbMode() === "none") return [];
  return ((await readLocal()) as unknown as Local).place_reviews ?? [];
}

export async function createPlaceReview(r: Omit<PlaceReview, "id" | "status" | "created_at">): Promise<PlaceReview> {
  const row: PlaceReview = { ...r, id: randomUUID(), status: "pending", created_at: new Date().toISOString() };
  const sb = supabase();
  if (sb) {
    const res = await sb.from("place_reviews").insert(row).select("*").single();
    if (res.error) throw new Error(res.error.message);
    return res.data as PlaceReview;
  }
  const d = await readLocal();
  (d as unknown as Local).place_reviews = [row, ...((d as unknown as Local).place_reviews ?? [])];
  await writeLocal(d);
  return row;
}

export async function hasPlaceReviewFrom(placeId: string, chatId: number): Promise<boolean> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("place_reviews").select("id").eq("place_id", placeId).eq("author_chat_id", chatId).limit(1);
    return !!r.data?.length;
  }
  return (await local()).some((x) => x.place_id === placeId && x.author_chat_id === chatId);
}

export async function publishedPlaceReviews(placeId: string): Promise<PlaceReview[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("place_reviews").select("*").eq("place_id", placeId).eq("status", "published").order("created_at", { ascending: false }).limit(50);
    return r.error ? [] : (r.data as PlaceReview[]);
  }
  return (await local()).filter((x) => x.place_id === placeId && x.status === "published");
}

export async function pendingPlaceReviews(): Promise<PlaceReview[]> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("place_reviews").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(100);
    return r.error ? [] : (r.data as PlaceReview[]);
  }
  return (await local()).filter((x) => x.status === "pending");
}

export async function setPlaceReviewStatus(id: string, status: PlaceReview["status"]): Promise<PlaceReview | null> {
  const sb = supabase();
  if (sb) {
    const r = await sb.from("place_reviews").update({ status }).eq("id", id).select("*").maybeSingle();
    return (r.data as PlaceReview) ?? null;
  }
  const d = await readLocal();
  const L = d as unknown as Local;
  let out: PlaceReview | null = null;
  L.place_reviews = (L.place_reviews ?? []).map((x) => (x.id === id ? (out = { ...x, status }) : x));
  await writeLocal(d);
  return out;
}
