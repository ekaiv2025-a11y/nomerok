"use client";
import Image from "next/image";
import { useState } from "react";
import { splitPhoto } from "@/lib/photo-pos";
function hue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}
function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function Avatar({ name, photo, size = 56, className = "", alt }: { name: string; photo?: string | null; size?: number; className?: string; alt?: string }) {
  const style = { width: size, height: size };
  const [broken, setBroken] = useState(false);
  const p = splitPhoto(photo);
  if (p.src && !broken) {
    return (
      <Image
        src={p.src}
        alt={alt ?? name}
        width={size}
        height={size}
        style={{ ...style, objectPosition: `50% ${p.y}%` }}
        onError={() => setBroken(true)}
        unoptimized={!/^https:\/\/([a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/)/.test(p.src)}
        className={`shrink-0 rounded-2xl object-cover bg-cream ${className}`}
      />
    );
  }
  const h = hue(name);
  return (
    <div
      style={{ ...style, background: `hsl(${h} 45% 90%)`, color: `hsl(${h} 45% 28%)`, fontSize: Math.round(size * 0.36) }}
      className={`flex shrink-0 select-none items-center justify-center rounded-2xl font-bold ${className}`}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
