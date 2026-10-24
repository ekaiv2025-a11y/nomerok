import { NextResponse } from "next/server";
import { currentRealtor } from "@/lib/realty-auth";
import { deleteTemplate, saveTemplate } from "@/lib/realty-db";

/* Шаблоны объявлений риелтора: сохранить/переименовать (POST) и удалить (DELETE). */

const KEYS = ["title", "deal", "kind", "rooms", "rooms_total", "area", "floor_n", "floors_total", "bathrooms", "building", "condition", "heating", "parking", "amenities", "price", "currency", "deposit", "min_months", "city", "district", "address", "lat", "lng", "description", "video"];

function clean(data: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!data || typeof data !== "object") return out;
  for (const k of KEYS) {
    const v = (data as Record<string, unknown>)[k];
    if (v == null) continue;
    if (k === "amenities") out[k] = (Array.isArray(v) ? v : []).filter((x) => typeof x === "string").slice(0, 30);
    else if (k === "lat" || k === "lng") out[k] = typeof v === "number" && Number.isFinite(v) ? v : null;
    else out[k] = String(v).slice(0, k === "description" ? 4000 : 300);
  }
  return out;
}

export async function POST(req: Request) {
  const m = await currentRealtor();
  if (!m) return NextResponse.json({ ok: false }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { id?: string; name?: string; data?: unknown };
  const name = String(b.name ?? "").trim().slice(0, 60);
  if (name.length < 2) return NextResponse.json({ ok: false, error: "name" }, { status: 400 });
  const t = await saveTemplate(m.id, { id: b.id, name, data: b.data !== undefined ? clean(b.data) : undefined }).catch(() => undefined);
  if (t === null) return NextResponse.json({ ok: false, error: "limit" }, { status: 400 });
  if (!t) return NextResponse.json({ ok: false, error: "db" }, { status: 500 });
  return NextResponse.json({ ok: true, template: { id: t.id, name: t.name, data: t.data } });
}

export async function DELETE(req: Request) {
  const m = await currentRealtor();
  if (!m) return NextResponse.json({ ok: false }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { id?: string };
  if (b.id) await deleteTemplate(m.id, String(b.id)).catch(() => null);
  return NextResponse.json({ ok: true });
}
