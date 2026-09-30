import { MEDICAL_CATEGORIES } from "./categories";
import type { Master } from "./types";

/** Категории, где образование и документы обязательны. */
const CREDENTIALS_REQUIRED = [...MEDICAL_CATEGORIES, "lawyer", "accountant"];

export type StepId = "verified" | "photo" | "about" | "services" | "price" | "languages" | "credentials" | "portfolio" | "where" | "documents";
export type Step = { id: StepId; done: boolean };

/** Шаги заполнения профиля и готовность в процентах. */
export function profileSteps(m: Master): { steps: Step[]; percent: number; missing: StepId[] } {
  const steps: Step[] = [
    { id: "verified", done: !!(m.phone_verified_at || m.tg_verified_at) },
    { id: "photo", done: !!m.photo_url },
    { id: "about", done: (m.about ?? "").trim().length >= 40 },
    { id: "services", done: (m.services ?? "").split(/\n/).filter((s) => s.trim()).length >= 2 },
    { id: "price", done: m.price_from != null },
    { id: "languages", done: (m.languages ?? []).length > 0 },
    { id: "portfolio", done: (m.portfolio ?? []).length >= 3 },
    {
      id: "where",
      done:
        m.work_mode === "online" ||
        (m.work_mode === "at_client" && (m.service_area ?? "").trim().length > 1) ||
        ((m.work_mode === "at_place" || m.work_mode === "both") && m.place_lat != null),
    },
  ];
  if (CREDENTIALS_REQUIRED.includes(m.category)) {
    steps.push({ id: "credentials", done: (m.credentials ?? "").trim().length >= 5 });
    steps.push({ id: "documents", done: (m.documents ?? []).some((d) => d.status !== "rejected") });
  }
  const done = steps.filter((s) => s.done).length;
  return { steps, percent: Math.round((done / steps.length) * 100), missing: steps.filter((s) => !s.done).map((s) => s.id) };
}
