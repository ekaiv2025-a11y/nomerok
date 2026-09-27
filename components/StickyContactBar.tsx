"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";

/**
 * Нижняя панель на телефоне в профиле специалиста: «Контакты» и «Написать».
 * Видна всегда, кроме момента, когда на экране сам блок контактов (он внизу страницы).
 */
export function StickyContactBar({ contactsLabel, writeLabel, writeHref }: { contactsLabel: string; writeLabel: string; writeHref: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.getElementById("contact");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      data-sticky-bar={show ? "on" : "off"}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-xl gap-2">
        <button
          type="button"
          onClick={() => {
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "center" });
            window.dispatchEvent(new Event("nm:reveal"));
          }}
          className="btn-primary h-12 flex-1"
        >
          <Phone className="h-4 w-4" /> {contactsLabel}
        </button>
        <Link href={writeHref} className="btn-ghost h-12 flex-1">
          <Mail className="h-4 w-4" /> {writeLabel}
        </Link>
      </div>
    </div>
  );
}
