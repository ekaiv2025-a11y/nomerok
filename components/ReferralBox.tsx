"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { REF_TEXT } from "@/lib/referral-text";

/** Профиль: «🎁 Бонус за рекомендацию» — условия и кнопка «Порекомендовать другу» (личный код + ссылка). */
export function ReferralBox({ lang, slug, master, friend, reward, left, defaultName }: { lang: Locale; slug: string; master: string; friend: string; reward: string; left: number | null; defaultName?: string }) {
  const t = REF_TEXT[lang];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<{ code: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (defaultName) return;
    try {
      const n = localStorage.getItem("nm_ref_name");
      if (n) setName(n);
    } catch {}
  }, [defaultName]);

  async function get() {
    setErr("");
    setBusy(true);
    const r = await fetch("/api/referral", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, name, lang }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (j.ok) {
      setRes({ code: j.code, url: j.url });
      try {
        localStorage.setItem("nm_ref_name", name.trim());
      } catch {}
    } else setErr(j.error === "ended" ? t.ended : t.error);
  }

  const share = res ? t.shareText(master, friend, res.code) + "\n" + res.url : "";

  return (
    <section className="mt-8 rounded-2xl border border-[#f0d58a] bg-[#fffaf0] p-5">
      <h2 className="text-[18px] font-bold">{t.title}</h2>
      <ul className="mt-2 space-y-1 text-[15px]">
        <li>
          <span className="text-muted">{t.friendGets}</span> <b>{friend}</b>
        </li>
        {reward && (
          <li>
            <span className="text-muted">{t.youGet}</span> <b>{reward}</b>
          </li>
        )}
      </ul>
      {left !== null && <p className="mt-1 text-[13px] text-muted">{t.left(left)}</p>}

      {!open && !res && (
        <button type="button" onClick={() => setOpen(true)} className="btn-primary mt-4 h-11 px-5">
          🎁 {t.recommend}
        </button>
      )}

      {open && !res && (
        <div className="mt-4 space-y-2">
          <label className="block text-[14px] font-semibold">{t.yourName}</label>
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder={t.namePh} className="field" />
          <button type="button" disabled={busy || name.trim().length < 2} onClick={get} className="btn-primary h-11 px-5">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} {t.getCode}
          </button>
          {err && <p className="text-[13px] text-danger">{err}</p>}
        </div>
      )}

      {res && (
        <div className="mt-4 space-y-3">
          <p className="text-[14px]">
            {t.codeIs} <b className="rounded-lg bg-white px-2 py-0.5 font-mono text-[16px] tracking-wider">{res.code}</b>
          </p>
          <p className="text-[14px] text-muted">{t.send}</p>
          <div className="break-all rounded-xl border border-line bg-white p-3 text-[13px]">{res.url}</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(share);
                  setCopied(true);
                } catch {}
              }}
              className="btn-ghost h-10 px-4 text-[14px]"
            >
              {copied ? t.copied : t.copy}
            </button>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(res.url)}&text=${encodeURIComponent(t.shareText(master, friend, res.code))}`} target="_blank" rel="noopener noreferrer" className="btn-ghost h-10 px-4 text-[14px]">
              {t.shareTg}
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost h-10 px-4 text-[14px]">
              {t.shareWa}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

/** Друг пришёл по ссылке ?ref=КОД — показываем, кто рекомендует и какой код назвать. Код запоминаем для формы сообщения. */
export function RefBanner({ lang, slug }: { lang: Locale; slug: string }) {
  const t = REF_TEXT[lang];
  const [info, setInfo] = useState<{ code: string; name: string; friend: string } | null>(null);
  useEffect(() => {
    let code = "";
    try {
      code = new URL(window.location.href).searchParams.get("ref") ?? "";
      if (!code) {
        const saved = JSON.parse(localStorage.getItem(`nm_ref:${slug}`) ?? "null");
        if (saved?.code) code = saved.code;
      }
    } catch {}
    if (!code) return;
    fetch(`/api/referral?code=${encodeURIComponent(code)}&slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) return;
        setInfo({ code: j.code, name: j.name, friend: j.friend });
        try {
          localStorage.setItem(`nm_ref:${slug}`, JSON.stringify({ code: j.code, name: j.name }));
        } catch {}
      })
      .catch(() => {});
  }, [slug]);
  if (!info) return null;
  return (
    <div className="mb-5 rounded-2xl border border-[#f0d58a] bg-[#fff8e6] p-4">
      <p className="text-[16px] font-bold">{t.bannerTitle(info.name)}</p>
      <p className="mt-1 text-[14px]">
        {t.bannerText(info.code, info.friend)}
      </p>
    </div>
  );
}

/** Для формы сообщения: код рекомендации, если человек пришёл по ссылке друга. */
export function useSavedRef(slug: string): { code: string; name: string } | null {
  const [v, setV] = useState<{ code: string; name: string } | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`nm_ref:${slug}`) ?? "null");
      if (saved?.code) setV(saved);
    } catch {}
  }, [slug]);
  return v;
}
