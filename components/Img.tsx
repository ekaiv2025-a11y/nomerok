import Image from "next/image";

/**
 * Картинка, которую сайт сам уменьшает под размер экрана (вместо полного фото 1600px).
 * Экономит трафик и ускоряет загрузку на телефоне.
 */
const OPTIMIZABLE = /^https:\/\/([a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/)/;

export function Img({
  src,
  alt,
  sizes,
  className,
  priority,
  onError,
  draggable,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  onError?: () => void;
  draggable?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      onError={onError}
      draggable={draggable}
      unoptimized={!OPTIMIZABLE.test(src)}
    />
  );
}
