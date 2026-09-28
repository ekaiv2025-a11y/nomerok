"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Avatar } from "./Avatar";

/** Аватар в профиле: нажали — фото открывается крупно на весь экран (закрыть — нажатием или Esc). */
export function AvatarZoom({ name, photo, size }: { name: string; photo: string | null; size: number }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!photo) return <Avatar name={name} photo={null} size={size} />;

  // У фото-примеров с Unsplash просим версию побольше
  const big = photo.includes("images.unsplash.com") ? photo.replace(/w=\d+&h=\d+/, "w=1000&h=1000") : photo;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="shrink-0 cursor-zoom-in rounded-2xl" aria-label={name}>
        <Avatar name={name} photo={photo} size={size} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(false)}>
          <button type="button" className="absolute right-3 top-3 rounded-full p-2 text-white hover:bg-white/10" aria-label="×" onClick={() => setOpen(false)}>
            <X className="h-6 w-6" />
          </button>
          <img src={big} alt={name} className="max-h-full max-w-full rounded-2xl object-contain" />
        </div>
      )}
    </>
  );
}
