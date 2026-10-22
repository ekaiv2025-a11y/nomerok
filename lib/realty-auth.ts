import "server-only";
import { adminGetMaster } from "./db";
import { currentSpecialistId } from "./spec-auth";
import type { Master } from "./types";

export const isRealtor = (m: Pick<Master, "category" | "extra_categories">) => m.category === "realtor" || (m.extra_categories ?? []).includes("realtor");

/** Вошедший специалист-риелтор (или null). */
export async function currentRealtor(): Promise<Master | null> {
  const id = await currentSpecialistId();
  if (!id) return null;
  const m = await adminGetMaster(id);
  return m && isRealtor(m) && m.status !== "rejected" ? m : null;
}
