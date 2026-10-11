"use client";

import { useState } from "react";

type Target = { name: string; text: string; href: string; via: string };

/** Админка: переслать заявку вручную специалисту без бота — копирует текст и открывает его чат. */
export function AdminForward({ targets }: { targets: Target[] }) {
  const [done, setDone] = useState("");
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2">
      {targets.map((t) => (
        <button
          key={t.name + t.href}
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(t.text);
            } catch {}
            setDone(t.name);
            window.open(t.href, "_blank", "noopener");
          }}
          className="rounded-full border border-line bg-white px-3 py-1 text-[12px] font-semibold hover:border-brand"
          title="Скопирует текст заявки и откроет чат — останется вставить (Ctrl+V) и отправить"
        >
          📋 Переслать: {t.name} ({t.via})
        </button>
      ))}
      {done && <span className="text-[12px] text-brand-dark">✓ Текст для {done} скопирован — вставьте его в открывшемся чате</span>}
    </div>
  );
}
