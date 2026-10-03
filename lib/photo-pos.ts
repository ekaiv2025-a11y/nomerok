/*
 * Положение фото в квадратной рамке («подвинуть фото»): хранится прямо в ссылке на фото, после #,
 * например …/photo.jpg#y=20 — 20% от верха. Новое фото — новая ссылка, положение сбрасывается.
 */
export const DEFAULT_Y = 30; // по умолчанию чуть выше центра: на портретах лицо обычно вверху

export function splitPhoto(url: string | null | undefined): { src: string | null; y: number } {
  if (!url) return { src: null, y: DEFAULT_Y };
  const [src, hash = ""] = url.split("#");
  const m = /(?:^|&)y=(\d{1,3})/.exec(hash);
  const y = m ? Math.min(100, Math.max(0, Number(m[1]))) : DEFAULT_Y;
  return { src, y };
}

export function withY(url: string, y: number): string {
  return `${url.split("#")[0]}#y=${Math.round(Math.min(100, Math.max(0, y)))}`;
}

/** Готовый style для <img>/<Image>. */
export function posStyle(url: string | null | undefined): { objectPosition: string } {
  return { objectPosition: `50% ${splitPhoto(url).y}%` };
}
