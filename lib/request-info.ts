import "server-only";
import { headers } from "next/headers";
import { createHash } from "crypto";

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

/** Обезличенный идентификатор посетителя: хеш IP + браузера, сам IP не храним. */
export async function visitorId(): Promise<string> {
  const h = await headers();
  const ip = await clientIp();
  const ua = h.get("user-agent") || "";
  const salt = process.env.ADMIN_PASSWORD || "nomerok";
  return createHash("sha256").update(`${salt}|${ip}|${ua}`).digest("hex").slice(0, 24);
}
