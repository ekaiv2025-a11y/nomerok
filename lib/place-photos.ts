import "server-only";
import { shrinkPhoto, supabase } from "./db";

/*
 * Фото мест из пачек наполнения: скачиваем с официальной страницы заведения и кладём к себе в хранилище (папка places/).
 * Так фото не пропадут, когда у заведения сменится ссылка (у Instagram и Facebook ссылки на картинки временные).
 */
export const PHOTO_KINDS = ["снаружи", "интерьер", "терраса", "вид", "блюда", "меню"] as const;

/** «url|kind; url|kind» → список. Подпись необязательна. */
export function parsePhotoCell(cell: string): { url: string; kind: string }[] {
  return cell
    .split(/\s*;\s*|\n/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const [u, k] = x.split("|").map((y) => y.trim());
      const kind = (k ?? "").toLowerCase();
      return { url: u, kind: (PHOTO_KINDS as readonly string[]).includes(kind) ? kind : "" };
    })
    .filter((x) => /^https:\/\/\S+$/i.test(x.url));
}

/** Скачать картинку и сохранить у себя. null — не картинка, слишком большая или ссылка уже не работает. */
export async function rehostPhoto(placeId: string, url: string, n: number): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Mozilla/5.0 (compatible; NomerOkBot/1.0; +https://nomerok.ge)" } });
    if (!r.ok) return null;
    const type = (r.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!/^image\/(jpeg|png|webp)$/.test(type)) return null;
    const blob = await r.blob();
    if (blob.size < 15 * 1024 || blob.size > 12 * 1024 * 1024) return null; // крошечные — значки и логотипы
    const ext0 = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    const { file, ext } = await shrinkPhoto(new Blob([blob], { type }), ext0);
    const key = `places/${placeId}/${Date.now()}-${n}.${ext}`;
    const up = await sb.storage.from("photos").upload(key, file, { contentType: file.type, upsert: true });
    if (up.error) return null;
    return sb.storage.from("photos").getPublicUrl(key).data.publicUrl;
  } catch {
    return null;
  }
}

/**
 * Скачать к себе фото мест, которые пока по чужим ссылкам. Не дольше budgetMs.
 * Ссылка не открылась — убираем фото (лучше без фото, чем битая картинка).
 */
export async function rehostPlacePhotos(budgetMs = 90_000): Promise<{ saved: number; dropped: number; left: number }> {
  const sb = supabase();
  const out = { saved: 0, dropped: 0, left: 0 };
  if (!sb) return out;
  const until = Date.now() + budgetMs;
  const ours = (u: string) => u.includes("/storage/v1/object/public/photos/");
  type Row = { id: string; photos: string[] | null; photo_kinds: string[] | null };
  const todo: Row[] = [];
  for (let from = 0; from < 20000; from += 1000) {
    const r = await sb.from("places").select("id,photos,photo_kinds").not("photo_src", "is", null).order("id").range(from, from + 999);
    if (r.error) return out;
    for (const x of (r.data as Row[]) ?? []) if ((x.photos ?? []).some((u) => !ours(u))) todo.push(x);
    if ((r.data ?? []).length < 1000) break;
  }
  for (const p of todo) {
    if (Date.now() > until) {
      out.left++;
      continue;
    }
    const urls = p.photos ?? [];
    const kinds = urls.map((_, i) => p.photo_kinds?.[i] ?? "");
    const got = await Promise.all(urls.map((u, i) => (ours(u) ? Promise.resolve(u) : rehostPhoto(p.id, u, i))));
    const keep = got.map((u, i) => ({ u, k: kinds[i] })).filter((x): x is { u: string; k: string } => !!x.u);
    out.saved += got.filter((u, i) => u && !ours(urls[i])).length;
    out.dropped += got.filter((u) => !u).length;
    await sb.from("places").update({ photos: keep.map((x) => x.u), photo_kinds: keep.map((x) => x.k) }).eq("id", p.id);
  }
  return out;
}
