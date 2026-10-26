"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Plus, Trash2 } from "lucide-react";
import { getDict, type Locale } from "@/lib/i18n";
import { resizeImage } from "@/lib/image-resize";
import type { PortfolioItem } from "@/lib/types";

const ST = {
  ru: { newSec: "Раздел для новых фото:", none: "Без раздела", hint: "Разложите работы по разделам — на странице клиенты переключают их, как вкладки. Ссылки на полное портфолио (Google Диск, Behance, сайт) — в анкете, блок «Соцсети и сайт»." },
  en: { newSec: "Section for new photos:", none: "No section", hint: "Sort your work into sections — clients switch between them like tabs. Links to your full portfolio (Google Drive, Behance, website) go in the profile, “Social media & website”." },
  ka: { newSec: "განყოფილება ახალი ფოტოებისთვის:", none: "განყოფილების გარეშე", hint: "დაალაგეთ ნამუშევრები განყოფილებებად — კლიენტები მათ ჩანართებივით გადართავენ. სრული პორტფოლიოს ბმულები (Google Drive, Behance, საიტი) — ანკეტაში." },
} as const;

/** Кабинет: фото работ — добавить, подписать, разложить по разделам, поменять порядок, удалить. */
export function PortfolioEditor({ lang, initial, max: MAX = 12, sections = [] }: { lang: Locale; initial: PortfolioItem[]; max?: number; sections?: { id: string; label: string }[] }) {
  const st = ST[lang];
  const [newSec, setNewSec] = useState("");
  const t = getDict(lang).cabinet;
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItem[]>(initial);
  const [uploading, setUploading] = useState(0);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function call(method: "PATCH" | "DELETE", body: Record<string, unknown>) {
    const res = await fetch("/api/cabinet/portfolio", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, lang }) }).catch(() => null);
    const j = res ? await res.json().catch(() => ({})) : {};
    if (j.ok) {
      setItems(j.portfolio);
      router.refresh();
    } else setErr(j.error || getDict(lang).form.sendError);
  }

  async function add(files: FileList | null) {
    if (!files) return;
    setErr("");
    const list = Array.from(files).slice(0, MAX - items.length);
    if (files.length > list.length) setErr(t.portfolioFull);
    setUploading(list.length);
    for (const f of list) {
      const small = await resizeImage(f);
      const fd = new FormData();
      fd.set("photo", small);
      fd.set("lang", lang);
      if (newSec) fd.set("sec", newSec);
      const res = await fetch("/api/cabinet/portfolio", { method: "POST", body: fd }).catch(() => null);
      const j = res ? await res.json().catch(() => ({})) : {};
      if (j.ok) setItems(j.portfolio);
      else setErr(j.error || t.photoError);
      setUploading((n) => n - 1);
    }
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-line p-5">
      <h2 className="text-[18px] font-bold">
        {t.portfolioTitle} <span className="font-normal text-muted">{items.length}/{MAX}</span>
      </h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{MAX > 12 ? t.portfolioHint.replace("12", String(MAX)) : t.portfolioHint}</p>
      {sections.length > 0 && (
        <>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{st.hint}</p>
          <label className="mt-3 flex flex-wrap items-center gap-2 text-[14px] font-semibold">
            {st.newSec}
            <select value={newSec} onChange={(e) => setNewSec(e.target.value)} className="h-10 rounded-xl border border-line bg-white px-3 text-[14px] font-normal">
              <option value="">{st.none}</option>
              {sections.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((it, i) => (
          <div key={it.url} className="overflow-hidden rounded-xl border border-line bg-white">
            <a href={it.url} target="_blank" rel="noopener noreferrer">
              <img src={it.url} alt={it.caption} className="aspect-square w-full bg-cream object-cover" />
            </a>
            <div className="p-2">
              <input
                defaultValue={it.caption}
                maxLength={120}
                placeholder={t.portfolioCaption}
                onBlur={(e) => e.target.value.trim() !== it.caption && call("PATCH", { index: i, caption: e.target.value })}
                className="w-full rounded-lg border border-line px-2 py-1.5 text-[16px] outline-none focus:border-brand sm:text-[13px]"
              />
              {sections.length > 0 && (
                <select
                  value={it.sec ?? ""}
                  onChange={(e) => call("PATCH", { index: i, sec: e.target.value })}
                  aria-label={st.newSec}
                  className="mt-1.5 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-[16px] sm:text-[13px]"
                >
                  <option value="">{st.none}</option>
                  {sections.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.label}
                    </option>
                  ))}
                </select>
              )}
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex gap-1">
                  <button type="button" disabled={i === 0} onClick={() => call("PATCH", { from: i, to: i - 1 })} className="rounded-lg p-1.5 text-muted hover:bg-cream disabled:opacity-30" aria-label="←">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button type="button" disabled={i === items.length - 1} onClick={() => call("PATCH", { from: i, to: i + 1 })} className="rounded-lg p-1.5 text-muted hover:bg-cream disabled:opacity-30" aria-label="→">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <button type="button" onClick={() => call("DELETE", { index: i })} className="rounded-lg p-1.5 text-muted hover:bg-[#fdecea] hover:text-danger" aria-label={t.portfolioRemove}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={"u" + i} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-cream text-[13px] text-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
            {t.portfolioUploading}
          </div>
        ))}
        {items.length + uploading < MAX && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-cream text-[14px] text-muted hover:border-brand hover:text-brand"
          >
            <Plus className="h-7 w-7" />
            {t.portfolioAdd}
          </button>
        )}
      </div>
      {err && <p className="mt-2 text-[13px] text-danger">{err}</p>}
      <input ref={input} type="file" multiple accept="image/*" className="hidden" onChange={(e) => add(e.target.files)} />
    </section>
  );
}
