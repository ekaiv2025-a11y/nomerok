import "server-only";
import { allProjects } from "./projects-all";
import { publishedDevProjects, unitsCreatedSince, unitsOf } from "./dev-projects-db";
import { unitsSummary, roomsLabel } from "./dev-projects";
import { activeAlerts, recordPrice, updateAlert, type ReAlert } from "./realty-extras-db";
import { escapeHtml, sendTo } from "./telegram";
import { SITE_URL } from "./site";
import { cityLabel } from "./cities";
import { fmtMoney } from "./projects";
import { LISTING_DAYS, priceLabel, type Listing } from "./realty";

const today = () => new Date(Date.now() + 4 * 3600_000).toISOString().slice(0, 10);

/** Раз в день: цена за м² и самая дешёвая квартира по каждому ЖК — для графика «Как менялась цена». */
export async function recordProjectPrices(): Promise<number> {
  const devs = await publishedDevProjects().catch(() => []);
  const bySlug = new Map(devs.map((d) => [d.linked_slug ?? d.slug, d]));
  let n = 0;
  for (const p of await allProjects()) {
    const d = bySlug.get(p.slug);
    if (d) {
      const s = unitsSummary(await unitsOf(d.id).catch(() => []));
      if (s.total && (s.perM2 || s.from)) n += Number(await recordPrice({ slug: p.slug, day: today(), per_m2: s.perM2, from_price: s.from, free_units: s.free }).catch(() => false));
    } else if (p.price?.perM2 || p.price?.from) {
      // цена из описания редакции — только если она в долларах
      if ((p.price.currency ?? "USD") === "USD") n += Number(await recordPrice({ slug: p.slug, day: today(), per_m2: p.price.perM2 ?? null, from_price: p.price.from ?? null, free_units: null }).catch(() => false));
    }
  }
  if (n) {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/[lang]/novostroyki/[slug]", "page");
  }
  return n;
}

const DEAL_WORD: Record<string, string> = { sale: "купить", rent: "снять", daily: "посуточно", pledge: "под залог" };
export const alertText = (a: Pick<ReAlert, "city" | "rooms" | "max_price" | "project"> & { deal?: string }, projectName?: string) =>
  [a.deal && a.deal !== "sale" ? DEAL_WORD[a.deal] : "", projectName ? `ЖК ${projectName}` : a.city ? cityLabel(a.city, "ru") : "вся Грузия", a.rooms != null ? roomsLabel(a.rooms).toLowerCase() : "", a.max_price ? `до ${a.deal && a.deal !== "sale" ? a.max_price.toLocaleString("ru-RU") : fmtMoney(a.max_price)}` : ""].filter(Boolean).join(", ");

/** Раз в день: новые свободные квартиры от застройщиков и новые объявления о продаже — подписчикам по их фильтру. */
export async function sendRealtyAlerts(): Promise<number> {
  const alerts = await activeAlerts().catch(() => []);
  if (!alerts.length) return 0;
  const oldest = alerts.reduce((m, a) => Math.min(m, Date.parse(a.last_sent_at ?? a.created_at)), Date.now());
  const since = new Date(oldest).toISOString();
  const [units, devs, projects] = await Promise.all([unitsCreatedSince(since).catch(() => []), publishedDevProjects().catch(() => []), allProjects()]);
  const devById = new Map(devs.map((d) => [d.id, d]));
  const pBySlug = new Map(projects.map((p) => [p.slug, p]));
  const { listListings } = await import("./realty-db");
  const listings: Listing[] = [];
  for (const deal of [...new Set(alerts.map((a) => a.deal || "sale"))])
    for (let page = 1; page <= 5; page++) {
      const r = await listListings({ deal, page }).catch(() => ({ items: [] as Listing[], total: 0 }));
      listings.push(...r.items);
      if (r.items.length < 24) break;
    }
  // момент публикации объявления = срок окончания − 60 дней
  const publishedAt = (l: Listing) => (l.expires_at ? Date.parse(l.expires_at) - LISTING_DAYS * 86400_000 : Date.parse(l.created_at));
  let sent = 0;
  for (const a of alerts) {
    if (!a.chat_id) continue;
    const from = Date.parse(a.last_sent_at ?? a.created_at);
    const lines: string[] = [];
    for (const u of (a.deal ?? "sale") === "sale" ? units : []) {
      if (Date.parse(u.created_at ?? u.updated_at) <= from) continue;
      const d = devById.get(u.project_id);
      if (!d) continue;
      const slug = d.linked_slug ?? d.slug;
      if (a.project && a.project !== slug) continue;
      if (a.city && d.city !== a.city) continue;
      if (a.rooms != null && u.rooms !== a.rooms) continue;
      if (a.max_price && (!u.price || u.currency !== "USD" || u.price > a.max_price)) continue;
      lines.push(`🏗 ЖК ${escapeHtml(pBySlug.get(slug)?.name ?? d.name)}: ${roomsLabel(u.rooms)}${u.area ? `, ${u.area} м²` : ""}${u.floor != null ? `, ${u.floor} эт.` : ""} — ${u.price ? fmtMoney(u.price, u.currency) : "цена по запросу"}\n${SITE_URL}/ru/novostroyki/${slug}#kvartiry`);
    }
    for (const l of listings) {
      if (l.deal !== (a.deal || "sale")) continue;
      if (publishedAt(l) <= from) continue;
      if (a.project && l.project_slug !== a.project) continue;
      if (a.city && l.city !== a.city) continue;
      if (a.rooms != null && l.rooms !== a.rooms) continue;
      // для аренды цена «до» — в любой валюте объявления (как ввёл человек), для покупки — в долларах
      if (a.max_price && (!l.price || ((a.deal || "sale") === "sale" && l.currency !== "USD") || l.price > a.max_price)) continue;
      lines.push(`🏠 ${escapeHtml(l.title)} — ${escapeHtml(priceLabel(l, "ru"))}\n${SITE_URL}/ru/realty/${l.id}`);
    }
    await updateAlert(a.id, { last_sent_at: new Date().toISOString() }).catch(() => null);
    if (!lines.length) continue;
    const name = a.project ? pBySlug.get(a.project)?.name : undefined;
    const more = lines.length > 8 ? `\n…и ещё ${lines.length - 8}` : "";
    const ok = await sendTo(a.chat_id, `🔔 <b>Новое по вашему фильтру</b> (${escapeHtml(alertText(a, name))}):\n\n${lines.slice(0, 8).join("\n\n")}${more}`, [[{ text: "Отписаться", callback_data: `alx:${a.id}` }]]).catch(() => false);
    if (ok) sent++;
  }
  return sent;
}
