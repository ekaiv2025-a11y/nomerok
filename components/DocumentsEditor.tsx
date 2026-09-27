"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { getDict, type Locale } from "@/lib/i18n";
import { resizeImage } from "@/lib/image-resize";
import type { DocKind, DocStatus } from "@/lib/types";

export type CabinetDoc = { id: string; title: string; kind: DocKind; type: "image" | "pdf"; public: boolean; status: DocStatus; url: string | null };

const KINDS: DocKind[] = ["diploma", "certificate", "license", "other"];
const STATUS_STYLE: Record<DocStatus, string> = {
  pending: "bg-[#fdf6e6] text-[#5a4a22]",
  verified: "bg-brand-soft text-brand-dark",
  rejected: "bg-[#fdecea] text-danger",
};

/** Кабинет: дипломы, сертификаты, лицензии. */
export function DocumentsEditor({ lang, initial }: { lang: Locale; initial: CabinetDoc[] }) {
  const t = getDict(lang).cabinet;
  const router = useRouter();
  const [docs, setDocs] = useState<CabinetDoc[]>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<DocKind>("diploma");
  const [pub, setPub] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function upload() {
    setErr("");
    if (!file) return setErr(t.docsNeedFile);
    if (title.trim().length < 2) return setErr(t.docsNeedName);
    setBusy(true);
    const f = file.type.startsWith("image/") ? await resizeImage(file, 2200, 0.9) : file;
    const fd = new FormData();
    fd.set("file", f);
    fd.set("title", title);
    fd.set("kind", kind);
    fd.set("public", String(pub));
    fd.set("lang", lang);
    const res = await fetch("/api/cabinet/documents", { method: "POST", body: fd }).catch(() => null);
    const j = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!j.ok) return setErr(j.error || getDict(lang).form.sendError);
    setFile(null);
    setTitle("");
    if (input.current) input.current.value = "";
    router.refresh();
    setDocs((cur) => [...cur, ...j.documents.filter((d: CabinetDoc) => !cur.some((c) => c.id === d.id)).map((d: CabinetDoc) => ({ ...d, url: null }))]);
  }

  async function call(method: "PATCH" | "DELETE", body: Record<string, unknown>) {
    const res = await fetch("/api/cabinet/documents", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, lang }) }).catch(() => null);
    const j = res ? await res.json().catch(() => ({})) : {};
    if (!j.ok) return setErr(getDict(lang).form.sendError);
    setDocs((cur) =>
      j.documents.map((d: CabinetDoc) => ({ ...d, url: cur.find((c) => c.id === d.id)?.url ?? null })),
    );
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-line p-5">
      <h2 className="text-[18px] font-bold">{t.docsTitle}</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.docsHint}</p>

      {docs.length > 0 && (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 p-3">
              <FileText className="h-5 w-5 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                    {d.title}
                  </a>
                ) : (
                  <span className="font-semibold">{d.title}</span>
                )}
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="text-muted">{t.kinds[d.kind]}</span>
                  <span className={`rounded-full px-2 py-0.5 ${STATUS_STYLE[d.status]}`}>{t.docsStatus[d.status]}</span>
                </div>
                <label className="mt-1.5 flex items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={d.public} onChange={(e) => call("PATCH", { id: d.id, public: e.target.checked })} className="h-4 w-4 accent-[#1f6b4f]" />
                  {t.docsPublic}
                </label>
              </div>
              <button type="button" onClick={() => call("DELETE", { id: d.id })} className="rounded-lg p-2 text-muted hover:bg-[#fdecea] hover:text-danger" aria-label={t.docsDelete}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {docs.length < 10 ? (
        <div className="mt-4 space-y-3 rounded-xl bg-cream p-4">
          <p className="text-[14px] font-semibold">{t.docsAdd}</p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => input.current?.click()} className="btn-ghost h-10 bg-white px-4 text-[14px]">
              <Upload className="h-4 w-4" /> {t.docsChoose}
            </button>
            <span className="min-w-0 truncate text-[13px] text-muted">{file ? file.name : t.docsFileHint}</span>
            <input
              ref={input}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (f && !title) setTitle(f.name.replace(/\.\w+$/, "").slice(0, 80));
              }}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
            <label className="block">
              <span className="text-[13px] font-semibold">{t.docsName}</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder={t.docsNamePlaceholder} className="field mt-1 bg-white" />
            </label>
            <label className="block">
              <span className="text-[13px] font-semibold">{t.docsKind}</span>
              <select value={kind} onChange={(e) => setKind(e.target.value as DocKind)} className="field mt-1 bg-white">
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t.kinds[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} className="h-4 w-4 accent-[#1f6b4f]" />
            {t.docsPublic}
          </label>
          <p className="text-[12px] leading-snug text-muted">{t.docsPrivacy}</p>
          {err && <p className="text-[13px] text-danger">{err}</p>}
          <button type="button" onClick={upload} disabled={busy} className="btn-primary h-11 w-full">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} {busy ? t.docsUploading : t.docsSend}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-muted">{t.docsFull}</p>
      )}
    </section>
  );
}
