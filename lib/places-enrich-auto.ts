import "server-only";
import { supabase } from "./db";
import { applyEnrichment } from "./places-enrich";
import ENRICH from "@/data/places-enrich.json";

/*
 * Наполнение карточек мест задачей по расписанию: она находит сведения о месте (сайт, соцсети, справочники)
 * и коммитит пачку CSV в data/places-enrich.json. Ежедневный cron применяет каждую пачку один раз
 * (отметка в таблице _nm_once: enrich:<id>). Поля, которые правил редактор, не перезаписываются.
 */
type Batch = { id: string; csv: string };

export async function applyCommittedEnrichment(): Promise<{ batches: number; updated: number; closed: number }> {
  const sb = supabase();
  const out = { batches: 0, updated: 0, closed: 0 };
  if (!sb) return out;
  for (const b of (ENRICH as { batches: Batch[] }).batches ?? []) {
    if (!b?.id || !b.csv) continue;
    const key = `enrich:${b.id}`;
    const seen = await sb.from("_nm_once").select("key").eq("key", key).maybeSingle();
    if (seen.error || seen.data) continue;
    const r = await applyEnrichment(b.csv);
    await sb.from("_nm_once").insert({ key });
    out.batches++;
    out.updated += r.updated;
    out.closed += r.closed;
  }
  return out;
}

/** id мест, которые уже есть в пачках (ещё не применённых тоже) — чтобы задача не брала их второй раз. */
export function idsInBatches(): Set<string> {
  const ids = new Set<string>();
  for (const b of (ENRICH as { batches: Batch[] }).batches ?? []) for (const line of (b.csv ?? "").split("\n").slice(1)) {
    const id = line.split(/[,;]/)[0]?.replace(/"/g, "").trim();
    if (id) ids.add(id);
  }
  return ids;
}
