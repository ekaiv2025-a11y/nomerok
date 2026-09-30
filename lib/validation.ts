import { z } from "zod";
import { CATEGORY_IDS, LANGUAGES, PRICE_UNITS } from "./categories";
import { normalizePhone, normalizeTelegram } from "./phone";
import { getDict, isLocale, type Locale } from "./i18n";

/** Язык из тела запроса формы (по умолчанию русский). */
export function langFromBody(body: unknown): Locale {
  const l = (body as { lang?: unknown } | null)?.lang;
  return isLocale(l) ? l : "ru";
}

/** Явно ненастоящий номер: 00 00 00, 11 11 11, 12 34 56 и т.п. в конце. */
export function isFakePhone(p: string): boolean {
  const d = p.replace(/\D/g, "");
  const tail = d.slice(-6);
  return /^(\d)\1{5}$/.test(tail) || tail === "123456" || tail === "654321";
}

function phone(lang: Locale) {
  const e = getDict(lang).errors;
  return z
    .string({ message: e.phoneRequired })
    .trim()
    .min(1, e.phoneRequired)
    .transform((v, ctx) => {
      const p = normalizePhone(v);
      if (!p || isFakePhone(p)) {
        ctx.addIssue({ code: "custom", message: e.phoneInvalid });
        return z.NEVER;
      }
      return p;
    });
}

/** Общие поля защиты от ботов: пустое скрытое поле и время заполнения. */
const antiSpam = {
  website: z.string().max(0).optional().or(z.literal("")).nullable(),
  startedAt: z.coerce.number().optional(),
  lang: z.string().optional(),
};

export function requestSchema(lang: Locale) {
  const e = getDict(lang).errors;
  return z.object({
    category: z.enum(CATEGORY_IDS, { message: e.category }),
    description: z.string({ message: e.describeMore }).trim().min(10, e.describeMore).max(2000),
    when_text: z.string().trim().max(100).nullable().optional().transform((v) => v ?? ""),
    name: z.string().trim().max(80).nullable().optional().transform((v) => v ?? ""),
    phone: phone(lang),
    master_slug: z.string().trim().max(80).optional().or(z.literal("")),
    ...antiSpam,
  });
}

export function masterApplicationSchema(lang: Locale) {
  const e = getDict(lang).errors;
  return z.object({
    name: z.string({ message: e.name }).trim().min(2, e.name).max(80),
    category: z.enum(CATEGORY_IDS, { message: e.direction }),
    services: z.string({ message: e.services }).trim().min(5, e.services).max(1500),
    about: z.string().trim().max(2000).nullable().optional().transform((v) => v ?? ""),
    credentials: z.string().trim().max(1000).nullable().optional().transform((v) => v ?? ""),
    experience_years: z.coerce.number().int().min(0).max(70).nullable().optional(),
    languages: z.array(z.enum(LANGUAGES)).default([]),
    price_from: z.coerce.number().int().min(0).max(100000).nullable().optional(),
    price_unit: z.enum(PRICE_UNITS).default("час"),
    phone: phone(lang),
    telegram: z
      .string()
      .trim()
      .max(64)
      .nullable()
      .optional()
      .transform((v, ctx) => {
        if (!v) return null;
        const t = normalizeTelegram(v);
        if (!t) {
          ctx.addIssue({ code: "custom", message: e.telegram });
          return z.NEVER;
        }
        return t;
      }),
    whatsapp: z.boolean().default(true),
    consent: z.literal(true, { message: e.consent }),
    ...antiSpam,
  });
}

export function firstErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function feedbackSchema(lang: Locale) {
  const e = getDict(lang).errors;
  return z.object({
    name: z.string().trim().max(80).nullable().optional().transform((v) => v ?? ""),
    contact: z.string({ message: e.contact }).trim().min(3, e.contact).max(120),
    message: z.string({ message: e.message }).trim().min(5, e.message).max(3000),
    ...antiSpam,
  });
}

/** Кабинет специалиста: те же поля, что в анкете, но без телефона и согласия. */
export function cabinetSchema(lang: Locale) {
  const base = masterApplicationSchema(lang);
  return base.omit({ phone: true, consent: true, website: true, startedAt: true, category: true }).extend({
    notify_requests: z.boolean().default(true),
  });
}
