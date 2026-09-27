import "server-only";
import { uploadImage } from "./reviews-db";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_SIZE = 5 * 1024 * 1024;

/** Достаёт до max картинок из формы. null — если что-то не так с файлами. */
export function pickImages(form: FormData, field = "photos", max = 3): Blob[] | null {
  const files = form.getAll(field).filter((f): f is File => f instanceof Blob && f.size > 0);
  if (files.length > max) return null;
  for (const f of files) if (!TYPES[f.type] || f.size > MAX_SIZE) return null;
  return files;
}

export async function uploadImages(folder: string, files: Blob[]): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) urls.push(await uploadImage(folder, f, TYPES[f.type] ?? "jpg"));
  return urls;
}
