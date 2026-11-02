import "server-only";
import { dbMode, readLocal, supabase, writeLocal } from "./db";
import { joinFunnel } from "./join-starts";
import { SITE_URL } from "./site";

/*
 * Воронки: что делают клиенты и специалисты и где останавливаются.
 * Пишем только шаги (открыл страницу, начал форму, отправил, ошибка в поле…), без того, что человек ввёл.
 * Смотреть: админка → «🧭 Воронки». Раз в неделю — сводка в Telegram (cron/daily, по понедельникам).
 */
export const FUNNELS = {
  request: { label: "Заявка клиента", who: "клиенты", page: "/request" },
  message: { label: "Сообщение специалисту", who: "клиенты", page: "/master/…/message" },
  join: { label: "Регистрация специалиста", who: "специалисты", page: "/join" },
  project: { label: "Заявка по новостройке", who: "покупатели", page: "/novostroyki" },
} as const;
export type FunnelId = keyof typeof FUNNELS;
export const isFunnel = (v: unknown): v is FunnelId => typeof v === "string" && v in FUNNELS;

export const EVENTS = ["view", "start", "submit", "error", "done", "abandon", "click", "survey"] as const;
export type FunnelEvent = { created_at: string; visitor: string; sid: string; ev: string; funnel: string | null; path: string | null; props: Record<string, unknown> | null };
type L = { funnel_events?: FunnelEvent[] };

export async function recordEvents(rows: FunnelEvent[]) {
  if (!rows.length) return;
  const sb = supabase();
  if (sb) {
    await sb.from("funnel_events").insert(rows);
    return;
  }
  if (dbMode() === "none") return;
  const d = (await readLocal()) as unknown as L;
  d.funnel_events = [...(d.funnel_events ?? []), ...rows].slice(-20000);
  await writeLocal(d as never);
}

async function loadEvents(days: number): Promise<FunnelEvent[]> {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const sb = supabase();
  if (sb) {
    const out: FunnelEvent[] = [];
    for (let from = 0; from < 200_000; from += 1000) {
      const r = await sb.from("funnel_events").select("created_at,visitor,sid,ev,funnel,path,props").gte("created_at", since).order("created_at", { ascending: true }).range(from, from + 999);
      if (r.error) throw new Error(r.error.message);
      out.push(...((r.data ?? []) as FunnelEvent[]));
      if ((r.data ?? []).length < 1000) break;
    }
    return out;
  }
  if (dbMode() === "none") return [];
  return (((await readLocal()) as unknown as L).funnel_events ?? []).filter((e) => e.created_at >= since);
}

/** Старые события не нужны — чистим раз в день (храним 120 дней). */
export async function pruneEvents() {
  const sb = supabase();
  if (!sb) return;
  await sb.from("funnel_events").delete().lt("created_at", new Date(Date.now() - 120 * 86400_000).toISOString());
}

/** Названия полей форм — чтобы отчёт был понятен. */
export const FIELD_LABEL: Record<string, string> = {
  category: "Кого ищете / направление",
  description: "Описание задачи",
  when_text: "Когда",
  name: "Имя",
  phone: "Телефон",
  contact: "Телефон или Telegram",
  city: "Город",
  telegram: "Telegram",
  email: "Почта",
  services: "Услуги",
  about: "О себе",
  experience_years: "Опыт",
  price_from: "Цена",
  photo: "Фото",
  languages: "Языки",
  budget: "Бюджет",
  rooms: "Комнат",
  goal: "Для чего",
  comment: "Комментарий",
  place_address: "Адрес",
  service_area: "Район выезда",
  work_hours: "Часы работы",
  _none: "не дошёл до полей",
};
export const fieldLabel = (f: string) => FIELD_LABEL[f] ?? f;


type Step = { key: string; label: string; n: number };
export type FunnelReport = {
  id: FunnelId;
  label: string;
  steps: Step[];
  device: { mobile: [number, number]; desktop: [number, number] }; // [начали, отправили]
  errors: { field: string; msg: string; n: number }[];
  abandon: { field: string; n: number }[];
  clicks: { name: string; n: number }[];
  survey: { answer: string; n: number }[];
  notes: string[]; // свои слова из «Другое»
  insights: string[];
};
export type FunnelSummary = { days: number; funnels: FunnelReport[]; insights: string[]; total: number };

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const top = (m: Map<string, number>, n = 6) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
const inc = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);

export async function funnelSummary(days = 7): Promise<FunnelSummary> {
  const [all, bot] = await Promise.all([loadEvents(days), joinFunnel(days).catch(() => null)]);
  const funnels: FunnelReport[] = [];
  for (const id of Object.keys(FUNNELS) as FunnelId[]) {
    const ev = all.filter((e) => e.funnel === id);
    const sids = (k: string) => new Set(ev.filter((e) => e.ev === k).map((e) => e.sid));
    const view = sids("view");
    const start = sids("start");
    const submit = sids("submit");
    const done = sids("done");
    const steps: Step[] = [
      { key: "view", label: "Открыли страницу", n: view.size },
      { key: "start", label: "Начали заполнять", n: start.size },
      { key: "submit", label: "Нажали «Отправить»", n: submit.size },
      { key: "done", label: "Отправили успешно", n: done.size },
    ];
    // Регистрация идёт через Telegram-бота: добавляем шаги из бота (поделился номером → открыл анкету)
    if (id === "join") {
      const gate = new Set(ev.filter((e) => e.ev === "click" && /^join_/.test(String(e.props?.name))).map((e) => e.sid));
      steps.splice(1, 0, { key: "gate", label: "Нажали «Через Telegram» / почту / Google", n: gate.size }, ...(bot ? [{ key: "bot", label: "Поделились номером в боте", n: bot.started }, { key: "opened", label: "Открыли анкету", n: bot.opened }] : []));
    }
    const dev = { mobile: [0, 0] as [number, number], desktop: [0, 0] as [number, number] };
    const devOf = new Map<string, "mobile" | "desktop">();
    for (const e of ev) if (e.props?.m != null) devOf.set(e.sid, e.props.m ? "mobile" : "desktop");
    for (const s of start) dev[devOf.get(s) ?? "desktop"][0]++;
    for (const s of done) dev[devOf.get(s) ?? "desktop"][1]++;
    const errs = new Map<string, number>();
    for (const e of ev.filter((x) => x.ev === "error")) {
      const fields = Array.isArray(e.props?.fields) ? (e.props!.fields as string[]) : ["_form"];
      const msgs = Array.isArray(e.props?.msgs) ? (e.props!.msgs as string[]) : [];
      fields.forEach((f, k) => inc(errs, `${f}|${String(msgs[k] ?? (k === 0 ? e.props?.msg ?? "" : "")).slice(0, 80)}`));
    }
    const ab = new Map<string, number>();
    for (const e of ev.filter((x) => x.ev === "abandon" && !done.has(x.sid))) inc(ab, String(e.props?.field ?? "_none"));
    const cl = new Map<string, number>();
    for (const e of ev.filter((x) => x.ev === "click")) inc(cl, String(e.props?.name ?? "?"));
    const sv = new Map<string, number>();
    const notes: string[] = [];
    for (const e of ev.filter((x) => x.ev === "survey")) {
      inc(sv, String(e.props?.answer ?? "?"));
      if (typeof e.props?.text === "string" && e.props.text.trim()) notes.push(e.props.text.trim());
    }
    const r: FunnelReport = {
      id,
      label: FUNNELS[id].label,
      steps,
      device: dev,
      errors: top(errs, 8).map(([k, n]) => ({ field: k.split("|")[0], msg: k.split("|")[1] ?? "", n })),
      abandon: top(ab, 6).map(([field, n]) => ({ field, n })),
      clicks: top(cl, 8).map(([name, n]) => ({ name, n })),
      survey: top(sv, 8).map(([answer, n]) => ({ answer, n })),
      notes: notes.slice(-15).reverse(),
      insights: [],
    };
    r.insights = insightsFor(r);
    funnels.push(r);
  }
  const insights = funnels.flatMap((f) => f.insights.map((x) => `${f.label}: ${x}`));
  return { days, funnels, insights, total: all.length };
}

/** Простые правила: где теряем людей и что поправить первым. */
function insightsFor(f: FunnelReport): string[] {
  const n = (k: string) => f.steps.find((s) => s.key === k)?.n ?? 0;
  const [view, start, submit, done] = ["view", "start", "submit", "done"].map(n);
  const out: string[] = [];
  if (f.id === "join" && view >= 15) {
    const gate = n("gate");
    if (pct(gate, view) < 25) out.push(`на кнопку «Через Telegram» или вход нажимают только ${pct(gate, view)}% открывших страницу регистрации. Объясните выгоду и условия прямо над кнопкой.`);
    const bot = n("bot");
    if (gate >= 5 && bot && pct(bot, gate) < 50) out.push(`из нажавших кнопку до бота и номера телефона доходят ${pct(bot, gate)}%. Возможно, пугает просьба поделиться номером — объясните зачем.`);
  }
  if (view < 15) return view ? [`пока мало данных (${view} открытий страницы) — выводы делать рано`] : [];
  if (f.id !== "join" && pct(start, view) < 20) out.push(`начинают заполнять только ${pct(start, view)}% из открывших страницу. Первый экран не убеждает: проверьте заголовок, понятно ли, что это бесплатно и что будет дальше.`);
  if (start >= 5 && pct(submit, start) < 50) {
    const a = f.abandon[0];
    out.push(`до кнопки «Отправить» доходят ${pct(submit, start)}% начавших.${a ? ` Чаще всего останавливаются на поле «${fieldLabel(a.field)}» (${a.n}).` : ""} Попробуйте убрать или упростить это поле.`);
  }
  if (submit >= 5 && pct(done, submit) < 80) {
    const e = f.errors[0];
    out.push(`после нажатия «Отправить» успешно уходит только ${pct(done, submit)}%.${e ? ` Частая ошибка — «${fieldLabel(e.field)}»${e.msg ? `: «${e.msg}»` : ""} (${e.n}).` : ""} Подсказка у поля должна объяснять, что ввести.`);
  }
  const [ms, md] = f.device.mobile;
  const [ds, dd] = f.device.desktop;
  if (ms >= 8 && ds >= 8 && pct(md, ms) + 20 < pct(dd, ds)) out.push(`с телефона отправляют ${pct(md, ms)}% начавших, с компьютера — ${pct(dd, ds)}%. Проверьте форму на телефоне.`);
  const s = f.survey.filter((x) => x.answer !== "Просто смотрю" && x.answer !== "Пока просто узнаю условия")[0];
  if (s && s.n >= 3) out.push(`самая частая причина в опросе: «${s.answer}» (${s.n}).`);
  return out;
}

/** Короткая сводка для Telegram. */
export function summaryText(s: FunnelSummary): string {
  const lines = [`🧭 <b>Воронки за ${s.days} дней</b>`];
  for (const f of s.funnels) {
    const g = (k: string) => f.steps.find((x) => x.key === k)?.n ?? 0;
    const [v, st, d] = [g("view"), g("start"), g("done")];
    if (!v && !st) continue;
    lines.push(`\n<b>${f.label}</b>: открыли ${v} → начали ${st} (${pct(st, v)}%) → отправили ${d} (${pct(d, st)}% начавших)`);
    for (const i of f.insights) lines.push("• " + i);
    if (f.survey.length) lines.push("Опрос: " + f.survey.slice(0, 3).map((x) => `${x.answer} — ${x.n}`).join("; "));
  }
  lines.push(`\nПодробно: ${SITE_URL}/admin/funnel`);
  return lines.join("\n");
}
