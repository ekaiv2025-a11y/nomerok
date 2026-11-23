import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentDev, ownsDev } from "@/lib/dev-auth";
import { getDevProject, saveUnits, setUnitStatus } from "@/lib/dev-projects-db";
import type { UnitStatus } from "@/lib/dev-projects";

const num = (v: unknown, max: number) => {
  if (v === "" || v == null) return null;
  const n = Number(String(v).replace(/[\s,]/g, "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 && n <= max ? n : null;
};
const int = (v: unknown, min: number, max: number) => {
  if (v === "" || v == null) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};
const ST: UnitStatus[] = ["free", "reserved", "sold"];

async function own(projectId: unknown) {
  const who = await currentDev();
  if (!who) return null;
  const d = await getDevProject(String(projectId ?? ""));
  return d && ownsDev(who, d) ? d : null;
}

/** Сохранить таблицу квартир целиком. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const d = await own(b?.projectId);
  if (!d) return NextResponse.json({ ok: false, error: "Нет доступа" }, { status: 403 });
  const list = (Array.isArray(b.units) ? b.units : []).slice(0, 3000);
  const units = list.map((u: Record<string, unknown>) => ({
    id: typeof u.id === "string" ? u.id : undefined,
    building: String(u.building ?? "").trim().slice(0, 20),
    floor: int(u.floor, -3, 150),
    number: String(u.number ?? "").trim().slice(0, 20),
    rooms: int(u.rooms, 0, 10),
    area: num(u.area, 5000),
    price: num(u.price, 100_000_000),
    currency: (u.currency === "GEL" ? "GEL" : "USD") as "USD" | "GEL",
    status: (ST.includes(u.status as UnitStatus) ? u.status : "free") as UnitStatus,
    plan_url: typeof u.plan_url === "string" && /^https:\/\/\S+$/.test(u.plan_url) ? u.plan_url.slice(0, 600) : null,
  }));
  try {
    const n = await saveUnits(d.id, units);
    if (d.mod_status === "published") revalidatePath(`/ru/novostroyki/${d.linked_slug ?? d.slug}`);
    return NextResponse.json({ ok: true, saved: n });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Ошибка" }, { status: 500 });
  }
}

/** Статус одной квартиры — одной кнопкой. */
export async function PATCH(req: Request) {
  const b = await req.json().catch(() => null);
  const d = await own(b?.projectId);
  if (!d || !ST.includes(b?.status)) return NextResponse.json({ ok: false }, { status: 403 });
  await setUnitStatus(d.id, String(b.unitId), b.status);
  if (d.mod_status === "published") revalidatePath(`/ru/novostroyki/${d.linked_slug ?? d.slug}`);
  return NextResponse.json({ ok: true });
}
