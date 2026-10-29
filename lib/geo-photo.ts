import "server-only";
import { commonsPhoto, type CommonsPhoto } from "./commons";

/** Фото с Wikimedia Commons, но страница ждёт не дольше deadline (иначе — без фото, поиск продолжится в фоне). */
export async function geoPhoto(q: string | undefined, deadline: number): Promise<CommonsPhoto | null> {
  if (!q) return null;
  const late = new Promise<null>((r) => setTimeout(() => r(null), Math.max(0, deadline - Date.now())));
  return ((await Promise.race([commonsPhoto(q), late])) ?? null) as CommonsPhoto | null;
}
