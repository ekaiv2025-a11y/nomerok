import { z } from "zod";
import { CATEGORY_IDS, LANGUAGES, PRICE_UNITS } from "./categories";
import { normalizePhone, normalizeTelegram } from "./phone";

const phone = z
  .string()
  .trim()
  .min(1, "Укажите телефон")
  .transform((v, ctx) => {
    const p = normalizePhone(v);
    if (!p) {
      ctx.addIssue({ code: "custom", message: "Проверьте номер: например, 555 12 34 56" });
      return z.NEVER;
    }
    return p;
  });

/** Общие поля защиты от ботов: пустое скрытое поле и время заполнения. */
const antiSpam = {
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.coerce.number().optional(),
};

export const requestSchema = z.object({
  category: z.enum(CATEGORY_IDS, { message: "Выберите, кто нужен" }),
  description: z.string().trim().min(10, "Опишите задачу чуть подробнее (от 10 символов)").max(2000),
  when_text: z.string().trim().max(100).default(""),
  name: z.string().trim().max(80).default(""),
  phone,
  master_slug: z.string().trim().max(80).optional().or(z.literal("")),
  ...antiSpam,
});

export const masterApplicationSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(80),
  category: z.enum(CATEGORY_IDS, { message: "Выберите направление" }),
  services: z.string().trim().min(5, "Перечислите хотя бы одну услугу").max(1500),
  about: z.string().trim().max(2000).default(""),
  credentials: z.string().trim().max(1000).default(""),
  experience_years: z.coerce.number().int().min(0).max(70).nullable().optional(),
  languages: z.array(z.enum(LANGUAGES)).default([]),
  price_from: z.coerce.number().int().min(0).max(100000).nullable().optional(),
  price_unit: z.enum(PRICE_UNITS).default("час"),
  phone,
  telegram: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((v, ctx) => {
      if (!v) return null;
      const t = normalizeTelegram(v);
      if (!t) {
        ctx.addIssue({ code: "custom", message: "Ник в Telegram — латиницей, например @ivan_master" });
        return z.NEVER;
      }
      return t;
    }),
  whatsapp: z.boolean().default(true),
  consent: z.literal(true, { message: "Нужно согласие на публикацию" }),
  ...antiSpam,
});

export function firstErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
