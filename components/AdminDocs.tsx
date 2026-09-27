import { setDocumentStatus } from "@/app/admin/actions";
import type { MasterDocument } from "@/lib/types";

const KIND = { diploma: "Диплом", certificate: "Сертификат", license: "Лицензия", other: "Другое" } as const;
const STATUS = { pending: "На проверке", verified: "Проверен", rejected: "Не принят" } as const;

/** Админка: список документов специалиста с кнопками «Проверено / Не принят». */
export function AdminDocs({ masterId, docs, urls, back }: { masterId: string; docs: MasterDocument[]; urls: Record<string, string>; back: string }) {
  return (
    <ul className="space-y-2">
      {docs.map((d) => (
        <li key={d.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${d.status === "pending" ? "border-accent" : "border-line"}`}>
          {d.type === "image" && urls[d.path] ? (
            <a href={urls[d.path]} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urls[d.path]} alt="" className="h-16 w-16 rounded-lg object-cover" />
            </a>
          ) : (
            <a href={urls[d.path]} target="_blank" rel="noopener noreferrer" className="flex h-16 w-16 items-center justify-center rounded-lg bg-cream text-[12px]">
              📄 PDF
            </a>
          )}
          <div className="min-w-0 flex-1 text-[14px]">
            <a href={urls[d.path]} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
              {d.title}
            </a>
            <div className="text-[12px] text-muted">
              {KIND[d.kind]} · {STATUS[d.status]} · {d.public ? "показывать клиентам" : "только для проверки"} · {new Date(d.uploaded_at).toLocaleDateString("ru-RU")}
            </div>
          </div>
          <div className="flex gap-2">
            {(["verified", "rejected"] as const)
              .filter((s) => s !== d.status)
              .map((s) => (
                <form key={s} action={setDocumentStatus}>
                  <input type="hidden" name="masterId" value={masterId} />
                  <input type="hidden" name="docId" value={d.id} />
                  <input type="hidden" name="status" value={s} />
                  <input type="hidden" name="back" value={back} />
                  <button className={s === "verified" ? "btn-primary h-9 px-3 text-[13px]" : "btn-ghost h-9 px-3 text-[13px]"}>
                    {s === "verified" ? "✓ Проверено" : "Не принят"}
                  </button>
                </form>
              ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
