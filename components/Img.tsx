"use client";

import { useState } from "react";
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
  style,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  onError?: () => void;
  draggable?: boolean;
  style?: React.CSSProperties;
}) {
  // Если сжатие картинок на хостинге недоступно (лимит, сбой) — показываем оригинал, а не пустоту
  const [raw, setRaw] = useState(false);
  const canOptimize = OPTIMIZABLE.test(src) && !raw;
  return (
    <Image
      key={canOptimize ? "o" : "r"}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => (canOptimize ? setRaw(true) : onError?.())}
      draggable={draggable}
      style={style}
      unoptimized={!canOptimize}
    />
  );
}
