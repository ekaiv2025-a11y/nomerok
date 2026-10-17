import { placeCat, placeTone, type Place } from "@/lib/places";

/** Миниатюра места: первое фото или цветная обложка раздела с иконкой. */
export function PlaceThumb({ p, size = 56, n }: { p: Pick<Place, "cat" | "photos" | "sub">; size?: number; n?: number }) {
  const photo = p.photos?.[0];
  if (photo)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt="" width={size} height={size} style={{ width: size, height: size }} className="shrink-0 rounded-xl bg-cream object-cover" loading="lazy" />
    );
  const [a, b] = placeTone(p.cat);
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${a}, ${b})` }}
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl"
    >
      <span style={{ fontSize: Math.round(size * 0.48) }} className="drop-shadow-sm">{placeCat(p.cat).emoji}</span>
      {n != null && (
        <b className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] leading-none text-white">{n}</b>
      )}
    </span>
  );
}
