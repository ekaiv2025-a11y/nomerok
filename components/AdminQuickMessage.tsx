"use client";

import { useState } from "react";

type Channel = { label: string; href: string };

/** Админка: готовое сообщение специалисту без бота — одна кнопка копирует текст и открывает чат (Instagram / Telegram). */
export function AdminQuickMessage({ text: initial, channels }: { text: string; channels: Channel[] }) {
  const [text, setText] = useState(initial);
  const [done, setDone] = useState("");
  async function go(c: Channel) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
    setDone(c.label);
    window.open(c.href, "_blank", "noopener");
  }
  return (
    <div className="mt-2 space-y-2">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className="field w-full py-2 text-[13px]" />
      <div className="flex flex-wrap gap-2">
        {channels.map((c) => (
          <button key={c.href} type="button" onClick={() => go(c)} className="btn-primary h-9 px-4 text-[13px]">
            📋 Скопировать и открыть {c.label}
          </button>
        ))}
      </div>
      {done && <p className="text-[13px] text-brand-dark">✓ Текст скопирован — в открывшемся чате вставьте его (Ctrl+V) и отправьте.</p>}
      <p className="text-[12px] text-muted">Instagram и Telegram не дают сайтам отправлять сообщения за вас, поэтому последний шаг — «Вставить» и «Отправить».</p>
    </div>
  );
}
