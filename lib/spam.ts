import "server-only";
import { supabase } from "./db";

/*
 * Защита заявок и сообщений специалистам от спама (вербовщики «удалённой работы», крипта, рассылки).
 * Признаки: контакты в тексте (@ник, почта, ссылки), типичные слова, одинаковый текст разным специалистам,
 * номер, который специалист уже пометил как спам. Спам сохраняется со статусом spam и никому не уходит.
 */
const CONTACTS = [
  /(^|[\s:(])@[a-z0-9_]{4,}/i, // Telegram-ник
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, // почта
  /[a-z0-9._-]+\.gmail\.com|gmail\b/i,
  /https?:\/\/|www\.|t\.me\/|wa\.me\/|bit\.ly/i,
];
const WORDS =
  /recruit|hiring|we are looking for|remote (work|job|position|opportunit)|work from home|ai training|evaluation opportunit|send\s+["“']?interested|if interested|pay (may )?vary|per hour|earn (up to|\$)|passive income|investment|crypto|bitcoin|usdt|forex|trading signal|telegram:|whatsapp:|удал[её]нн[а-я]* (работ|занятост)|подработк|заработ(ок|ать) от|пассивн[а-я]* доход|инвестиц|крипт|биткоин|арбитраж|вакансия|ищем сотрудник|набираем|ставки на спорт|казино|кредит без/i;

export function spamReasons(text: string, name = ""): string[] {
  // Оценка: слова рассылки — 2, контакты в тексте — 1, длинный текст латиницей — 1. Спам — от 2.
  // Один только @ник клиента («пишите в телеграм @…») спамом не считается.
  const t = `${name}\n${text}`;
  const out: string[] = [];
  let score = 0;
  const w = t.match(WORDS);
  if (w) {
    score += 2;
    out.push(`слова рассылки («${w[0]}»)`);
  }
  if (CONTACTS.some((r) => r.test(text))) {
    score += 1;
    out.push("контакты в тексте (@ник, почта или ссылка)");
  }
  const lat = (text.match(/[a-z]/gi) ?? []).length;
  const loc = (text.match(/[а-яёა-ჰ]/gi) ?? []).length;
  if (text.length > 150 && lat > loc * 2) {
    score += 1;
    out.push("длинный текст латиницей");
  }
  return score >= 2 ? out : [];
}

const digits = (p: string) => (p ?? "").replace(/\D/g, "").slice(-9);

export async function isBlockedPhone(phone: string): Promise<boolean> {
  const d = digits(phone);
  const sb = supabase();
  if (!sb || d.length < 7) return false;
  const r = await sb.from("_nm_once").select("key").eq("key", `block:${d}`).maybeSingle();
  return !!r.data;
}

export async function blockPhone(phone: string) {
  const d = digits(phone);
  const sb = supabase();
  if (!sb || d.length < 7) return;
  await sb.from("_nm_once").insert({ key: `block:${d}` }).then(() => null, () => null);
}

/** Тот же текст уже отправляли за сутки (рассылка по многим специалистам). */
export async function sameTextRecent(text: string): Promise<number> {
  const sb = supabase();
  if (!sb || text.trim().length < 40) return 0;
  const since = new Date(Date.now() - 86400000).toISOString();
  const r = await sb.from("requests").select("id", { count: "exact", head: true }).eq("description", text).gte("created_at", since);
  return r.count ?? 0;
}
