"use client";

import { useState } from "react";

/** Поделиться ссылкой: системное меню телефона или копирование. */
export function ShareButton({ title, label, done, className }: { title: string; label: string; done: string; className?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const url = window.location.href.split("#")[0];
        try {
          if (navigator.share) {
            await navigator.share({ title, url });
            return;
          }
        } catch {
          return;
        }
        try {
          await navigator.clipboard.writeText(url);
          setOk(true);
          setTimeout(() => setOk(false), 2000);
        } catch {}
      }}
    >
      {ok ? done : label}
    </button>
  );
}
