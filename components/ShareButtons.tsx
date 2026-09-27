"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  const cls = "inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-[13px] font-medium hover:bg-cream";
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={copy} className={cls}>
        {copied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Скопировано" : "Скопировать ссылку"}
      </button>
      <a className={cls} target="_blank" rel="noopener noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}>
        Telegram
      </a>
      <a className={cls} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}>
        WhatsApp
      </a>
    </div>
  );
}
