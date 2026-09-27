import "server-only";
import { randomUUID } from "crypto";
import { dbMode, DbNotConfiguredError, supabase } from "./db";
import type { MasterDocument, PublicDocument } from "./types";

/*
 * Документы специалистов лежат в ЗАКРЫТОМ хранилище «docs».
 * Открыть файл можно только по временной ссылке (1 час), которую выдаёт сайт:
 * клиентам — для проверенных и открытых документов, администратору — для всех.
 */
const BUCKET = "docs";
export const MAX_DOCUMENTS = 10;
export const DOC_TYPES: Record<string, { ext: string; type: "image" | "pdf" }> = {
  "image/jpeg": { ext: "jpg", type: "image" },
  "image/png": { ext: "png", type: "image" },
  "image/webp": { ext: "webp", type: "image" },
  "application/pdf": { ext: "pdf", type: "pdf" },
};
export const MAX_DOC_SIZE = 10 * 1024 * 1024;

export async function uploadDocument(masterId: string, file: Blob): Promise<{ path: string; type: "image" | "pdf" }> {
  const info = DOC_TYPES[file.type];
  const sb = supabase();
  if (sb) {
    const path = `${masterId}/${randomUUID()}.${info.ext}`;
    const up = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) throw new Error(up.error.message);
    return { path, type: info.type };
  }
  if (dbMode() === "none") throw new DbNotConfiguredError();
  // Локальный режим: храним прямо в базе
  const buf = Buffer.from(await file.arrayBuffer());
  return { path: `data:${file.type};base64,${buf.toString("base64")}`, type: info.type };
}

export async function removeDocumentFile(path: string): Promise<void> {
  const sb = supabase();
  if (sb && !path.startsWith("data:")) await sb.storage.from(BUCKET).remove([path]);
}

/** Временные ссылки на файлы (1 час). */
export async function signedUrls(paths: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const remote = paths.filter((p) => !p.startsWith("data:"));
  for (const p of paths) if (p.startsWith("data:")) out[p] = p;
  const sb = supabase();
  if (sb && remote.length) {
    const { data } = await sb.storage.from(BUCKET).createSignedUrls(remote, 3600);
    for (const d of data ?? []) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  }
  return out;
}

/** Для страницы специалиста: только проверенные документы, которые он разрешил показывать. */
export async function publicDocuments(docs: MasterDocument[] | null | undefined): Promise<PublicDocument[]> {
  const list = (docs ?? []).filter((d) => d.status === "verified" && d.public);
  if (!list.length) return [];
  const urls = await signedUrls(list.map((d) => d.path)).catch(() => ({}) as Record<string, string>);
  return list.filter((d) => urls[d.path]).map((d) => ({ id: d.id, title: d.title, kind: d.kind, type: d.type, url: urls[d.path] }));
}
