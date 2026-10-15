"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { deletePost, getPost, savePost, slugify } from "@/lib/posts-db";
import { uploadPhoto } from "@/lib/db";
import { RUBRICS } from "@/lib/articles";
import { CATEGORY_IDS } from "@/lib/categories";

export async function savePostAction(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "") || undefined;
  const title = String(fd.get("title") ?? "").trim().slice(0, 160);
  const back = `/admin/posts/${id ?? "new"}`;
  if (!title) redirect(`${back}?err=${encodeURIComponent("Напишите заголовок")}`);
  const prev = id ? await getPost(id) : null;
  const status = fd.get("publish") === "1" ? "published" : fd.get("unpublish") === "1" ? "draft" : (prev?.status ?? "draft");
  const rubric = String(fd.get("rubric") ?? "news");
  const cat = String(fd.get("cat") ?? "");
  const srcUrl = String(fd.get("source_url") ?? "").trim();

  let cover = prev?.cover_url ?? null;
  if (fd.get("cover_remove") === "on") cover = null;
  const file = fd.get("cover");
  if (file instanceof File && file.size > 0) {
    if (file.size > 3.8 * 1024 * 1024) redirect(`${back}?err=${encodeURIComponent("Фото больше 4 МБ — уменьшите его")}`);
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    cover = await uploadPhoto("journal", file, ext);
  }

  let photos: string[] = [];
  try {
    const raw = JSON.parse(String(fd.get("photos") ?? "[]"));
    if (Array.isArray(raw)) photos = raw.filter((u) => typeof u === "string" && /^(https:\/\/|data:image\/)/.test(u)).slice(0, 30);
  } catch {}

  let saved;
  try {
    saved = await savePost({
      id,
      slug: prev?.slug ?? slugify(String(fd.get("slug") ?? "") || title),
      title,
      lead: String(fd.get("lead") ?? "").trim().slice(0, 600),
      body: String(fd.get("body") ?? "").trim().slice(0, 30000),
      rubric: rubric in RUBRICS ? rubric : "news",
      emoji: String(fd.get("emoji") ?? "").trim().slice(0, 8) || "📰",
      cover_url: cover,
      photos,
      source_name: String(fd.get("source_name") ?? "").trim().slice(0, 80) || null,
      source_url: /^https?:\/\//i.test(srcUrl) ? srcUrl.slice(0, 500) : null,
      cats: (CATEGORY_IDS as readonly string[]).includes(cat) ? [cat] : [],
      status,
    });
  } catch (e) {
    redirect(`${back}?err=${encodeURIComponent(e instanceof Error ? e.message : "Не удалось сохранить")}`);
  }
  revalidatePath("/ru/guide");
  revalidatePath(`/ru/guide/${saved.slug}`);
  redirect(`/admin/posts/${saved.id}?ok=${status === "published" ? "pub" : "draft"}`);
}

export async function deletePostAction(fd: FormData) {
  await requireAdmin();
  await deletePost(String(fd.get("id")));
  revalidatePath("/ru/guide");
  redirect("/admin/posts?deleted=1");
}
