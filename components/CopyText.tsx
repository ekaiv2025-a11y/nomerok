"use client";

import { useState } from "react";

/** Текст/ссылка с кнопкой «Скопировать» и «Поделиться». */
export function CopyText({ text, share, label = "Скопировать", done = "✓ Скопировано" }: { text: string; share?: string; label?: string; done?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-xl bg-cream px-3 py-2 text-[13px]">{text}</code>
      <button
        type="button"
        className="btn-ghost h-9 px-3 text-[13px]"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(share ?? text);
            setOk(true);
            setTimeout(() => setOk(false), 2000);
          } catch {}
        }}
      >
        {ok ? done : label}
      </button>
      {share && (
        <button
          type="button"
          className="btn-primary h-9 px-3 text-[13px]"
          onClick={async () => {
            try {
              if (navigator.share) await navigator.share({ text: share });
              else {
                await navigator.clipboard.writeText(share);
                setOk(true);
              }
            } catch {}
          }}
        >
          Поделиться
        </button>
      )}
    </div>
  );
}
