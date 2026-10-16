import "server-only";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import { normalizePhone } from "./phone";
import type { Place } from "./places";

/*
 * Дополнение базы мест результатами проверки (CSV от ассистента или редактора).
 * Колонки: id, work_status, name_ru, addr_ru, phones, site, instagram, facebook, other_links, hours, desc_ru, desc_en, tags, sources, checked
 */

export const ENRICH_HEADER = ["id", "work_status", "name_ru", "addr_ru", "phones", "site", "instagram", "facebook", "other_links", "hours", "desc_ru", "desc_en", "tags", "sources", "checked"] as const;

/** Простой разбор CSV (запятая или точка с запятой, кавычки, переносы строк внутри кавычек). */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split("\n")[0] ?? "";
  const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (q) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(esc).join(",")).join("\n");
}

const split = (s: string) => s.split(/[;\n|]+|\s+(?=https?:\/\/)/).map((x) => x.trim()).filter(Boolean);
const isUrl = (s: string) => /^https?:\/\/\S+\.\S+/i.test(s);
const hasGeorgian = (s: string) => /[Ⴀ-ჿ]/.test(s);
const CLOSED = /закрыт|closed|не работает/i;
const OPEN = /работает|open|active/i;

/** Применить CSV. Возвращает отчёт. Поля, которые редактор правил вручную (edited), не перезаписываются — только пустые заполняются. */
export async function applyEnrichment(csv: string): Promise<{ updated: number; closed: number; unknownIds: string[]; badRows: number }> {
  const rows = parseCsv(csv);
  if (!rows.length) return { updated: 0, closed: 0, unknownIds: [], badRows: 0 };
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => head.indexOf(name);
  if (col("id") < 0) throw new Error("В файле нет колонки id — используйте шапку из задания");
  const get = (r: string[], name: string) => (col(name) >= 0 ? (r[col(name)] ?? "").trim() : "");

  const sb = supabase();
  const local = sb ? null : dbMode() === "none" ? null : await readLocal();
  const fetchPlace = async (id: string): Promise<Place | null> => {
    if (sb) return ((await sb.from("places").select("*").eq("id", id).maybeSingle()).data as Place) ?? null;
    return local?.places?.find((p) => p.id === id) ?? null;
  };

  let updated = 0;
  let closed = 0;
  let badRows = 0;
  const unknownIds: string[] = [];
  const now = new Date().toISOString();
  for (const r of rows.slice(1)) {
    const id = get(r, "id");
    if (!id) {
      badRows++;
      continue;
    }
    const p = await fetchPlace(id);
    if (!p) {
      unknownIds.push(id);
      continue;
    }
    const keep = (field: keyof Place) => p.edited && p[field] != null && !(Array.isArray(p[field]) && (p[field] as unknown[]).length === 0) && p[field] !== "";
    const patch: Partial<Place> = { updated_at: now };
    const set = <K extends keyof Place>(k: K, v: Place[K] | null | undefined) => {
      if (v == null || v === "" || (Array.isArray(v) && !v.length)) return;
      if (keep(k)) return;
      patch[k] = v;
    };
    const ws = get(r, "work_status");
    if (ws) patch.work_status = CLOSED.test(ws) ? "закрыто" : OPEN.test(ws) ? "работает" : "не найдено";
    if (patch.work_status === "закрыто") {
      patch.status = "hidden";
      closed++;
    }
    const nameRu = get(r, "name_ru");
    if (nameRu && !keep("name") && nameRu !== p.name) {
      if (hasGeorgian(p.name) && !p.name_ka) patch.name_ka = p.name;
      else if (!p.name_en && /^[\x20-\x7E]+$/.test(p.name)) patch.name_en = p.name;
      patch.name = nameRu.slice(0, 160);
    }
    set("addr", get(r, "addr_ru").slice(0, 200) || null);
    const phones = split(get(r, "phones")).map((x) => normalizePhone(x)).filter((x): x is string => !!x);
    set("phones", phones.length ? [...new Set(phones)].slice(0, 5) : null);
    const site = get(r, "site");
    set("site", isUrl(site) ? site : null);
    const ig = get(r, "instagram");
    set("ig", isUrl(ig) && /instagram\.com/i.test(ig) ? ig : null);
    const socials = [get(r, "facebook"), ...split(get(r, "other_links"))].filter(isUrl);
    if (socials.length) set("socials", [...new Set([...socials, ...(p.socials ?? [])])].slice(0, 6));
    set("hours", get(r, "hours").slice(0, 200) || null);
    set("desc_ru", get(r, "desc_ru").slice(0, 2000) || null);
    set("desc_en", get(r, "desc_en").slice(0, 2000) || null);
    const tags = split(get(r, "tags").replace(/,/g, ";")).map((t) => t.toLowerCase()).slice(0, 20);
    if (tags.length) patch.tags = [...new Set([...(p.tags ?? []), ...tags])];
    const src = split(get(r, "sources")).filter(isUrl);
    if (src.length) patch.links = [...new Set([...src, ...(p.links ?? [])])].slice(0, 8);
    patch.checked = (get(r, "checked") || now).slice(0, 10);
    if (Object.keys(patch).length <= 2) continue;
    if (sb) {
      const res = await sb.from("places").update(patch).eq("id", id);
      if (res.error) {
        // колонок tags/work_status ещё нет — пробуем без них
        delete patch.tags;
        delete patch.work_status;
        const res2 = await sb.from("places").update(patch).eq("id", id);
        if (res2.error) throw new Error(res2.error.message);
      }
    } else if (local) {
      local.places = (local.places ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x));
    }
    updated++;
  }
  if (local) await writeLocal(local);
  return { updated, closed, unknownIds, badRows };
}
