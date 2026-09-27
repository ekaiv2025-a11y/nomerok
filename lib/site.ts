/** Название сайта. Меняется одной переменной NEXT_PUBLIC_SITE_NAME в Vercel. */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Nomerok";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://nomerok.ge").replace(/\/$/, "");
export const SUPPORT_TELEGRAM = (process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM || "").replace(/^@/, "");
export const CITY = "Батуми";
